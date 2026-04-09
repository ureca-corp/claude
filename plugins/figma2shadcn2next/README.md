# figma2shadcn2next

Figma 팀 라이브러리(Ureca Shadcn)를 Next.js 16 + shadcn/ui 코드로 높은 충실도로 구현하는
Claude Code 전문 에이전트 팩.

토큰 해석, base/template 판정, gradient/effect 복원, Light/Dark 모드 분기를 고정된 규칙으로
처리해 에이전트의 구현 편차를 최소화한다.

---

## 핵심 규칙 (변경 불가)

| 규칙 | 값 |
|---|---|
| Canonical key | `codeSyntax.WEB` |
| 토큰 해석 순서 | `usage → semantic → primitive` |
| 모드 분기 위치 | `semantic` 컬렉션에서만 |
| 구현 우선순위 | `boundVariables → text/effect styles → raw fills` |

---

## 포함 컴포넌트

| 컴포넌트 | 경로 | 역할 |
|---|---|---|
| **Skill** | `skills/implement-figma-shadcn-next16/` | 메인 워크플로우 |
| **Command** | `commands/implement.md` | `/figma2shadcn2next:implement-figma-shadcn-next16` |
| **Token Auditor** | `agents/figma-token-auditor.md` | 토큰 체인 검증 |
| **Fidelity Reviewer** | `agents/figma-fidelity-reviewer.md` | 시각 fidelity 검사 |
| **SessionStart Hook** | `hooks/hooks.json` | 프로젝트 설정 주입 |

### 전제 조건

- Figma MCP가 Claude Code 세션에 연결되어 있어야 한다.
  (`~/.claude/mcp.json` 또는 프로젝트 `.mcp.json`에 Figma MCP 설정 필요)
- Next.js 16 + shadcn/ui 프로젝트 구조가 있어야 한다.
- `@/components/ui/` 경로와 `@/lib/utils.ts` (cn 함수)가 있어야 한다.

---

## 사용법

### 1. 슬래시 커맨드로 실행

```
/figma2shadcn2next:implement-figma-shadcn-next16 [Figma URL 또는 fileKey nodeId]
```

예시:
```
/figma2shadcn2next:implement-figma-shadcn-next16 https://www.figma.com/design/AbCdEfGh/Ureca-Shadcn?node-id=123:456
```

### 2. 자연어로 트리거

Figma URL과 함께 다음 표현을 사용하면 skill이 자동으로 활성화된다:
- "이 Figma 컴포넌트 구현해줘"
- "Figma to code"
- "shadcn으로 만들어줘"
- "implement this Figma component"

### 3. 에이전트 단독 실행

```
# 토큰 감사만 실행
"이 파일 토큰 체인 감사해줘: src/components/ui/button.tsx"

# fidelity 검사만 실행
"Figma 디자인이랑 코드 비교해서 fidelity 검사해줘"
```

---

## 출력물

구현이 완료되면 다음 파일이 생성된다:

```
[ComponentName].tsx           ← React/TSX 컴포넌트 (인라인 토큰 주석 포함)
IMPLEMENTATION_REPORT.md      ← 토큰 매핑표, 미해결 항목, fidelity 요약
```

### IMPLEMENTATION_REPORT.md 구성

- Node Info (fileKey, nodeId, 분류, dimensions)
- shadcn/ui 설치 명령 (`npx shadcn@latest add ...`)
- 토큰 매핑 테이블
- 미해결 항목 (chain error, raw value)
- Token Audit 결과 (figma-token-auditor)
- Fidelity Review 결과 (figma-fidelity-reviewer)

---

## 프로젝트별 설정

프로젝트 루트에 `.claude/figma-project.local.md`를 생성하면 세션 시작 시 자동으로
설정이 주입된다:

```bash
# 1. 템플릿 복사
mkdir -p .claude
cp ~/.claude/plugins/figma2shadcn2next/skills/implement-figma-shadcn-next16/templates/figma-project.local.example.md .claude/figma-project.local.md

# 2. .gitignore에 추가 (권장)
echo ".claude/figma-project.local.md" >> .gitignore

# 3. 파일 열어서 프로젝트 정보 입력
# - Figma file key
# - 토큰 컬렉션 이름 (기본값과 다를 경우)
# - Light/Dark 전략 (css-variables / tailwind-dark-variant)
# - 컴포넌트 출력 경로
```

---

## 파일 구조

```
figma2shadcn2next/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   └── implement-figma-shadcn-next16/
│       ├── SKILL.md                          ← 메인 워크플로우
│       ├── references/
│       │   ├── token-chain-rules.md          ← 토큰 체인 해석 규칙 (상세)
│       │   └── base-vs-template.md           ← base/template 판정 기준
│       └── templates/
│           ├── figma-project.local.example.md  ← 프로젝트 설정 템플릿
│           └── IMPLEMENTATION_REPORT.template.md  ← 보고서 템플릿
├── commands/
│   └── implement.md                          ← 슬래시 커맨드
├── agents/
│   ├── figma-token-auditor.md                ← 토큰 체인 검증 에이전트
│   └── figma-fidelity-reviewer.md            ← 시각 fidelity 에이전트
├── hooks/
│   ├── hooks.json                            ← SessionStart hook 설정
│   └── scripts/
│       └── inject-project-context.sh         ← 설정 주입 스크립트
└── README.md
```

---

## 로드맵

- **v0.1.0** (현재): 토큰 체인 해석 + Next 16 + shadcn/ui 컴포넌트 생성
- **v0.2.0**: screenshot 기반 fidelity review 강화
- **v0.3.0**: hook 기반 자동 검증 추가
- **v1.0.0**: Codex 래퍼 추가, 공통 core 이식
