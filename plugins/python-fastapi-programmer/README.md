# Python FastAPI Programmer

> Domain Book 기반 FastAPI 프로젝트 자동 생성 플러그인
> Vertical Slice + Clean Architecture, E2E 테스트, SQLModel ORM, JWT 인증, PostGIS 위치 정보

## 개요

이 플러그인은 Domain Book을 기반으로 FastAPI 프로젝트의 코드를 자동으로 생성합니다.

### 주요 특징

1. **도메인별 팀 기반 병렬 구현**
2. **환경 변수 우선 (Mock 데이터 금지)**
3. **아키텍처 패턴 강제** (Vertical Slice + Clean Architecture)
4. **프론트엔드 에이전트 지원** (OpenAPI 메타데이터)
5. **표준 인증 방식** (JWT Bearer Token)
6. **위치 정보 저장** (latlng + PostGIS)
7. **문서화 필수** (코드 주석 + README.md + CLAUDE.md)

## 커맨드

### `/start`

Domain Book을 자동으로 찾아 읽고 FastAPI 프로젝트 구현을 시작합니다.

**동작 방식:**
- `domain-book/`, `docs/domain-book/` 등에서 Domain Book 자동 검색
- 발견 시: Domain Book 전체 읽기 → 요약 출력 → Phase-1 Validator 시작
- 미발견 시: Domain Book 생성 방법 안내 (domain-book-builder 스킬 또는 수동 작성)

**사용법:**
```bash
/start
```

## Phase 순서

| Phase | Agent | 역할 |
|-------|-------|------|
| 1 | phase-1-domain-validator | Domain Book 검증 |
| 2 | phase-2-deep-researcher | Clarifier + Deep Researcher (선택적) |
| 3 | phase-3-env-generator | .env.example 생성 |
| 4 | phase-4-code-generator | 팀 생성 + 병렬 코드 생성 |
| 5 | phase-5-code-reviewer | 품질 검토 |
| 6 | phase-6-documenter | API 문서 생성 |

## 아키텍처 원칙

### Vertical Slice Architecture + Clean Architecture

```
src/modules/{domain}/
├── _models.py          # Entities
├── register.py         # Use Case
├── router.py           # Interface Adapter
└── README.md           # 도메인 문서
```

## 플러그인 스킬

이 플러그인에는 에이전트가 로드할 수 있는 재사용 가능한 스킬들이 포함되어 있습니다.

### 스킬 목록

| 스킬 | 설명 | 주요 내용 |
|------|------|----------|
| `python-fastapi-programmer:fastapi-architecture` | Vertical Slice + Clean Architecture 패턴 | - 디렉토리 구조<br>- DTO 네이밍 규칙<br>- OpenAPI 메타데이터<br>- 파일 구조 예시 |
| `python-fastapi-programmer:fastapi-security` | JWT 인증 및 SQLModel ORM 패턴 | - JWT Bearer Token<br>- SQLModel ORM<br>- 환경 변수<br>- 비밀번호 해싱 |
| `python-fastapi-programmer:fastapi-postgis` | PostGIS 위치 정보 저장 패턴 | - latlng + POINT 이중 저장<br>- 공간 인덱싱<br>- 거리 계산 쿼리 |
| `python-fastapi-programmer:git-worktree-parallel` | Git Worktree 병렬 실행 패턴 | - Worktree 생성/머지<br>- 병렬 도메인 개발<br>- Topological Sort |

### 스킬 사용 예시

에이전트가 스킬을 로드하는 방법:

```python
# 아키텍처 패턴 학습
Skill(skill="python-fastapi-programmer:fastapi-architecture")

# 보안 및 ORM 패턴 학습
Skill(skill="python-fastapi-programmer:fastapi-security")

# PostGIS 위치 정보 패턴 학습 (필요 시)
Skill(skill="python-fastapi-programmer:fastapi-postgis")

# Git Worktree 패턴 학습
Skill(skill="python-fastapi-programmer:git-worktree-parallel")
```

각 스킬은 `skills/{skill-name}/` 디렉토리에 위치하며, `SKILL.md` 파일과 `references/` 디렉토리를 포함합니다.

## 사용 방법

### 🚀 빠른 시작

가장 쉬운 방법은 `/start` 커맨드를 사용하는 것입니다:

```bash
# Domain Book을 자동으로 찾아 읽고 구현 시작
/start
```

이 커맨드는:
1. Domain Book을 자동으로 찾아 읽음 (`domain-book/`, `docs/domain-book/` 등)
2. Domain Book이 있으면 Phase-1 Validator를 시작
3. Domain Book이 없으면 생성을 안내

### 🔧 수동 실행

또는 직접 에이전트를 실행할 수 있습니다:

```bash
Task(
    subagent_type="python-fastapi-programmer:phase-1-domain-validator",
    prompt="users, community 도메인 구현"
)
```

## 라이선스

MIT
