#!/usr/bin/env python3
"""Fail closed when tracked files contain Telegram credentials or runtime env files.

This scanner intentionally prints only file paths, line numbers, and rule names. It
never prints matched secret values.
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
PUBLIC_TELEGRAM_SECRET_NAME = re.compile(
    r"(?i)\bNEXT_PUBLIC_[A-Z0-9_]*(?:TELEGRAM|BOT)[A-Z0-9_]*(?:TOKEN|SECRET|KEY)\b"
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

SAFE_ENV_EXAMPLES = {".env.example", ".env.sample", ".env.template"}


def tracked_files() -> list[str]:
    proc = subprocess.run(
        ["git", "ls-files", "-z"],
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    return [item.decode("utf-8") for item in proc.stdout.split(b"\0") if item]


def is_runtime_env_file(path: Path) -> bool:
    name = path.name.lower()
    if name in SAFE_ENV_EXAMPLES:
        return False
    return name == ".env" or name.startswith(".env.")


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
        if PUBLIC_TELEGRAM_SECRET_NAME.search(line):
            findings.append((line_number, "public-telegram-secret-variable"))
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

        if is_runtime_env_file(path):
            findings.append((filename, 0, "tracked-runtime-environment-file"))

        for line_number, rule in inspect_file(path):
            findings.append((filename, line_number, rule))

    if findings:
        print("Tracked secret scan failed. Sensitive or unsafe tracked material was found:")
        for filename, line_number, rule in findings:
            location = f"{filename}:{line_number}" if line_number else filename
            print(f"- {location} [{rule}]")
        print("Secret values are intentionally not printed. Remove tracked runtime env files and rotate exposed credentials before release.")
        return 1

    print("Tracked secret scan passed: no tracked runtime env files or Telegram credential patterns detected.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
