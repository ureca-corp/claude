# 기여 가이드

URECA Claude Plugins에 기여해주셔서 감사합니다! 이 문서는 효과적인 기여를 위한 가이드라인을 제공합니다.

## 📋 목차

- [행동 강령](#행동-강령)
- [시작하기](#시작하기)
- [개발 워크플로우](#개발-워크플로우)
- [플러그인 개발 가이드](#플러그인-개발-가이드)
- [코드 스타일](#코드-스타일)
- [커밋 메시지 규칙](#커밋-메시지-규칙)
- [Pull Request 가이드](#pull-request-가이드)
- [리뷰 프로세스](#리뷰-프로세스)

---

## 행동 강령

### 우리의 약속

우리는 포용적이고 환영하는 커뮤니티를 만들기 위해 노력합니다. 모든 기여자는:

- **존중**: 다른 관점과 경험을 존중합니다
- **건설적**: 건설적인 피드백을 제공하고 받습니다
- **협력**: 커뮤니티의 성공을 위해 협력합니다
- **투명**: 의사소통에서 투명하고 정직합니다

### 금지 행동

- 공격적이거나 모욕적인 언어 사용
- 개인 정보 무단 공개
- 트롤링, 괴롭힘, 또는 차별적 발언
- 기타 비전문적 행동

문제가 발생하면 [이메일]로 연락해주세요.

---

## 시작하기

### 1. Repository Fork 및 Clone

```bash
# Fork 후 Clone
git clone https://github.com/your-username/claude.git
cd claude

# Upstream 설정
git remote add upstream https://github.com/ureca-corp/claude.git
```

### 2. 로컬 환경 설정

```bash
# 마켓플레이스 검증
claude plugin validate .

# 로컬 테스트
claude --plugin-dir .
```

### 3. 최신 상태 유지

```bash
git fetch upstream
git rebase upstream/main
```

---

## 개발 워크플로우

### 브랜치 전략

우리는 **기능 브랜치 워크플로우**를 사용합니다:

```bash
# 새 기능 개발
git checkout -b feature/your-feature-name

# 버그 수정
git checkout -b fix/bug-description

# 문서 개선
git checkout -b docs/documentation-update
```

### 브랜치 명명 규칙

- `feature/` - 새로운 기능
- `fix/` - 버그 수정
- `docs/` - 문서 개선
- `refactor/` - 코드 리팩토링
- `test/` - 테스트 추가/개선
- `chore/` - 기타 작업 (빌드, 설정 등)

---

## 플러그인 개발 가이드

### 플러그인 구조

모든 플러그인은 다음 구조를 따라야 합니다:

```
plugins/your-plugin/
├── .claude-plugin/
│   └── plugin.json          # 필수: 플러그인 메타데이터
├── skills/                  # 선택: 에이전트 스킬
│   └── skill-name/
│       ├── SKILL.md         # 스킬 프롬프트
│       ├── templates/       # 참조 템플릿
│       └── examples/        # 예제 코드
├── commands/                # 선택: 사용자 명령어
│   └── command-name/
│       └── SKILL.md
├── agents/                  # 선택: 커스텀 에이전트
│   └── agent-name.md
├── hooks/                   # 선택: 이벤트 훅
│   ├── hooks.json
│   └── examples/
├── README.md                # 필수: 플러그인 문서
├── CHANGELOG.md             # 필수: 변경 이력
└── CLAUDE.md                # 권장: AI 에이전트 가이드
```

### plugin.json 필수 필드

```json
{
  "name": "plugin-name",
  "description": "간단한 설명 (80자 이내)",
  "version": "1.0.0",
  "author": {
    "name": "Your Name",
    "email": "optional@email.com",
    "url": "https://optional.url"
  },
  "tags": ["tag1", "tag2"],
  "category": "planning|development|analysis|integration"
}
```

### 스킬 작성 가이드

**SKILL.md 구조**:

```markdown
---
name: skill-name
description: 3인칭 설명문 (에이전트가 언제 이 스킬을 사용해야 하는지)
---

# Skill Name

[명령형으로 작성된 스킬 내용]

## Instructions

1. 첫 번째 단계
2. 두 번째 단계
3. 세 번째 단계

## Examples

[구체적인 예제]

## Tips

[유용한 팁]
```

**핵심 원칙**:
- Description은 **3인칭**으로 작성 ("Use this skill when...")
- Body는 **명령형**으로 작성 ("Do this...", "Create that...")
- **Lean body** 원칙: 1,500-2,000 단어, 상세 내용은 `templates/` 또는 `references/`에
- 구체적인 **trigger phrases** 포함

### 에이전트 작성 가이드

**agent.md 구조**:

```markdown
---
identifier: agent-name
description: 에이전트가 하는 일에 대한 간단한 설명
color: blue
model: sonnet
whenToUse: >
  에이전트를 언제 사용해야 하는지 명확한 조건.
  구체적인 트리거 상황 설명.
tools:
  - Read
  - Write
  - Bash
examples:
  - context: "사용자가 X를 요청했을 때"
    user: "사용자 입력 예제"
    assistant: "에이전트 응답 예제"
    commentary: "왜 이 시나리오에서 에이전트를 사용하는지 설명"
---

[System Prompt - 에이전트가 수행할 작업에 대한 상세 지침]
```

### 명령어 작성 가이드

명령어는 `commands/command-name/SKILL.md` 형식으로 작성:

```markdown
---
name: command-name
description: 명령어 설명
argument-hint: "[optional-arg]"
allowed-tools:
  - Read
  - Write
  - Bash
---

# Command Name

[Claude를 위한 지침 - 사용자를 위한 것이 아님]

## What to Do

1. 명령어 실행 시 수행할 작업
2. 순서대로 단계 나열

## Usage Examples

사용자가 다음과 같이 호출:
```
/plugin:command-name arg1 arg2
```

## Tips

- 유용한 팁
- 일반적인 실수 방지
```

---

## 코드 스타일

### Markdown

- **줄 길이**: 120자 (하드 래핑 없음, 자동 래핑 권장)
- **제목**: ATX 스타일 (`#`) 사용
- **코드 블록**: 언어 지정 필수
- **링크**: 상대 경로 사용

### JSON

- **들여쓰기**: 2 스페이스
- **따옴표**: 이중 따옴표 사용
- **후행 쉼표**: 금지
- **정렬**: 알파벳 순 (선택적)

**예제**:
```json
{
  "author": {
    "name": "URECA Team"
  },
  "description": "플러그인 설명",
  "name": "plugin-name",
  "version": "1.0.0"
}
```

### 파일 이름

- **kebab-case**: `plugin-name`, `skill-name`
- **확장자**: `.md` (마크다운), `.json` (설정)
- **대소문자 구분**: 소문자 우선 (README.md, CHANGELOG.md 제외)

---

## 커밋 메시지 규칙

우리는 [Conventional Commits](https://www.conventionalcommits.org/) 규칙을 따릅니다.

### 형식

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Type

- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 개선
- `style`: 코드 스타일 (포매팅, 세미콜론 등)
- `refactor`: 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드, 설정 등

### Scope

플러그인 이름 또는 영역:
- `domain-book-builder`
- `marketplace`
- `ci`
- `docs`

### Subject

- 현재 시제 사용 ("add" not "added")
- 첫 글자 소문자
- 마침표 없음
- 50자 이내

### 예제

```bash
# 좋은 예
feat(domain-book-builder): add phase 5 parallel execution
fix(marketplace): correct plugin source path
docs(readme): update installation instructions

# 나쁜 예
Added new feature.
fix bug
Update docs
```

---

## Pull Request 가이드

### PR 체크리스트

PR을 제출하기 전에 다음을 확인하세요:

- [ ] **검증 통과**: `claude plugin validate .` 성공
- [ ] **로컬 테스트**: `claude --plugin-dir .` 정상 작동
- [ ] **문서 업데이트**: README, CHANGELOG 업데이트
- [ ] **커밋 정리**: 의미 있는 커밋 메시지
- [ ] **충돌 해결**: `main` 브랜치와 충돌 없음
- [ ] **CI 통과**: GitHub Actions 성공

### PR 템플릿

```markdown
## 변경 사항

[변경 사항을 명확하게 설명]

## 변경 이유

[왜 이 변경이 필요한지 설명]

## 테스트 방법

1. [테스트 단계 1]
2. [테스트 단계 2]

## 스크린샷 (선택)

[필요한 경우 스크린샷 추가]

## 체크리스트

- [ ] 검증 통과
- [ ] 로컬 테스트 완료
- [ ] 문서 업데이트
- [ ] CI 통과
```

### PR 크기

- **작게 유지**: 한 번에 하나의 기능/수정
- **리뷰 가능**: 500줄 이하 권장
- **독립적**: 다른 PR에 의존하지 않음

---

## 리뷰 프로세스

### 리뷰어 체크리스트

리뷰어는 다음을 확인합니다:

- [ ] **기능성**: 의도대로 작동하는가?
- [ ] **코드 품질**: 가독성, 유지보수성
- [ ] **테스트**: 충분한 테스트 포함
- [ ] **문서**: 명확하고 완전한 문서
- [ ] **규칙 준수**: 스타일 가이드 준수

### 피드백 수용

- **건설적 수용**: 피드백을 성장 기회로 활용
- **질문 환영**: 불명확한 부분 질문
- **토론 장려**: 더 나은 해결책 논의

### 승인 기준

PR이 승인되려면:
- 최소 **1명의 승인** 필요
- **CI 통과** 필수
- **충돌 해결** 완료
- **리뷰 피드백** 반영

---

## 자동 검증

### GitHub Actions

모든 PR은 자동으로 검증됩니다:

```yaml
# .github/workflows/validate.yml
- Plugin structure validation
- JSON syntax check
- Link validation
```

### 로컬 검증

PR 전에 로컬에서 검증:

```bash
# 전체 마켓플레이스 검증
./scripts/validate-all.sh

# 특정 플러그인만 검증
claude plugin validate plugins/your-plugin
```

---

## 문서 기여

문서 개선도 환영합니다!

### 문서 작성 가이드

- **명확성**: 초보자도 이해할 수 있게
- **완전성**: 모든 단계 포함
- **예제**: 구체적인 예제 제공
- **최신성**: 최신 정보 유지

### 문서 구조

```
docs/
├── installation.md          # 상세 설치 가이드
├── plugin-development.md    # 플러그인 개발
└── troubleshooting.md       # 문제 해결
```

---

## 질문이 있나요?

- **이슈**: [GitHub Issues](https://github.com/ureca-corp/claude/issues)
- **토론**: [GitHub Discussions](https://github.com/ureca-corp/claude/discussions)
- **이메일**: support@ureca.team

---

## 감사 인사

모든 기여자에게 감사드립니다! 🙏

[기여자 목록](https://github.com/ureca-corp/claude/graphs/contributors)

---

**Happy Contributing! 🚀**
