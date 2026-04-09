---
name: Implement Figma → Next.js 16 + shadcn/ui
description: >
  This skill should be used when the user shares a Figma URL or node and asks to "구현해줘",
  "코드로 만들어줘", "Figma 컴포넌트 구현", "implement this Figma component", "Figma to code",
  "Figma shadcn 변환", "디자인 구현", "Figma 코드 변환", "implement figma design",
  "shadcn으로 구현", "이 피그마 shadcn으로 만들어줘", "피그마 디자인 코드 변환",
  or when the user provides a figma.com URL (with or without an explicit instruction).
  This skill enforces deterministic token chain resolution (usage → semantic → primitive)
  for the Ureca Shadcn team library → Next.js 16 + shadcn/ui workflow, including
  Light/Dark mode fidelity, token auditing via figma-token-auditor, and visual fidelity
  review via figma-fidelity-reviewer.
version: 0.1.0
---

# Implement Figma → Next.js 16 + shadcn/ui

## Purpose

Convert Figma designs from the Ureca Shadcn team library into production-ready
Next.js 16 + shadcn/ui component code with deterministic token chain resolution,
Light/Dark mode fidelity, and visual verification.

## Three Immutable Rules

These rules apply to every implementation without exception:

1. **`codeSyntax.WEB` is the only canonical key** — never use `codeSyntax.ANDROID`, raw hex, or
   variable names directly as class names
2. **Token resolution order: `usage → semantic → primitive`** — always trace the full chain
   before falling back to raw values
3. **Mode branching only in `semantic` collection** — Light/Dark splits happen exclusively at the
   semantic layer; primitives are mode-neutral

Violation of any of these rules is a defect, not a style choice.

---

## Step 1: Verify Figma MCP Connection

Confirm `mcp__figma__get_metadata` is callable before doing anything else. If the tool is
unavailable, stop immediately and inform the user:

> "Figma MCP가 이 세션에서 연결되어 있지 않습니다. ~/.claude/mcp.json 또는 프로젝트
> .mcp.json에 Figma MCP 설정을 확인해주세요."

Do not attempt any Figma reads without MCP access.

---

## Step 2: Parse Figma Input

Extract `fileKey` and `nodeId` from the user input:

- `figma.com/design/:fileKey/:title?node-id=:nodeId` → convert `-` to `:` in nodeId
- `figma.com/design/:fileKey/branch/:branchKey/...` → use branchKey as fileKey
- `figma.com/make/:makeFileKey/:title` → use makeFileKey as fileKey
- If only fileKey given without nodeId → ask the user which node to implement before continuing

---

## Step 3: Read Figma Data

Call all four tools before analysis — do not interleave reads with interpretation:

```
1. mcp__figma__get_metadata(fileKey, nodeId)
   → node name, type, parent frame, dimensions

2. mcp__figma__get_variable_defs(fileKey)
   → all variable collections: usage / semantic / primitive + codeSyntax.WEB for each

3. mcp__figma__get_design_context(fileKey, nodeId)
   → component structure, boundVariables, named styles, fills, strokes, effects

4. mcp__figma__get_screenshot(fileKey, nodeId)
   → visual reference image (save URL/path for fidelity reviewer)
```

**MCP Error Handling:**

If any individual tool call fails:
- `get_metadata` fails → stop; node cannot be identified. Report error and ask user to verify the URL.
- `get_variable_defs` fails → continue without token data. Mark all tokens as unresolved. Use raw values only and note in report.
- `get_design_context` fails → stop; component structure cannot be determined. Report error to user.
- `get_screenshot` fails → continue. Note "automated fidelity review unavailable" in IMPLEMENTATION_REPORT.md.

---

## Step 4: Classify Node — Base Component or Template

Determine the node type before generating any code. See `references/base-vs-template.md`
for full criteria.

**Base component signals:**
- Lives in a component set or is a main component in the team library
- Single, well-defined interaction pattern (Button, Input, Badge, Select, etc.)
- Has defined component properties (variant, size, disabled, icon booleans)

**Template / Example signals:**
- Frame named "Example", "Preview", "Usage", "Demo", "Playground", or similar
- Composition of multiple base components arranged in a page-like layout
- Contains placeholder text, sample data, or lorem ipsum
- No component properties defined

If classified as **template/example**, report before proceeding:

> "⚠️ 이 노드는 base library component가 아닌 example/template composition입니다.
> 포함된 base component: [list]
> 각 base component를 개별 구현할지, 전체 composition을 구현할지 선택해주세요."

Wait for explicit user confirmation.

---

## Step 5: Resolve Token Chain

For every visual property (fill, stroke, effect, spacing, radius, typography):

**Resolution priority:**

```
1. boundVariables → follow variable ID to get_variable_defs entry
   └─ check codeSyntax.WEB → usage alias (e.g. "bg-background") → USE DIRECTLY

2. If codeSyntax.WEB points to another variable (alias chain):
   └─ resolve to semantic variable → check semantic collection modes
      ├─ Light mode value: semantic → primitive → codeSyntax.WEB
      └─ Dark mode value: same path via dark mode entry

3. Named text/effect styles → use style's codeSyntax.WEB

4. Raw fills/strokes/effects → use inline value + mark as "raw: no token binding"
```

