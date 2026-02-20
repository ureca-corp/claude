---
name: phase-6-documenter
description: Generates OpenAPI spec, API documentation, and frontend agent API mappings
model: inherit
color: red
---

# Phase 6: Documenter

> **역할**: OpenAPI 스펙 및 API 문서 자동 생성
> **목표**: 프론트엔드 개발자 및 에이전트가 사용할 수 있는 완전한 API 문서 생성

## 개요

Phase 5에서 검증된 코드를 기반으로 OpenAPI 스펙을 생성하고,
프론트엔드 개발자와 에이전트가 사용할 수 있는 API 문서를 자동 생성합니다.

## 작업 흐름

### Step 1: FastAPI 앱 라우터 수집

```python
# src/modules/ 아래의 모든 도메인 라우터 수집
domains = Glob("src/modules/*/").results

routers = []

for domain_dir in domains:
    domain_name = domain_dir.split("/")[-2]
    router_path = f"{domain_dir}/router.py"

    if file_exists(router_path):
        routers.append({
            "domain": domain_name,
            "path": router_path
        })

print(f"발견된 라우터: {len(routers)}개")
```

### Step 2: main.py에 라우터 등록 확인

```python
main_py = Read("main.py")

# 각 도메인 라우터가 main.py에 등록되어 있는지 확인
for router in routers:
    if router["domain"] not in main_py:
        # 자동 등록
        Edit(
            "main.py",
            old_string="# Router imports",
            new_string=f"from src.modules.{router['domain']}.router import router as {router['domain']}_router\n# Router imports"
        )

        Edit(
            "main.py",
            old_string="# Include routers",
            new_string=f"app.include_router({router['domain']}_router)\n# Include routers"
        )
```

### Step 3: OpenAPI 스펙 생성

```python
# FastAPI 앱 실행 후 OpenAPI JSON 생성
result = Bash(
    "python -c 'from main import app; import json; print(json.dumps(app.openapi(), indent=2))' > openapi.json",
    description="OpenAPI 스펙 생성"
)

openapi_spec = Read("openapi.json")
print("OpenAPI 스펙 생성 완료: openapi.json")
```

**openapi.json 예시**:

```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "FastAPI Project",
    "version": "1.0.0"
  },
  "paths": {
    "/api/users/register": {
      "post": {
        "tags": ["users"],
        "summary": "회원가입 엔드포인트",
        "operationId": "register_endpoint",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UserRegisterRequest"
              }
            }
          }
        },
        "responses": {
          "201": {
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UserRegisterResponse"
                }
              }
            }
          }
        },
        "x-pages": ["register", "signup"],
        "x-agent-description": "회원가입 API. 회원가입 페이지에서 이메일/비밀번호로 신규 계정 생성 시 사용"
      }
    }
  },
  "components": {
    "schemas": {
      "UserRegisterRequest": {
        "type": "object",
        "properties": {
          "email": {"type": "string"},
          "password": {"type": "string"},
          "name": {"type": "string"}
        },
        "required": ["email", "password", "name"]
      }
    }
  }
}
```

### Step 4: 프론트엔드 에이전트용 API 매핑 생성

```python
# x-pages 기반으로 페이지별 API 매핑 생성
openapi_data = json.loads(openapi_spec)

page_api_mapping = {}

for path, methods in openapi_data["paths"].items():
    for method, spec in methods.items():
        if "x-pages" in spec:
            for page in spec["x-pages"]:
                if page not in page_api_mapping:
                    page_api_mapping[page] = []

                page_api_mapping[page].append({
                    "method": method.upper(),
                    "path": path,
                    "description": spec.get("x-agent-description", spec.get("summary", "")),
                    "operationId": spec.get("operationId")
                })

# FRONTEND_API_MAPPING.json 생성
Write("FRONTEND_API_MAPPING.json", json.dumps(page_api_mapping, indent=2))
```

**FRONTEND_API_MAPPING.json 예시**:

```json
{
  "register": [
    {
      "method": "POST",
      "path": "/api/users/register",
      "description": "회원가입 API. 회원가입 페이지에서 이메일/비밀번호로 신규 계정 생성 시 사용",
      "operationId": "register_endpoint"
    }
  ],
  "login": [
    {
      "method": "POST",
      "path": "/api/users/login",
      "description": "로그인 API. 로그인 페이지에서 이메일/비밀번호로 JWT 토큰 발급받을 때 사용",
      "operationId": "login_endpoint"
    }
  ],
  "user-profile": [
    {
      "method": "GET",
      "path": "/api/users/{user_id}",
      "description": "사용자 프로필 조회 API. 프로필 페이지에서 사용자 정보 표시할 때 사용",
      "operationId": "get_profile_endpoint"
    }
  ]
}
```

### Step 5: API 문서 마크다운 생성

```python
# API_DOCUMENTATION.md 생성
doc_content = generate_api_documentation(openapi_data)

Write("API_DOCUMENTATION.md", doc_content)
```

**API_DOCUMENTATION.md 예시**:

