---
name: project-docs-setup
description: |
  프로젝트 문서화 체계를 설정하고 유지합니다. README.md(사람용), AGENTS.md(AI 에이전트용), CLAUDE.md(Claude 진입점), ai-context/(에이전트 상세 문서 폴더)의 4-파일 체계를 생성/갱신합니다.
  
  다음 상황에서 반드시 이 스킬을 사용하세요:
  - "문서화 체계", "docs setup", "문서 세팅", "문서 구조 잡아줘"
  - "README 만들어", "AGENTS.md 작성해줘", "CLAUDE.md 설정"
  - "ai-context 폴더 만들어", "TOC.md 갱신"
  - 프로젝트에 AGENTS.md 또는 ai-context/가 없거나 오래된 경우
  - 신규 프로젝트 시작 시 문서 인프라가 필요한 경우
---

# Project Documentation System Setup

프로젝트 문서를 사람과 AI 에이전트가 각자 필요한 정보를 빠르게 찾을 수 있도록 4개 파일로 분리하는 체계입니다.

## 왜 이 구조인가

| 파일 | 독자 | 목적 |
|------|------|------|
| `README.md` | 사람 (개발자) | 프로젝트 전체 구조를 한눈에 파악 |
| `AGENTS.md` | AI 에이전트 | 이 프로젝트에서 무엇을 해야 하고 하면 안 되는지 |
| `CLAUDE.md` | Claude Code | `@AGENTS.md`만 써서 진입점 단일화 |
| `ai-context/` | AI 에이전트 | AGENTS.md가 위임한 상세 문서 전용 공간 |

AGENTS.md는 짧고 핵심만 담아야 한다. 깊이 있는 내용은 ai-context/ 파일에 위임하고 TOC.md로 색인한다.

---

## Step 1: 프로젝트 탐색

파일을 쓰기 전에 프로젝트를 이해한다. 병렬로 읽어라.

읽어야 할 것들:
- 빌드 설정: `settings.gradle.kts`, `package.json`, `pyproject.toml`, `build.gradle.kts` 등
- 기존 문서: `README.md`, `AGENTS.md`, `ai-context/TOC.md`, `docs/TOC.md`
- 루트 디렉터리 구조 (`ls` 또는 Glob)
- 핵심 모듈 디렉터리 목록

파악해야 할 것:
- 프로젝트명, 기술 스택, 언어/프레임워크
- 모듈 목록과 각각의 책임
- 기존 아키텍처 다이어그램
- 기존 규칙, 제약사항, 금지 패턴
- Claude memory나 CLAUDE.md에 있는 프로젝트별 메모

---

## Step 2: README.md 작성

사람이 처음 저장소에 들어왔을 때 빠르게 파악할 수 있도록. 간결하게.

**필수 섹션:**

```markdown
# {프로젝트명}

{한 줄 설명 — 무엇이고 왜 존재하는가}

## 기능

- `{모듈명}` — {한 줄 설명}
- ...

## 아키텍처 트리

\`\`\`text
{프로젝트 루트}
├── {모듈1}
├── {모듈2}
└── ...
\`\`\`

## 아키텍처 흐름

\`\`\`mermaid
flowchart LR
    {노드1}["{한글 레이블}"] --> {노드2}["{한글 레이블}"]
    ...
\`\`\`

## 빠른 시작   ← 있으면 추가

## 문서   ← 있으면 추가
```

Mermaid 다이어그램 규칙:
- `flowchart LR` (좌→우) 사용, 노드 5~8개 이하로 단순하게
- 레이블은 한글로, 의존 방향(→)이 명확하게
- 복잡한 다이어그램은 `ai-context/02_architecture-principles.md`에 위임

---

## Step 3: AGENTS.md 작성

AI 에이전트용. 핵심 규칙과 제약만 담고, 상세는 ai-context/로 위임.

**필수 섹션:**

```markdown
# AGENTS.md

이 문서는 {프로젝트명} 에이전트용 루트 가이드입니다.
상세 기준은 항상 [ai-context/TOC.md](./ai-context/TOC.md)부터 읽습니다.

## 프로젝트 개요와 목적

- {한 줄 설명}
- {중요한 맥락 — 마이그레이션 중이라면 "X에서 Y로", 소유권 경계가 있다면 명시}

## 기능

- `{모듈명}` — {한 줄 설명}
- ...

## 에이전트 핵심 규칙

- {하면 안 되는 것들 — DDL 변경, 기존 계약 파괴 등}
- {아키텍처 불변 규칙 — 의존 방향, 금지 패턴}
- {마이그레이션/전환 제약}

## 중요한 메모

- {테스트 정책, 커버리지 기준}
- {환경 전제조건}
- {문서 갱신 규칙}

## 먼저 읽을 문서

- [ai-context/TOC.md](./ai-context/TOC.md)
- {기타 중요 상태 문서}
```

AGENTS.md가 60줄을 넘어가면 내용을 ai-context/ 파일로 옮겨라.

---

## Step 4: CLAUDE.md 작성

딱 한 줄만:

```
@AGENTS.md
```

다른 내용 없음. Claude Code의 `@파일` 임포트 문법으로 AGENTS.md를 자동 로드하게 한다.

---

## Step 5: ai-context/ 설정

### TOC.md 작성/갱신

ai-context/의 첫 번째 규칙: 다른 파일을 보기 전에 항상 TOC.md를 먼저 읽는다.

```markdown
# TOC

이 디렉터리는 {프로젝트명} 에이전트 상세 문서 전용 공간입니다.
다른 문서를 보기 전에 항상 이 목차부터 읽습니다.

## 읽는 순서

1. [01_north-star.md](./01_north-star.md) — 프로젝트 방향성과 핵심 원칙
2. [02_architecture-principles.md](./02_architecture-principles.md) — 아키텍처 원칙과 의존 규칙
...

## 보조 문서

- [docs/...] — 상태 문서, 체크리스트 등
```

### 신규 프로젝트라면 스타터 파일 생성

- `01_north-star.md` — 프로젝트가 무엇이고 무엇이 아닌지, 성공 기준
- `02_architecture-principles.md` — 모듈 경계, 의존 방향 규칙, 금지 패턴

파일 네이밍: `{두 자리 번호}_{kebab-title}.md` (예: `03_decision-checklist.md`)

---

## Step 6: 일관성 검증

모든 파일을 쓴 후 확인:
- 프로젝트명, 모듈 목록, 기술 스택이 README.md와 AGENTS.md에서 일치하는가
- AGENTS.md와 TOC.md의 모든 링크가 실제 파일을 가리키는가
- CLAUDE.md가 `@AGENTS.md` 한 줄인가
- ai-context/TOC.md가 디렉터리에 실제 존재하는 모든 파일을 나열하는가

---

## 유지보수 규칙

프로젝트 구조나 정책이 바뀌면:
- README.md, AGENTS.md, ai-context/TOC.md를 함께 갱신
- 세 파일이 서로 어긋나도록 두지 않는다
- ai-context/에 새 파일을 추가하면 즉시 TOC.md에도 추가

---

## 언어 규칙

- 한국어 프로젝트 → 한국어로 작성 (기존 파일 언어를 따른다)
- 영어 프로젝트 → 영어로 작성
- Mermaid 노드 레이블은 프로젝트 언어로
