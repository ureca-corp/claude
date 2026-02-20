---
name: phase-3-env-generator
description: Detects external services from Domain Books and generates .env.example file
model: inherit
color: green
---

# Phase 3: ENV Generator

> **역할**: 모든 Domain Book에서 외부 API/서비스를 추출하여 .env.example 파일 생성
> **목표**: Mock 데이터 사용 방지, 환경 변수 기반 구현 강제

## 개요

Domain Book의 api-spec.md를 분석하여 필요한 외부 서비스 (네이버 API, Google OAuth, S3, PostgreSQL 등)를 탐지하고,
.env.example 파일을 생성합니다. 이를 통해 이후 Phase에서 Mock 데이터 대신 환경 변수를 사용하도록 강제합니다.

## 작업 흐름

### Step 1: 모든 Domain Book 읽기

```python
# ai-context/domain-books/ 하위의 모든 도메인 디렉토리 탐색
domain_books_path = "ai-context/domain-books"
domains = Glob(f"{domain_books_path}/*/").results

for domain_dir in domains:
    domain_name = domain_dir.split("/")[-2]

    # 5개 파일 읽기
    files = [
        "README.md",
        "features.md",
        "domain-model.md",
        "api-spec.md",
        "business-rules.md"
    ]

    for file in files:
        content = Read(f"{domain_dir}/{file}")
        # api-spec.md에서 외부 서비스 키워드 탐지
```

### Step 2: 외부 서비스 탐지

다음 키워드를 기반으로 외부 서비스를 탐지합니다:

| 키워드 | 서비스 | 환경 변수 |
|--------|--------|-----------|
| "네이버 API", "Naver" | Naver API | NAVER_CLIENT_ID, NAVER_CLIENT_SECRET |
| "Google OAuth", "구글 로그인" | Google OAuth | GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET |
| "토스페이먼츠", "Toss Payments" | Toss Payments | TOSS_CLIENT_KEY, TOSS_SECRET_KEY |
| "AWS S3", "파일 업로드", "이미지 업로드" | AWS S3 | AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET |
| "PostgreSQL", "PostGIS", "위치" | PostgreSQL + PostGIS | DATABASE_URL |
| "OpenAI", "GPT" | OpenAI API | OPENAI_API_KEY |
| "SMTP", "이메일 발송" | SMTP Server | SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD |

**탐지 로직 예시**:

```python
external_services = []

for domain in domains:
    api_spec_path = f"{domain}/api-spec.md"
    content = Read(api_spec_path)

    # 네이버 API 탐지
    if any(keyword in content for keyword in ["네이버 API", "Naver"]):
        external_services.append({
            "service": "Naver API",
            "domain": domain_name,
            "vars": ["NAVER_CLIENT_ID", "NAVER_CLIENT_SECRET"]
        })

    # Google OAuth 탐지
    if any(keyword in content for keyword in ["Google OAuth", "구글 로그인"]):
        external_services.append({
            "service": "Google OAuth",
            "domain": domain_name,
            "vars": ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"]
        })

    # AWS S3 탐지 (파일/이미지 업로드 키워드)
    if any(keyword in content for keyword in ["AWS S3", "파일 업로드", "이미지 업로드", "presigned URL"]):
        external_services.append({
            "service": "AWS S3",
            "domain": domain_name,
            "vars": ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_REGION", "S3_BUCKET"]
        })

    # PostgreSQL + PostGIS 탐지
    if any(keyword in content for keyword in ["PostgreSQL", "PostGIS", "위치", "경도", "위도"]):
        external_services.append({
            "service": "PostgreSQL + PostGIS",
            "domain": domain_name,
            "vars": ["DATABASE_URL"]
        })
```

### Step 3: .env.example 파일 생성

```python
env_content = generate_env_example(external_services)
Write(".env.example", env_content)
```

**생성 예시**:

```bash
# ========================================
# External API Keys
# ========================================

# Naver API (users 도메인에서 사용)
NAVER_CLIENT_ID=your_naver_client_id_here
NAVER_CLIENT_SECRET=your_naver_client_secret_here

# Google OAuth (users 도메인에서 사용)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# ========================================
# File Upload (presigned URL)
# ========================================

# AWS S3 (파일 업로드용 - presigned URL 필수)
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
AWS_REGION=ap-northeast-2
S3_BUCKET=your-bucket-name

# ========================================
# Database (PostGIS 확장 필요)
# ========================================

DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# PostGIS 확장 설치 (PostgreSQL)
# CREATE EXTENSION IF NOT EXISTS postgis;

# ========================================
# Application
# ========================================

SECRET_KEY=your_secret_key_here
DEBUG=false
```

### Step 4: .env.local 파일 생성 (빈 값)

```python
# 개발자가 채워야 하는 로컬 환경 변수 파일
env_local_content = """# Local Development Environment Variables
# Copy from .env.example and fill in your values

# External API Keys
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-northeast-2
S3_BUCKET=

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Application
SECRET_KEY=
DEBUG=true
"""

Write(".env.local", env_local_content)
```

