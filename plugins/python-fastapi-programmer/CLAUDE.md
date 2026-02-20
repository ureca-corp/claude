# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

**Python FastAPI Programmer**는 Domain Book을 기반으로 FastAPI 프로젝트 코드를 자동 생성하는 Claude Code 플러그인입니다.

### 핵심 특징

- **도메인별 팀 기반 병렬 구현**: Git Worktree를 활용한 독립적 도메인 개발
- **Vertical Slice + Clean Architecture**: 모듈별 독립성 보장
- **환경 변수 우선**: Mock 데이터 금지, 실제 환경 설정 강제
- **표준 인증 방식**: JWT Bearer Token 기반
- **위치 정보 저장**: latlng + PostGIS POINT 이중 저장
- **문서화 필수**: 코드 주석 + README.md + CLAUDE.md

## 아키텍처

### 프로젝트 구조

```
python-fastapi-programmer/
├── .claude-plugin/
│   └── plugin.json          # 플러그인 메타데이터 및 워크플로우 정의
├── agents/                  # 6개 Phase 에이전트 + 유틸리티 에이전트
│   ├── phase-1-domain-validator.md    # Phase 1: Domain Book 검증
│   ├── phase-2-deep-researcher.md     # Phase 2: Clarifier + Deep Research
│   ├── phase-3-env-generator.md       # Phase 3: .env.example 생성
│   ├── phase-4-code-generator.md      # Phase 4: 팀 기반 병렬 코드 생성
│   ├── phase-5-code-reviewer.md       # Phase 5: 품질 검토
│   ├── phase-6-documenter.md          # Phase 6: API 문서 생성
│   ├── logic-code-generator.md        # 유틸리티: 비즈니스 로직 생성
│   └── test-code-generator.md         # 유틸리티: E2E 테스트 생성
├── commands/                # 사용자 실행 커맨드
│   └── start.md             # Domain Book 자동 검색 및 구현 시작
├── skills/                  # 재사용 가능한 스킬
│   ├── fastapi-architecture/      # Vertical Slice + Clean Architecture 패턴
│   ├── fastapi-security/          # JWT 인증 및 SQLModel ORM 패턴
│   ├── fastapi-postgis/           # PostGIS 위치 정보 저장 패턴
│   └── git-worktree-parallel/     # Git Worktree 병렬 실행 패턴
└── README.md
```

### 6단계 워크플로우

플러그인은 순차적 승인 기반 워크플로우를 따릅니다:

1. **Phase 1: Domain Validator** (승인 필요)
   - 출력: Domain Book 검증 리포트
   - Domain Book 구조 및 내용 검증
   - 필수 섹션 확인 (features, domain-model, api-spec)

2. **Phase 2: Deep Researcher** (승인 필요)
   - 출력: `.claude/SESSION.md`
   - 모호한 요구사항 명확화
   - 기술적 의사결정 질문 (선택적)

3. **Phase 3: Env Generator** (승인 필요)
   - 출력: `.env.example`
   - Domain Book 기반 환경 변수 생성
   - DATABASE_URL, JWT_SECRET_KEY 등 필수 변수 포함

4. **Phase 4: Code Generator** (승인 필요)
   - 출력: `src/modules/{domain}/*`
   - 팀 기반 병렬 코드 생성
   - Git Worktree를 활용한 도메인별 독립 개발
   - Topological Sort로 의존성 순서 자동 해결

5. **Phase 5: Code Reviewer** (승인 필요)
   - 출력: 품질 검토 리포트
   - 아키텍처 패턴 준수 확인
   - 보안 검증 (JWT, SQLModel, 환경 변수)

6. **Phase 6: Documenter** (자동 실행)
   - 출력: API 문서 + README.md
   - OpenAPI 스키마 생성
   - 도메인별 README.md 작성

### Git Worktree 병렬 개발

**핵심 원칙**: 각 도메인은 독립적인 Worktree에서 개발

```bash
# 도메인별 Worktree 생성
git worktree add ../worktree-users feature/users
git worktree add ../worktree-community feature/community

# 병렬 개발 (각 Worktree에 에이전트 할당)
# - users 도메인: logic-code-generator + test-code-generator
# - community 도메인: logic-code-generator + test-code-generator

# 완료 후 순차 머지 (의존성 순서)
git merge feature/users      # 의존성 없음 → 먼저 머지
git merge feature/community  # users 의존 → 나중 머지
```

**장점**:
- 도메인 간 충돌 제로
- 병렬 개발로 속도 향상
- Git 이력 깔끔하게 유지

## 출력 구조