**Light/Dark mode:** When a semantic variable has both `light` and `dark` mode entries,
generate both values. Use Tailwind `dark:` variant for dark overrides, or CSS variable
reference if the project uses CSS variable theming.

For complete chain resolution rules and Tailwind alias mapping, consult
`references/token-chain-rules.md`.

---

## Step 6: Generate TSX Code

### Component Structure

For base shadcn/ui components:
- Import from `@/components/ui/[component]`
- Use `cn()` from `@/lib/utils` for conditional class merging
- Define a TypeScript props interface
- Map Figma component properties to React props (variant, size, disabled, etc.)
- Export as named export

For compositions (templates confirmed by user):
- Assemble imported base components
- Preserve Figma layout: Auto Layout → flex, Fixed → absolute/grid as appropriate
- Use Tailwind spacing tokens for gaps and padding

### Inline Token Comments (Required)

Every Tailwind class derived from a token requires an inline comment showing the full chain:

```tsx
<Button
  className={cn(
    "bg-primary",        // token: bg-primary → semantic/color/bg/brand → primitive/blue-600 (dark: primitive/blue-400)
    "text-primary-foreground",  // token: text-primary-fg → semantic/color/text/on-brand → primitive/white
    "rounded-md",        // token: radius-md → semantic/radius/md → primitive/6px
    "px-4 py-2",         // token: space-4/space-2 → semantic/space/4,2 → primitive/16px,8px
    "shadow-sm"          // token: shadow-sm → semantic/effect/shadow/sm → 0 1px 2px rgba(0,0,0,0.05)
  )}
/>
```

Comment format: `// token: [usage] → [semantic] → [primitive] (dark: [dark-primitive])`

For raw values without token binding:
```tsx
className="border-[#E2E8F0]"  // raw: no token binding — verify with designer
```

### Gradient / Multi-fill / Shadow

For gradient fills with no variable binding:
```tsx
// raw gradient: linear 135° rgba(255,255,255,0.1) → rgba(0,0,0,0.05)
style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(0,0,0,0.05))" }}
```

For layered fills, render in order (bottom to top) using separate `div` layers or
`background-image` stack as needed.

---

## Step 7: Delegate to Subagents

After saving the TSX file, launch both subagents. They can run in parallel.

**figma-token-auditor** — provide:
- Path to generated TSX file
- Full variable defs from Figma
- List of all tokens used with their resolved chain

**figma-fidelity-reviewer** — provide:
- Path to generated TSX file
- Figma screenshot URL/path saved in Step 3
- Node dimensions and layout values from design context

Both agents can run in parallel. Wait for both to return results before writing the report.

For full invocation protocol, input format, and fallback handling, consult
`references/subagent-specs.md`.

---

## Step 8: Generate IMPLEMENTATION_REPORT.md

Create `IMPLEMENTATION_REPORT.md` alongside the component file. Use the template at
`templates/IMPLEMENTATION_REPORT.template.md`.

Required sections:
1. **Node Info** — fileKey, nodeId, name, type, dimensions
2. **Token Mapping Table** — usage alias | semantic variable | primitive | Tailwind class
3. **shadcn/ui Installation** — `npx shadcn@latest add [components]`
4. **Unresolved Issues** — broken chains, raw values used, ambiguous variables
5. **Token Audit Summary** — result from figma-token-auditor
6. **Fidelity Review Summary** — visual gaps from figma-fidelity-reviewer

---

## Step 9: Final Summary

Print to the user:

```
✅ 구현 완료: [ComponentName].tsx
📋 보고서: IMPLEMENTATION_REPORT.md

📦 shadcn/ui 설치:
npx shadcn@latest add [list]

⚠️ 미해결 항목: N건 — IMPLEMENTATION_REPORT.md > Unresolved Issues 참조
🎨 시각 fidelity: [PASS / ISSUES FOUND] — IMPLEMENTATION_REPORT.md > Fidelity Review 참조
```

---

## Project Context

If `.claude/figma-project.local.md` exists in the current project, its contents have been
injected into this session by the plugin's SessionStart hook. That file may specify:
- Figma file key for the project
- Custom token collection names
- shadcn/ui component overrides
- Project-specific design system notes

Use that context to override defaults in this skill where relevant.

---

## Additional Resources

### Reference Files
- **`references/token-chain-rules.md`** — 전체 토큰 체인 해석 알고리즘, codeSyntax.WEB 매핑표,
  Tailwind alias → CSS variable 변환 규칙, 모드 분기 edge case
- **`references/base-vs-template.md`** — base component vs template/example 판정 체크리스트,
  팀 라이브러리 인스턴스 식별법, override 처리 규칙
- **`references/subagent-specs.md`** — figma-token-auditor / figma-fidelity-reviewer 호출 프로토콜,
  입력 포맷, 출력 포맷, 오류 처리 및 fallback

### Templates
- **`templates/figma-project.local.example.md`** — 프로젝트 설정 파일 예시 (`.claude/`에 복사)
- **`templates/IMPLEMENTATION_REPORT.template.md`** — 보고서 구조 템플릿

### Examples
- **`examples/button-base-component.tsx`** — Button base component 완성 예시: 인라인 토큰 주석 포맷,
  css-variables 전략과 tailwind-dark-variant 전략의 실제 출력 비교