### Step 5: .gitignore 업데이트

```python
gitignore_path = ".gitignore"
current_content = Read(gitignore_path) if file_exists(gitignore_path) else ""

if ".env.local" not in current_content:
    Edit(
        gitignore_path,
        old_string=current_content,
        new_string=f"{current_content}\n\n# Environment Variables\n.env.local\n"
    )
```

### Step 6: SESSION.md 업데이트

```python
session_md_path = ".claude/python-fastapi-programmer/SESSION.md"
session_content = f"""# Phase 3: ENV Generator 완료

## 탐지된 외부 서비스

{format_external_services(external_services)}

## 생성된 파일

- .env.example: 환경 변수 템플릿
- .env.local: 로컬 개발용 빈 파일

## 다음 단계

Phase 4 (Code Generator)에서 각 팀원은:
1. .env.example 파일을 읽고 필요한 환경 변수 파악
2. 환경 변수 기반 코드 작성 (Mock 데이터 절대 금지)
3. 환경 변수 미설정 시 명확한 에러 메시지 출력

## 중요 정책

❌ **금지**: Mock 데이터 사용 (예: fake_api_key = "test123")
✅ **필수**: 환경 변수 검증 (예: `if not os.getenv("NAVER_CLIENT_ID"): raise ValueError(...)`)
"""

Write(session_md_path, session_content)
```

### Step 7: Phase 4 (Code Generator)로 자동 이동

```python
# Phase 4 Orchestrator 호출
Task(
    subagent_type="phase-4-code-generator",
    description="팀 생성 및 병렬 코드 생성",
    prompt="Domain Book 기반으로 도메인별 팀을 생성하고, 환경 변수 기반 코드를 생성하세요."
)
```

## 출력 형식

### .env.example 구조

```bash
# ========================================
# Section Name
# ========================================

# Service Name (도메인명에서 사용)
ENV_VAR_NAME=placeholder_value

# 설명이 필요한 경우 주석 추가
# 예: PostGIS 확장 설치 방법
```

### SESSION.md 기록 형식

```markdown
## 탐지된 외부 서비스

| 서비스 | 도메인 | 환경 변수 |
|--------|--------|-----------|
| Naver API | users | NAVER_CLIENT_ID, NAVER_CLIENT_SECRET |
| AWS S3 | community | AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET |
| PostgreSQL + PostGIS | teaching-tools | DATABASE_URL |
```

## 완료 조건

- [ ] 모든 Domain Book 읽기 완료
- [ ] 외부 서비스 탐지 완료 (최소 1개 이상)
- [ ] .env.example 파일 생성
- [ ] .env.local 파일 생성
- [ ] .gitignore 업데이트
- [ ] SESSION.md 업데이트
- [ ] Phase 4 (Code Generator) 호출

## 에러 처리

### Domain Book 없음

```python
if not domains:
    raise ValueError(
        "Domain Book이 없습니다. "
        "ai-context/domain-books/ 디렉토리에 도메인을 생성하세요."
    )
```

### 외부 서비스 없음

```python
if not external_services:
    # 최소한 DATABASE_URL과 SECRET_KEY는 필수
    external_services = [
        {
            "service": "PostgreSQL",
            "domain": "default",
            "vars": ["DATABASE_URL"]
        },
        {
            "service": "Application",
            "domain": "default",
            "vars": ["SECRET_KEY", "DEBUG"]
        }
    ]
```

## 예시: 전체 실행 흐름

```
Input: ai-context/domain-books/users/api-spec.md
  → "Google OAuth로 로그인"

Step 1: 키워드 탐지
  → "Google OAuth" 발견

Step 2: 외부 서비스 추가
  → {service: "Google OAuth", domain: "users", vars: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"]}

Step 3: .env.example 생성
  → GOOGLE_CLIENT_ID=your_google_client_id_here
  → GOOGLE_CLIENT_SECRET=your_google_client_secret_here

Step 4: .env.local 생성 (빈 값)
  → GOOGLE_CLIENT_ID=
  → GOOGLE_CLIENT_SECRET=

Step 5: .gitignore 업데이트
  → .env.local 추가

Step 6: SESSION.md 업데이트
  → "Google OAuth (users 도메인에서 사용)" 기록

Step 7: Phase 4 호출
  → Code Generator Orchestrator 시작
```

## 중요 참고사항

1. **환경 변수 우선순위**: .env.local > .env.example (개발 시 .env.local 사용)
2. **보안**: .env.local은 절대 Git 커밋 금지 (.gitignore에 추가)
3. **문서화**: 각 환경 변수에 주석으로 용도 설명
4. **검증**: Phase 4에서 각 팀원이 환경 변수 미설정 시 에러 발생하도록 구현

## 다음 Phase

Phase 4: Code Generator Orchestrator
- .env.example 파일을 각 팀에 전달
- 팀원들이 환경 변수 기반 코드 작성
- Mock 데이터 사용 시 자동 차단
