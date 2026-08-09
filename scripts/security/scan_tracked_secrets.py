#!/usr/bin/env python3
"""Fail CI when tracked files contain high-confidence secret material.

This scanner is intentionally dependency-free so it can run on GitHub-hosted
runners and locally without a paid service. It never prints detected secret
values; only the file path, line number, and rule name are reported.
"""

from __future__ import annotations

import re
import subprocess
from pathlib import Path

MAX_FILE_BYTES = 1_000_000

# Telegram Bot API tokens are typically numeric bot IDs followed by a colon and
# a long URL-safe token. Keep this rule intentionally strict to limit false
# positives while still catching accidental plaintext commits.
TELEGRAM_TOKEN = re.compile(r"(?<![A-Za-z0-9_])\d{6,12}:[A-Za-z0-9_-]{30,}(?![A-Za-z0-9_-])")
TELEGRAM_URL_TOKEN = re.compile(r"api\.telegram\.org/bot\d{6,12}:[A-Za-z0-9_-]{30,}", re.IGNORECASE)
TELEGRAM_ASSIGNMENT = re.compile(
    r"(?i)\b(?:TELEGRAM_(?:BOT_)?TOKEN|BOT_TOKEN)\b\s*[:=]\s*['\"]?([^\s'\"#]+)"
)

PLACEHOLDER_WORDS = (
    "replace",
    "example",
    "placeholder",
    "your_",
    "your-",
    "changeme",
    "dummy",
    "test-token",
    "<",
)

ALLOWED_ENV_TEMPLATES = {".env.example", ".env.sample", ".env.template"}


def tracked_files() -> list[str]:
    proc = subprocess.run(
        ["git", "ls-files", "-z"],
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    return [item.decode("utf-8") for item in proc.stdout.split(b"\0") if item]


def looks_like_placeholder(value: str) -> bool:
    lowered = value.strip().lower()
    return not lowered or any(word in lowered for word in PLACEHOLDER_WORDS)


def inspect_file(path: Path) -> list[tuple[int, str]]:
    findings: list[tuple[int, str]] = []
    if not path.is_file() or path.stat().st_size > MAX_FILE_BYTES:
        return findings

    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return findings

    for line_number, line in enumerate(text.splitlines(), start=1):
        if TELEGRAM_URL_TOKEN.search(line):
            findings.append((line_number, "telegram-token-in-api-url"))
            continue
        if TELEGRAM_TOKEN.search(line):
            findings.append((line_number, "telegram-bot-token"))
            continue

        assignment = TELEGRAM_ASSIGNMENT.search(line)
        if assignment and not looks_like_placeholder(assignment.group(1)):
            findings.append((line_number, "telegram-token-assignment"))

    return findings


def main() -> int:
    findings: list[tuple[str, int, str]] = []

    for filename in tracked_files():
        path = Path(filename)
        basename = path.name

        # Real environment files must never be tracked. Template files are
        # permitted provided they contain placeholder-only values.
        if basename.startswith(".env") and basename not in ALLOWED_ENV_TEMPLATES:
            findings.append((filename, 0, "tracked-environment-file"))
            continue

        for line_number, rule in inspect_file(path):
            findings.append((filename, line_number, rule))

    if findings:
        print("Secret scan failed. Potential secret material was found:")
        for filename, line_number, rule in findings:
            location = f"{filename}:{line_number}" if line_number else filename
            print(f"- {location} [{rule}]")
        print("Secret values are intentionally not printed. Rotate exposed credentials before merging.")
        return 1

    print("Secret scan passed: no tracked Telegram token patterns or real .env files detected.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
