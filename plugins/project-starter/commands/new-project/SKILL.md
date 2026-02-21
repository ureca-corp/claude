---
name: new-project
description: 모노레포 기반 새 프로젝트 생성. Template repo에서 Flutter/FastAPI/Admin 코드를 하나의 GitHub repo에 구성합니다.
argument-hint: "[project-name]"
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - AskUserQuestion
---

# New Project

모노레포 기반 새 프로젝트를 scaffolding합니다. 하나의 GitHub repo(`ureca-corp/` org)에 모든 스택을 구성하고, 배포는 브랜치로 분리합니다.

## Template Repos

| Stack | Template | 디렉토리 |
|-------|----------|-----------|
| Flutter App | `ureca-corp/claude-code-flutter-template` | `app/` |
| FastAPI Backend | `ureca-corp/claude-code-python-fastapi-template` | `be/` |
| Next.js Admin | (미정) | `admin/` |

## Instructions

### Step 1: 프로젝트 정보 수집

argument로 project-name이 주어지지 않으면 AskUserQuestion으로 확인:

1. **프로젝트 이름** (kebab-case, 예: `teachle`, `my-project`)
2. **포함할 스택** (복수 선택):
   - Flutter App (`app/`)
   - FastAPI Backend (`be/`)
   - Next.js Admin (`admin/`)
3. **Repo 공개 여부** (기본값: private)

GitHub Organization은 항상 **`ureca-corp`** 고정입니다.

### Step 2: 사전 확인

```bash
# gh CLI 설치 확인
gh --version

# gh 인증 확인
gh auth status
```

설치/인증 안 되어 있으면 안내하고 중단.

### Step 3: GitHub 모노레포 생성

```bash
gh repo create ureca-corp/{project-name} --private --clone
cd {project-name}
```

### Step 4: Template 코드 가져오기

각 선택된 스택에 대해 template repo의 내용을 서브디렉토리로 복사합니다.
**template의 .git은 가져오지 않습니다** — 모노레포이므로 git은 하나만 있어야 합니다.

```bash
# FastAPI Backend
git clone --depth 1 https://github.com/ureca-corp/claude-code-python-fastapi-template.git _temp_be
rm -rf _temp_be/.git
mv _temp_be be

# Flutter App
git clone --depth 1 https://github.com/ureca-corp/claude-code-flutter-template.git _temp_app
rm -rf _temp_app/.git
mv _temp_app app

# Next.js Admin (template이 있는 경우)
# git clone --depth 1 https://github.com/ureca-corp/{admin-template}.git _temp_admin
# rm -rf _temp_admin/.git
# mv _temp_admin admin

# template이 없는 스택은 빈 디렉토리만 생성
mkdir -p admin
```

### Step 5: 모노레포 루트 구조 생성

