#!/usr/bin/env python3
"""Detect tracked Telegram credentials without printing secret values.

The scanner is dependency-free so it can run on GitHub-hosted runners and
locally without a paid service. High-confidence Telegram credential patterns
fail the scan. Tracked runtime environment files are reported as warnings so
this incident gate remains specific and unambiguous.
"""

from __future__ import annotations

import re
import subprocess
from pathlib import Path

MAX_FILE_BYTES = 1_000_000

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

RUNTIME_ENV_FILENAMES = {
    ".env",
    ".env.local",
    ".env.production",
    ".env.production.local",
    ".env.development",
    ".env.development.local",
    ".env.staging",
    ".env.staging.local",
    ".env.preview",
    ".env.preview.local",
}


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
    warnings: list[tuple[str, str]] = []

    for filename in tracked_files():
        path = Path(filename)
        basename = path.name

        if basename in RUNTIME_ENV_FILENAMES:
            warnings.append((filename, "tracked-runtime-environment-file"))

        for line_number, rule in inspect_file(path):
            findings.append((filename, line_number, rule))

    if warnings:
        print("Warnings:")
        for filename, rule in warnings:
            print(f"- {filename} [{rule}]")
        print("Runtime environment files should be reviewed separately; values are not printed.")

    if findings:
        print("Telegram credential scan failed. Potential Telegram credential material was found:")
        for filename, line_number, rule in findings:
            print(f"- {filename}:{line_number} [{rule}]")
        print("Secret values are intentionally not printed. Rotate exposed credentials before merging.")
        return 1

    print("Telegram credential scan passed: no tracked Telegram token patterns detected.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
