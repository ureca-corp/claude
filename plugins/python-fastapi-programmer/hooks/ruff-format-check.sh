#!/bin/bash
# PostToolUse hook: Write/Edit 후 Python 파일 ruff format 검사
# 포맷이 맞지 않으면 자동 수정 후 AI에게 알림

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Python 파일이 아니면 스킵
if [[ ! "$FILE_PATH" =~ \.py$ ]]; then
  exit 0
fi

# 마이그레이션 파일은 스킵
if [[ "$FILE_PATH" =~ migrations/versions/ ]]; then
  exit 0
fi

# 파일이 존재하지 않으면 스킵
if [[ ! -f "$FILE_PATH" ]]; then
  exit 0
fi

# ruff format --check (포맷 검사만)
OUTPUT=$(uv run ruff format --check "$FILE_PATH" 2>&1)
EXIT_CODE=$?

if [[ $EXIT_CODE -ne 0 ]]; then
  # 자동 포맷 적용
  uv run ruff format "$FILE_PATH" 2>&1
  echo "Auto-formatted: $FILE_PATH" >&2
  echo "$OUTPUT" >&2
  # exit 0: 자동 수정했으므로 AI에게 에러로 보내지 않음
  exit 0
fi

exit 0