**domain/** 디렉토리 생성:
```bash
mkdir -p domain
```

**루트 .gitignore** 생성:
```gitignore
# OS
.DS_Store
Thumbs.db

# IDE
.idea/
.vscode/
*.iml

# Environment
.env
.env.local
.env.*.local
```

**루트 README.md** 생성:
```markdown
# {Project Name}

## 구조

| 디렉토리 | 설명 | 스택 |
|----------|------|------|
| `domain/` | Domain Books (도메인 설계서) | - |
| `app/` | 모바일 앱 | Flutter |
| `be/` | 백엔드 API | FastAPI |
| `admin/` | 관리자 페이지 | Next.js |

## 개발 시작

1. Domain Book 생성: `/domain-book-builder:start`
2. 백엔드 코드 생성: `cd be/` → `/python-fastapi-programmer:start`
3. 앱 코드 생성: `cd app/` → `/flutter-ddd-builder:start`

## 브랜치 전략

| 브랜치 | 용도 |
|--------|------|
| `main` | 개발용 (전체 모노레포) |
| `feature/*` | 기능 개발 |
| `deploy/app` | Flutter 앱 배포 |
| `deploy/dev/be` | 백엔드 개발 배포 |
| `deploy/prod/be` | 백엔드 프로덕션 배포 |
| `deploy/dev/admin` | 관리자 개발 배포 |
| `deploy/prod/admin` | 관리자 프로덕션 배포 |
```

**루트 CLAUDE.md** 생성 (AGENTS.md 참조만):
```
@AGENTS.md
```

**루트 AGENTS.md** 생성 (실제 내용):
```markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 구조

모노레포 구조로, 하나의 GitHub repo에서 모든 스택을 관리합니다.

- `domain/` — Domain Books (도메인 설계서). domain-book-builder 플러그인 출력 위치.
- `app/` — Flutter 앱. 상세: `app/CLAUDE.md` 참조.
- `be/` — FastAPI 백엔드. 상세: `be/CLAUDE.md` 참조.
- `admin/` — Next.js 관리자. 상세: `admin/CLAUDE.md` 참조.

## 브랜치 전략

- `main`: 전체 모노레포 개발
- `feature/*`: 기능 개발 브랜치
- `deploy/{env}/{stack}`: 배포 브랜치 (deploy/dev/be, deploy/prod/be 등)
- `deploy/app`: Flutter 앱 배포

## Domain Books

`domain/` 디렉토리에 도메인별 설계서가 위치합니다.
be/와 app/의 코드 생성기가 이 파일들을 입력으로 사용합니다.

## 개발 워크플로우

1. `main` 브랜치에서 domain-book-builder로 도메인 설계
2. `be/`에서 python-fastapi-programmer로 백엔드 구현
3. `app/`에서 flutter-ddd-builder로 앱 구현
4. 각 배포 브랜치로 해당 스택만 push
```

### Step 6: 배포 브랜치 생성

```bash
# initial commit
git add -A
git commit -m "feat: 프로젝트 초기 구성"

# 배포 브랜치 생성 (main에서 분기)
git branch deploy/app
git branch deploy/dev/be
git branch deploy/prod/be
git branch deploy/dev/admin
git branch deploy/prod/admin
```

### Step 7: Push + 완료 안내

```bash
git push -u origin main
```

최종 안내 출력:

```
✅ 프로젝트 '{project-name}' 생성 완료!

📂 구조:
{project-name}/
├── domain/          ← Domain Books
├── app/             ← Flutter App
├── be/              ← FastAPI Backend
├── admin/           ← Next.js Admin
├── AGENTS.md        ← 프로젝트 가이드 (실제 내용)
├── CLAUDE.md        ← @AGENTS.md 참조
└── README.md

🌿 브랜치:
- main              ← 개발 (현재)
- deploy/app        ← Flutter 배포
- deploy/dev/be     ← 백엔드 개발 배포
- deploy/prod/be    ← 백엔드 프로덕션 배포
- deploy/dev/admin  ← 관리자 개발 배포
- deploy/prod/admin ← 관리자 프로덕션 배포

🚀 다음 단계:
1. /domain-book-builder:start  ← 도메인 설계서 작성
2. cd be/ && /python-fastapi-programmer:start  ← 백엔드 코드 생성
3. cd app/ && /flutter-ddd-builder:start  ← 앱 코드 생성

🔗 GitHub: https://github.com/ureca-corp/{project-name}
```

## Error Handling

- `gh` CLI 미설치 → `brew install gh` 안내
- `gh auth status` 실패 → `gh auth login` 안내
- repo 이름 중복 → 사용자에게 다른 이름 요청
- template repo 접근 불가 → 권한 확인 안내
- `git clone` 실패 → 네트워크/인증 확인 안내

## Tips

- 프로젝트 이름은 kebab-case 권장
- domain-book-builder는 반드시 **프로젝트 루트**에서 실행 (domain/ 에 출력)
- 각 서브프로젝트의 코드 생성기는 해당 **서브디렉토리**에서 실행
- 배포 브랜치는 CI/CD에서 해당 디렉토리만 빌드/배포하도록 설정