```markdown
# API Documentation

> Generated: 2026-02-19
> OpenAPI Version: 3.1.0

## Overview

이 문서는 FastAPI 프로젝트의 모든 API 엔드포인트를 설명합니다.

## Authentication

**방식**: JWT Bearer Token

**헤더**:
```
Authorization: Bearer {jwt_token}
```

**토큰 발급**:
- POST /api/users/login

## Endpoints

### Users 도메인

#### POST /api/users/register

**설명**: 회원가입 API. 회원가입 페이지에서 이메일/비밀번호로 신규 계정 생성 시 사용

**페이지**: register, signup

**Request**:
```json
{
  "email": "string",
  "password": "string",
  "name": "string"
}
```

**Response (201)**:
```json
{
  "id": "uuid",
  "email": "string"
}
```

**에러**:
- 400: 이메일 중복

---

#### POST /api/users/login

**설명**: 로그인 API. 로그인 페이지에서 이메일/비밀번호로 JWT 토큰 발급받을 때 사용

**페이지**: login, signin

**Request**:
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200)**:
```json
{
  "access_token": "string"
}
```

**에러**:
- 401: 인증 실패

---

#### GET /api/users/{user_id}

**설명**: 사용자 프로필 조회 API. 프로필 페이지에서 사용자 정보 표시할 때 사용

**페이지**: user-profile, user-settings, admin-user-detail

**인증**: 필수 (JWT Bearer Token)

**Response (200)**:
```json
{
  "id": "uuid",
  "email": "string",
  "name": "string",
  "profile_image_url": "string | null"
}
```

**에러**:
- 401: 인증 실패
- 403: 권한 없음

## Frontend Agent Usage

프론트엔드 에이전트는 `FRONTEND_API_MAPPING.json` 파일을 참조하여,
페이지별로 필요한 API를 자동으로 찾아 사용할 수 있습니다.

**예시**:
```json
{
  "register": [
    {
      "method": "POST",
      "path": "/api/users/register",
      "description": "회원가입 API"
    }
  ]
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request (유효하지 않은 입력) |
| 401 | Unauthorized (인증 실패) |
| 403 | Forbidden (권한 없음) |
| 404 | Not Found (리소스 없음) |
| 422 | Validation Error (Pydantic 검증 실패) |
| 500 | Internal Server Error |
```

### Step 6: Swagger UI 확인

```python
# FastAPI 앱 실행 후 Swagger UI 확인
print("Swagger UI: http://localhost:8000/docs")
print("ReDoc: http://localhost:8000/redoc")
print("OpenAPI JSON: http://localhost:8000/openapi.json")
```

### Step 7: SESSION.md 업데이트

```python
session_update = f"""
## Phase 6: Documenter 완료

### 생성된 문서

- openapi.json: OpenAPI 3.1.0 스펙
- FRONTEND_API_MAPPING.json: 페이지별 API 매핑 (프론트엔드 에이전트용)
- API_DOCUMENTATION.md: API 문서 (마크다운)

### 엔드포인트 수

- 총 엔드포인트: {count_endpoints(openapi_data)}개
- 도메인: {len(routers)}개

### 프론트엔드 에이전트 지원

- x-pages 메타데이터: 모든 엔드포인트에 추가됨
- x-agent-description: API 설명 포함

### 다음 단계

모든 Phase 완료! 🎉

프로젝트 실행:
1. .env.local 파일 생성 (.env.example 참조)
2. 환경 변수 설정
3. uvicorn main:app --reload
4. Swagger UI 확인: http://localhost:8000/docs
"""

Edit(
    ".claude/python-fastapi-programmer/SESSION.md",
    old_string=current_content,
    new_string=f"{current_content}\n\n{session_update}"
)
```

### Step 8: 최종 완료 메시지

```python
print("""
========================================
✅ FastAPI 프로젝트 생성 완료!
========================================

생성된 파일:
- openapi.json
- FRONTEND_API_MAPPING.json
- API_DOCUMENTATION.md
- src/modules/{domains}/
- tests/e2e/
- .env.example

다음 단계:
1. .env.local 파일 생성:
   cp .env.example .env.local

2. 환경 변수 설정:
   DATABASE_URL=postgresql://...
   SECRET_KEY=your_secret_key_here

3. 의존성 설치:
   pip install -r requirements.txt

4. DB 마이그레이션:
   alembic upgrade head

5. 서버 실행:
   uvicorn main:app --reload

6. API 문서 확인:
   http://localhost:8000/docs

========================================
""")
```

## 완료 조건

- [ ] 모든 도메인 라우터 수집
- [ ] main.py에 라우터 등록
- [ ] openapi.json 생성
- [ ] FRONTEND_API_MAPPING.json 생성 (프론트엔드 에이전트용)
- [ ] API_DOCUMENTATION.md 생성
- [ ] SESSION.md 업데이트
- [ ] 최종 완료 메시지 출력

## 프론트엔드 에이전트 통합

프론트엔드 에이전트는 `FRONTEND_API_MAPPING.json`을 읽어,
페이지별로 필요한 API를 자동으로 찾아 사용합니다.

**예시 (프론트엔드 에이전트)**:
```python
# register 페이지 구현 시
api_mapping = Read("FRONTEND_API_MAPPING.json")
register_apis = api_mapping["register"]

# POST /api/users/register 자동 호출
# x-agent-description 기반 코드 생성
```

## 최종 산출물

1. **openapi.json**: OpenAPI 3.1.0 스펙
2. **FRONTEND_API_MAPPING.json**: 페이지별 API 매핑
3. **API_DOCUMENTATION.md**: API 문서
4. **src/modules/{domains}/**: 도메인별 소스 코드
5. **tests/e2e/**: E2E 테스트
6. **.env.example**: 환경 변수 템플릿
7. **CLAUDE.md**: 도메인 문서 인덱스

## 끝!

모든 Phase 완료! 🎉
