# 플러그인 개발 가이드

URECA Claude Plugins 마켓플레이스에 새로운 플러그인을 추가하는 방법을 안내합니다.

## 📋 목차

- [개발 환경 설정](#개발-환경-설정)
- [플러그인 구조 이해](#플러그인-구조-이해)
- [새 플러그인 생성](#새-플러그인-생성)
- [컴포넌트 개발](#컴포넌트-개발)
- [테스트 및 검증](#테스트-및-검증)
- [마켓플레이스 등록](#마켓플레이스-등록)
- [배포 및 버전 관리](#배포-및-버전-관리)

---

## 개발 환경 설정

### 1. 저장소 Fork 및 Clone

```bash
# 1. GitHub에서 Fork
# https://github.com/ureca-corp/claude 페이지에서 Fork 버튼 클릭

# 2. Fork한 저장소 Clone
git clone https://github.com/your-username/claude.git
cd claude

# 3. Upstream 설정
git remote add upstream https://github.com/ureca-corp/claude.git
```

### 2. 로컬 테스트 환경

```bash
# 전체 마켓플레이스 로드
claude --plugin-dir .

# 또는 특정 플러그인만 테스트
claude --plugin-dir ./plugins/your-plugin
```

### 3. 개발 브랜치 생성

```bash
git checkout -b feature/your-plugin-name
```

---

## 플러그인 구조 이해

### 표준 플러그인 구조

```
plugins/your-plugin/
├── .claude-plugin/
│   └── plugin.json          # 플러그인 메타데이터 (필수)
├── skills/                  # 에이전트가 자동으로 사용하는 스킬
│   └── skill-name/
│       ├── SKILL.md         # 스킬 프롬프트
│       ├── templates/       # 참조 템플릿
│       ├── examples/        # 예제 코드
│       └── references/      # 상세 레퍼런스
├── commands/                # 사용자가 직접 호출하는 명령어
│   └── command-name/
│       └── SKILL.md
├── agents/                  # 커스텀 서브에이전트
│   └── agent-name.md
├── hooks/                   # 이벤트 기반 훅
│   ├── hooks.json
│   └── examples/
├── README.md                # 플러그인 문서 (필수)
├── CHANGELOG.md             # 버전 변경 이력 (필수)
└── CLAUDE.md                # AI 에이전트를 위한 가이드 (권장)
```

### 컴포넌트 유형

| 컴포넌트 | 설명 | 사용 시기 |
|---------|------|----------|
| **Skills** | 에이전트가 작업 컨텍스트에 따라 자동 사용 | 지식 제공, 패턴 가이드 |
| **Commands** | 사용자가 `/plugin:command` 형식으로 직접 호출 | 명시적 작업 실행 |
| **Agents** | 특정 작업을 자율적으로 수행하는 서브에이전트 | 복잡한 다단계 작업 |
| **Hooks** | 특정 이벤트 발생 시 자동 실행 | 검증, 알림, 자동화 |

---

## 새 플러그인 생성

### 1. 디렉토리 구조 생성

```bash
# 플러그인 이름은 kebab-case 사용
PLUGIN_NAME="your-plugin"

mkdir -p plugins/$PLUGIN_NAME/.claude-plugin
mkdir -p plugins/$PLUGIN_NAME/skills
mkdir -p plugins/$PLUGIN_NAME/commands
mkdir -p plugins/$PLUGIN_NAME/agents
```

### 2. plugin.json 작성

`plugins/your-plugin/.claude-plugin/plugin.json`:

```json
{
  "name": "your-plugin",
  "description": "플러그인에 대한 간단한 설명 (80자 이내)",
  "version": "1.0.0",
  "author": {
    "name": "Your Name",
    "email": "your.email@example.com",
    "url": "https://github.com/your-username"
  },
  "tags": [
    "category",
    "keyword1",
    "keyword2"
  ],
  "category": "planning"
}
```

**카테고리 옵션**:
- `planning` - 기획 및 설계
- `development` - 개발 도구
- `analysis` - 분석 및 리뷰
- `integration` - 외부 서비스 연동
- `productivity` - 생산성 도구

### 3. README.md 작성

`plugins/your-plugin/README.md`:

```markdown
# Your Plugin

> 플러그인 한 줄 설명

## 📖 소개

플러그인이 무엇을 하는지, 왜 필요한지 설명합니다.

## ✨ 특징

- 특징 1
- 특징 2
- 특징 3

## 🚀 설치

\```bash
/plugin install your-plugin@ureca-plugins
\```

## 📚 사용법

### 기본 사용

\```bash
/your-plugin:command
\```

### 고급 사용

[상세 사용법]

## 📝 예제

[구체적인 예제]

## ⚙️ 설정

[필요한 경우 설정 방법]

## 🤝 기여

[기여 가이드 링크]

## 📄 라이선스

MIT License
```

### 4. CHANGELOG.md 작성

`plugins/your-plugin/CHANGELOG.md`:

```markdown
# Changelog

## [1.0.0] - YYYY-MM-DD

### Added
- 초기 릴리스
- 기능 1
- 기능 2

### Changed
- N/A

### Fixed
- N/A
```

---

## 컴포넌트 개발

### Skills 개발

**위치**: `plugins/your-plugin/skills/skill-name/SKILL.md`

**구조**:
```markdown
---
name: skill-name
description: >
  Use this skill when the user wants to [specific trigger condition].
  This skill provides [what it provides].
---

# Skill Name

[명령형으로 작성된 스킬 내용]

## Instructions

1. Do this first
2. Then do this
3. Finally do this

## Templates

Refer to `templates/template-name.md` for detailed examples.

## Examples

[Working examples]

## Tips

- Tip 1
- Tip 2
```

**핵심 원칙**:
- **Description (frontmatter)**: 3인칭, 언제 사용할지 명확히
- **Body**: 명령형, Claude를 위한 지침
- **Lean body**: 1,500-2,000 단어, 상세 내용은 `templates/`에
- **Progressive disclosure**: 기본 → 상세로 점진적 정보 제공

### Commands 개발

**위치**: `plugins/your-plugin/commands/command-name/SKILL.md`

**구조**:
```markdown
---
name: command-name
description: Command description shown in help
argument-hint: "[optional-arg]"
allowed-tools:
  - Read
  - Write
  - Bash
---

# Command Name

[Claude를 위한 지침 - 사용자에게 보이지 않음]

## What to Do

When the user invokes this command:

1. First step
2. Second step
3. Third step

## Usage Examples

User invokes:
\```
/your-plugin:command-name arg1 arg2
\```

Expected behavior: [설명]

## Tips

- Important consideration 1
- Important consideration 2
```

**주의사항**:
- 사용자를 위한 문서가 **아님**
- Claude가 명령어를 실행할 때 따라야 할 지침
- `allowed-tools`에 필요한 최소 도구만 명시

### Agents 개발

**위치**: `plugins/your-plugin/agents/agent-name.md`

**구조**:
```markdown
---
identifier: agent-name
description: What this agent does (brief)
color: blue
model: sonnet
whenToUse: >
  Specific conditions when this agent should be triggered.
  Use concrete trigger scenarios.
tools:
  - Read
  - Write
  - Bash
  - Grep
examples:
  - context: "User is doing X"
    user: "User input example"
    assistant: "Agent invocation"
    commentary: "Why agent is needed in this scenario"
  - context: "Another scenario"
    user: "Another example"
    assistant: "Agent invocation"
    commentary: "Explanation"
---

# System Prompt for Agent

You are a specialized agent that [what the agent does].

Your goal is to [specific goal].

## Guidelines

1. Guideline 1
2. Guideline 2
3. Guideline 3

## Process

1. Step 1
2. Step 2
3. Step 3

## Output Format

[Expected output format]

## Important Notes

- Note 1
- Note 2
```

**모델 옵션**:
- `sonnet` - 일반적인 작업 (권장)
- `opus` - 복잡한 작업 (비용 높음)
- `haiku` - 간단한 작업 (속도 빠름)

**컬러 옵션**:
- `blue`, `green`, `yellow`, `red`, `purple`, `orange`

### Hooks 개발

**위치**: `plugins/your-plugin/hooks/hooks.json`

**구조**:
```json
{
  "hooks": [
    {
      "event": "PreToolUse:Write",
      "type": "prompt",
      "prompt": "Before writing files, check if [condition]. If so, warn the user about [what]."
    },
    {
      "event": "PostToolUse:Bash",
      "type": "command",
      "command": "bash",
      "args": [
        "${PLUGIN_ROOT}/hooks/examples/post_bash_check.sh",
        "${TOOL_USE_OUTPUT}"
      ]
    }
  ]
}
```

**이벤트 타입**:
- `PreToolUse:<ToolName>` - 도구 실행 전
- `PostToolUse:<ToolName>` - 도구 실행 후
- `UserPromptSubmit` - 사용자 입력 제출 시
- `SessionStart` - 세션 시작 시
- `Stop` - 세션 종료 시

**Hook 타입**:
- `prompt` - Claude에게 텍스트 프롬프트 전달 (간단한 체크)
- `command` - 스크립트 실행 (복잡한 검증)

---

## 테스트 및 검증

### 1. 로컬 테스트

```bash
# 플러그인 로드
claude --plugin-dir ./plugins/your-plugin

# 스킬 테스트
"Use skill-name to do something"

# 명령어 테스트
/your-plugin:command-name

# 에이전트 테스트
"Trigger agent scenario"
```

### 2. 구조 검증

```bash
# JSON 문법 확인
jq empty plugins/your-plugin/.claude-plugin/plugin.json

# 플러그인 검증 (Claude Code 필요)
claude plugin validate plugins/your-plugin
```

### 3. 링크 확인

```bash
# README에서 broken links 확인
grep -oP '\[.*?\]\(\K[^)]+(?=\))' plugins/your-plugin/README.md | while read link; do
  [ ! -f "$link" ] && echo "Broken: $link"
done
```

---

## 마켓플레이스 등록

### 1. marketplace.json에 추가

`.claude-plugin/marketplace.json`의 `plugins` 배열에 추가:

```json
{
  "name": "ureca-plugins",
  "plugins": [
    {
      "name": "your-plugin",
      "source": "./plugins/your-plugin",
      "description": "플러그인 설명",
      "version": "1.0.0",
      "author": {
        "name": "Your Name"
      },
      "keywords": ["keyword1", "keyword2"],
      "category": "planning"
    }
  ]
}
```

### 2. 전체 마켓플레이스 검증

```bash
claude plugin validate .
```

### 3. CI 매트릭스 업데이트

`.github/workflows/validate.yml`의 `matrix.plugin`에 추가:

```yaml
strategy:
  matrix:
    plugin:
      - domain-book-builder
      - your-plugin  # 추가
```

---

## 배포 및 버전 관리

### 커밋 및 PR

```bash
# 변경사항 확인
git status

# 스테이징
git add plugins/your-plugin
git add .claude-plugin/marketplace.json
git add .github/workflows/validate.yml

# 커밋 (Conventional Commits)
git commit -m "feat(your-plugin): add your-plugin v1.0.0"

# 푸시
git push origin feature/your-plugin-name
```

### Pull Request 생성

GitHub에서 PR 생성 시 다음 포함:

```markdown
## 변경 사항

- 새 플러그인 추가: `your-plugin`
- 기능 1
- 기능 2

## 테스트 방법

1. `claude --plugin-dir ./plugins/your-plugin`
2. `/your-plugin:command` 실행
3. 예상 결과 확인

## 체크리스트

- [x] plugin.json 작성
- [x] README.md 작성
- [x] CHANGELOG.md 작성
- [x] 로컬 테스트 완료
- [x] 검증 통과
- [x] marketplace.json에 등록
```

### 버전 관리

Semantic Versioning 사용:

- **1.0.0** - 초기 릴리스
- **1.0.1** - 버그 수정 (Patch)
- **1.1.0** - 새 기능 (Minor)
- **2.0.0** - Breaking changes (Major)

CHANGELOG.md 업데이트:

```markdown
## [1.1.0] - 2026-02-20

### Added
- 새 스킬: skill-name
- 새 명령어: command-name

### Changed
- 기존 스킬 개선

### Fixed
- 버그 수정
```

---

## 참고 자료

### 공식 문서

- [Claude Code Plugins](https://code.claude.com/docs/en/plugins)
- [Plugin Reference](https://code.claude.com/docs/en/plugins-reference)
- [Plugin Marketplaces](https://code.claude.com/docs/en/plugin-marketplaces)

### 예제 플러그인

- [domain-book-builder](../plugins/domain-book-builder/) - 복잡한 워크플로우 예제
- [plugin-dev](https://github.com/anthropics/claude-code-plugins) - 공식 플러그인 예제

### 스타일 가이드

- [CONTRIBUTING.md](../CONTRIBUTING.md) - 코드 스타일 및 PR 가이드
- [Conventional Commits](https://www.conventionalcommits.org/) - 커밋 메시지 규칙

---

## 추가 도움말

- **이슈**: [GitHub Issues](https://github.com/ureca-corp/claude/issues)
- **토론**: [GitHub Discussions](https://github.com/ureca-corp/claude/discussions)
- **기여 가이드**: [CONTRIBUTING.md](../CONTRIBUTING.md)
