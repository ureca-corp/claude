#!/bin/bash
# PostToolUse hook: Write/Edit 후 Python 파일 ruff check 자동 실행
# stdin으로 JSON input을 받아 file_path 추출 → ruff check 실행

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Python 파일이 아니면 스킵
if [[ ! "$FILE_PATH" =~ \.py$ ]]; then
  exit 0
fi

# 마이그레이션 파일은 스킵 (autogenerate된 코드)
if [[ "$FILE_PATH" =~ migrations/versions/ ]]; then
  exit 0
fi

# 파일이 존재하지 않으면 스킵 (삭제된 경우)
if [[ ! -f "$FILE_PATH" ]]; then
  exit 0
fi

# ruff check 실행
OUTPUT=$(uv run ruff check "$FILE_PATH" 2>&1)
EXIT_CODE=$?

if [[ $EXIT_CODE -ne 0 ]]; then
  echo "$OUTPUT" >&2
  exit 2
fi

exit 0
