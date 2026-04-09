---
name: implement-figma-shadcn-next16
description: Figma 노드를 Next.js 16 + shadcn/ui 코드로 구현한다. Figma URL 또는 fileKey/nodeId를 지정하면 토큰 체인 해석 → TSX 생성 → 토큰 감사 → 시각 fidelity 검증 → IMPLEMENTATION_REPORT.md 생성까지 전체 워크플로우를 실행한다.
argument-hint: "[Figma URL 또는 fileKey nodeId]"
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep, Agent, mcp__figma__get_metadata, mcp__figma__get_variable_defs, mcp__figma__get_design_context, mcp__figma__get_screenshot]
---

이 커맨드는 `implement-figma-shadcn-next16` skill의 전체 워크플로우를 실행한다.
해당 skill을 즉시 로드하고 아래 지침에 따라 진행하라.

## 진입 처리

**인자가 있는 경우:**
- Figma URL 형식 (`figma.com/...`) → URL에서 fileKey와 nodeId를 파싱한다
- `fileKey nodeId` 형식 → 그대로 사용한다
- fileKey만 있는 경우 → 사용자에게 nodeId를 물어본다

**인자가 없는 경우:**
- 사용자에게 Figma URL 또는 fileKey/nodeId를 요청한다

## 실행 순서

`implement-figma-shadcn-next16` skill의 Step 1 ~ Step 9를 순서대로 실행한다.

스킬의 핵심 규칙을 반드시 준수한다:
- canonical key = `codeSyntax.WEB` (예외 없음)
- 토큰 해석 순서 = `usage → semantic → primitive`
- 모드 분기 = `semantic` 컬렉션에서만

## 출력 위치

사용자가 별도로 지정하지 않으면, 구현 파일과 IMPLEMENTATION_REPORT.md를
현재 디렉토리에 생성한다.

## 예시

```
/figma2shadcn2next:implement-figma-shadcn-next16 https://www.figma.com/design/AbCdEf/Ureca-Shadcn?node-id=123:456
/figma2shadcn2next:implement-figma-shadcn-next16 AbCdEfGhIj 123:456
```
