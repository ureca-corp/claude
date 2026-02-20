#!/bin/bash
# PostToolUse hook: Write/Edit 후 Dart 파일 자동 분석
# stdin으로 JSON input을 받아 file_path 추출 → dart analyze 실행

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Dart 파일이 아니면 스킵
if [[ ! "$FILE_PATH" =~ \.dart$ ]]; then
  exit 0
fi

# generated 파일은 스킵 (.g.dart, .freezed.dart)
if [[ "$FILE_PATH" =~ \.(g|freezed)\.dart$ ]]; then
  exit 0
fi

# dart analyze 실행
OUTPUT=$(dart analyze "$FILE_PATH" 2>&1)
EXIT_CODE=$?

# 에러/경고가 있으면 출력 후 exit 2 (hook 실패 → AI에게 수정 요청)
if echo "$OUTPUT" | grep -qE "error -|warning -|error •|warning •"; then
  echo "$OUTPUT" >&2
  exit 2
fi

exit 0