```
{project-root}/
├── .env.example              # 환경 변수 템플릿
├── src/
│   ├── modules/
│   │   ├── users/
│   │   │   ├── _models.py    # Entities (SQLModel)
│   │   │   ├── register.py   # Use Case
│   │   │   ├── router.py     # Interface Adapter
│   │   │   └── README.md     # 도메인 문서
│   │   └── community/
│   │       ├── _models.py
│   │       ├── create_post.py
│   │       ├── router.py
│   │       └── README.md
│   ├── core/
│   │   ├── config.py         # 환경 변수 로드
│   │   ├── database.py       # DB 연결
│   │   ├── models.py         # BaseModel (TimestampMixin + SoftDeleteMixin)
│   │   ├── response.py       # ApiResponse[T] + Status enum
│   │   ├── exceptions.py     # AppError 계열 예외
│   │   ├── pagination.py     # OffsetPage[T], CursorPage[T]
│   │   ├── sorting.py        # parse_sort, SortField
│   │   ├── logger.py         # structlog 로거
│   │   ├── masking.py        # 민감 정보 마스킹
│   │   ├── middleware.py      # Pure ASGI 미들웨어
│   │   └── utils.py          # EnvironmentHelper
│   └── main.py               # FastAPI 앱 엔트리포인트
├── tests/
│   ├── test_users.py         # E2E 테스트
│   └── test_community.py
├── README.md                 # 프로젝트 문서
└── CLAUDE.md                 # 개발 가이드
```

## 에이전트/스킬 수정 시 주의사항

### Agent 프롬프트 수정 (`agents/*.md`)

- 각 에이전트는 독립적으로 실행되는 자율 에이전트
- Phase 4 에이전트는 팀 생성 및 태스크 분배 로직 포함
- `logic-code-generator`와 `test-code-generator`는 Worktree에서 실행
- 에이전트 간 의존성: Phase 1 → 2 → 3 → 4 → 5 → 6 순서 필수

### Skill 수정 (`skills/*/SKILL.md`)

각 스킬은 특정 패턴을 가르치는 교육 자료:

- **fastapi-architecture**: Vertical Slice + Clean Architecture 패턴
  - 디렉토리 구조, DTO 네이밍, OpenAPI 메타데이터
- **fastapi-security**: JWT 인증 및 SQLModel ORM 패턴
  - Bearer Token, 비밀번호 해싱, 환경 변수
- **fastapi-postgis**: PostGIS 위치 정보 저장 패턴
  - latlng + POINT 이중 저장, 공간 인덱싱
- **git-worktree-parallel**: Git Worktree 병렬 실행 패턴
  - Worktree 생성/머지, Topological Sort

### plugin.json 수정

- `name`, `description`, `version`, `author`, `keywords` 필드만 포함
- Phase 순서는 에이전트 간 Task 호출 체인으로 제어 (Phase 1 → 3 → 4 → 5 → 6)
- Phase 2는 선택적 (기본: Phase 1 → Phase 3 직접 호출)
- Phase 4는 TeamCreate + Git Worktree로 병렬 개발

## 아키텍처 원칙

### Vertical Slice Architecture

각 도메인은 독립적인 수직 슬라이스:
- 하나의 디렉토리에 모든 레이어 포함 (Model, Use Case, Router)
- 도메인 간 의존성 최소화
- 도메인 경계 명확

### Clean Architecture

3계층 분리:
1. **Entities** (`_models.py`): SQLModel 기반 도메인 모델
2. **Use Cases** (`{action}.py`): 비즈니스 로직
3. **Interface Adapters** (`router.py`): FastAPI 라우터

### 환경 변수 우선

Mock 데이터 절대 금지:
- 모든 설정은 환경 변수로 관리
- `.env.example` 필수 제공
- `pydantic-settings` 사용

## 플러그인이 하지 않는 것

- ❌ Frontend 코드 생성
- ❌ 데이터베이스 마이그레이션 자동 실행
- ❌ 배포 자동화
- ❌ Domain Book 생성 (별도 플러그인 사용)

→ **FastAPI 백엔드 코드만 생성**

## 다음 단계 통합

코드 생성 후 다른 플러그인과 연계:
- `domain-book-builder` 플러그인 → Domain Book 생성
- `flutter-ddd-builder` 플러그인 → Flutter 앱 생성 (미래)
- `nextjs-builder` 플러그인 → Next.js 웹 생성 (미래)

## 사용 예시

### 빠른 시작

```bash
# 1. Domain Book 생성 (선택적)
/domain-book-builder:1-clarify

# 2. FastAPI 프로젝트 생성
/python-fastapi-programmer:start
```

### 수동 실행

```bash
# Phase별 직접 실행
Task(
    subagent_type="python-fastapi-programmer:phase-1-domain-validator",
    prompt="users, community 도메인 검증"
)
```

## 라이선스

MIT
