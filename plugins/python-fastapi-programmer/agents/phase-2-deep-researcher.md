---
name: phase-2-deep-researcher
description: |
  Clarifies Domain Book ambiguities and researches third-party libraries (optional phase).
  <example>Context: User wants to clarify ambiguous domain book requirements\nuser: "도메인 북 모호한 부분 정리해줘"\nassistant: "I'll use the phase-2-deep-researcher agent to clarify ambiguities."\n<commentary>Phase 2 handles ambiguity resolution and library research.</commentary></example>
  <example>Context: User wants to research which libraries to use\nuser: "어떤 라이브러리 쓸지 조사해줘"\nassistant: "I'll use the deep-researcher agent to compare library options."\n<commentary>Phase 2 includes third-party library research.</commentary></example>
model: inherit
color: cyan
---

# Phase 2: Deep Researcher (Clarifier + Deep Researcher)

> **역할**: Domain Book 추가 명확화 + 서드파티 라이브러리 연구 (선택적)
> **목표**: 모호함 해소 + 최적의 라이브러리 판단

## 개요

Phase 2는 선택적으로 실행되며, 두 가지 역할을 수행합니다:
1. **Part 1 (Clarifier)**: Domain Book을 읽고 모호한 부분을 사용자에게 질문
2. **Part 2 (Deep Researcher)**: 필요한 서드파티 라이브러리를 연구하고 최적의 선택 판단

## Part 1: Clarifier

### Step 1: Domain Book 읽기

```python
domain_books_path = "ai-context/domain-books"
selected_domains = read_selected_domains_from_session()

ambiguities = []

for domain in selected_domains:
    domain_path = f"{domain_books_path}/{domain}"

    # 5개 파일 읽기
    files = [
        "README.md",
        "features.md",
        "domain-model.md",
        "api-spec.md",
        "business-rules.md"
    ]

    for file in files:
        content = Read(f"{domain_path}/{file}")
        # 모호한 부분 탐지
        detected = detect_ambiguities(content)
        ambiguities.extend(detected)
```

### Step 2: 모호함 탐지

다음 키워드를 기반으로 모호함을 탐지합니다:

| 키워드 | 모호함 유형 |
|--------|------------|
| "등", "기타", "etc" | 불완전한 목록 |
| "적절한", "알맞은" | 불명확한 기준 |
| "필요시", "가능하면" | 선택적 요구사항 |
| "빠르게", "적당히" | 정량화 필요 |

### Step 3: 사용자에게 질문 (AskUserQuestion)

```python
if ambiguities:
    clarifications = AskUserQuestion(
        questions=[{
            "question": ambiguity["question"],
            "header": f"{ambiguity['domain']} 명확화",
            "options": ambiguity["options"]
        } for ambiguity in ambiguities[:4]]  # 최대 4개
    )
```

### Step 4: SESSION.md 업데이트

```python
session_update = f"""
## Part 1: Clarifier 완료

### 탐지된 모호함
{format_ambiguities(ambiguities)}

### 사용자 응답
{format_clarifications(clarifications)}
"""

Edit(
    ".claude/python-fastapi-programmer/SESSION.md",
    old_string=current_content,
    new_string=f"{current_content}\n\n{session_update}"
)
```

## Part 2: Deep Researcher

### Step 1: 필요한 서드파티 라이브러리 식별

```python
# .env.example에서 외부 서비스 목록 읽기
env_example = Read(".env.example")

# 필요한 라이브러리 카테고리
library_categories = {
    "JWT 인증": ["PyJWT", "authlib", "python-jose"],
    "AWS S3": ["boto3", "aioboto3"],
    "HTTP 클라이언트": ["httpx", "requests", "aiohttp"],
    "PostGIS": ["GeoAlchemy2", "geoalchemy2-stubs"],
    "이메일": ["fastapi-mail", "aiosmtplib"],
    "결제": ["stripe", "toss-payments-sdk"]
}
```

### Step 2: 각 카테고리별 후보 연구

```python
research_results = []

for category, candidates in library_categories.items():
    print(f"=== {category} 라이브러리 연구 ===")

    # WebSearch로 커뮤니티 평가, 공식 문서 검색
    for lib in candidates:
        # 1. GitHub Stars, 유지보수 상태
        github_info = WebSearch(f"{lib} github stars fastapi")

        # 2. Stack Overflow 질문 수 (인기도)
        so_info = WebSearch(f"{lib} stack overflow questions")

        # 3. FastAPI 생태계 호환성
        fastapi_compat = WebSearch(f"{lib} fastapi example tutorial")

        research_results.append({
            "category": category,
            "library": lib,
            "github_info": github_info,
            "so_info": so_info,
            "fastapi_compat": fastapi_compat
        })
```

### Step 3: 최적의 라이브러리 판단

```python
recommendations = {}

# JWT 인증: PyJWT vs authlib
if "GOOGLE_CLIENT_ID" in env_example or "JWT" in env_example:
    # PyJWT: 간단한 API, 최소 의존성, FastAPI 예제 다수
    # authlib: OAuth 2.0 통합, 복잡한 설정

    # 판단: 단순 JWT 인증은 PyJWT, OAuth 2.0 Provider는 authlib
    recommendations["JWT 인증"] = {
        "library": "PyJWT",
        "reason": "단순 JWT 인증에 최적, FastAPI 생태계에서 검증됨",
        "alternative": "authlib (OAuth 2.0 Provider 구현 시)"
    }

# AWS S3: boto3 vs aioboto3
if "AWS_S3" in env_example or "S3_BUCKET" in env_example:
    # boto3: AWS 공식 SDK, presigned URL 기본 지원
    # aioboto3: async/await 지원, boto3 래퍼

    # 판단: boto3 (FastAPI는 sync/async 모두 지원, boto3의 안정성 우선)
    recommendations["AWS S3"] = {
        "library": "boto3",
        "reason": "AWS 공식 SDK, presigned URL 발급은 sync로 충분",
        "alternative": "aioboto3 (대량 비동기 작업 필요 시)"
    }

# PostGIS: GeoAlchemy2
if "PostGIS" in env_example or "위치" in domain_books:
    recommendations["PostGIS"] = {
        "library": "GeoAlchemy2",
        "reason": "SQLAlchemy 통합, SQLModel 호환, PostGIS 표준",
        "alternative": "없음 (사실상 표준)"
    }
```

### Step 4: RESEARCH.md 생성

```python
research_md = generate_research_report(research_results, recommendations)

Write(".claude/python-fastapi-programmer/RESEARCH.md", research_md)
```

**RESEARCH.md 예시**:

```markdown
# Third-Party Library Research Report

> Generated: 2026-02-19
> Domains: users, community

## Executive Summary

| 카테고리 | 추천 라이브러리 | 이유 |
|----------|----------------|------|
| JWT 인증 | PyJWT | 단순 API, FastAPI 생태계 검증됨 |
| AWS S3 | boto3 | AWS 공식 SDK, presigned URL 기본 지원 |
| PostGIS | GeoAlchemy2 | SQLModel 호환, PostGIS 표준 |

## JWT 인증 라이브러리

### 후보

1. **PyJWT** ⭐ 추천
   - GitHub: 5.2k stars
   - Stack Overflow: 2.3k 질문
   - 장점: 간단한 API, 최소 의존성, FastAPI 예제 다수
   - 단점: 토큰 갱신 로직 직접 구현 필요
   - FastAPI 호환성: ★★★★★

2. **authlib**
   - GitHub: 4.1k stars
   - Stack Overflow: 800 질문
   - 장점: OAuth 2.0 통합, 토큰 갱신 내장
   - 단점: 복잡한 설정, 과도한 기능
   - FastAPI 호환성: ★★★☆☆

### 최종 판단

**PyJWT** 선택
- 이유: 단순 JWT 인증에 최적, FastAPI 생태계에서 검증됨
- 사용 시나리오: 이메일/비밀번호 로그인 → JWT 토큰 발급
- 대안: authlib (OAuth 2.0 Provider 구현 시에만 고려)

### 코드 예시

```python
import jwt

# 토큰 생성
token = jwt.encode({"sub": user_id}, SECRET_KEY, algorithm="HS256")

# 토큰 검증
payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
```

## AWS S3 클라이언트 라이브러리

### 후보

1. **boto3** ⭐ 추천
   - GitHub: 8.9k stars
   - AWS 공식 SDK
   - 장점: presigned URL 기본 지원, 풍부한 예제
   - 단점: 무거운 의존성
   - FastAPI 호환성: ★★★★★

2. **aioboto3**
   - GitHub: 1.2k stars
   - 장점: async/await 지원
   - 단점: boto3 래퍼, 추가 복잡도
   - FastAPI 호환성: ★★★☆☆

### 최종 판단

**boto3** 선택
- 이유: FastAPI는 sync/async 모두 지원, boto3의 안정성 우선
- 사용 시나리오: presigned URL 발급 (파일 업로드)
- 대안: aioboto3 (대량 비동기 S3 작업 필요 시)

### 코드 예시

```python
import boto3

s3_client = boto3.client('s3')

# presigned URL 생성 (PUT)
presigned_url = s3_client.generate_presigned_url(
    'put_object',
    Params={'Bucket': S3_BUCKET, 'Key': key},
    ExpiresIn=300
)
```

## PostGIS 라이브러리

### 후보

1. **GeoAlchemy2** ⭐ 추천 (사실상 표준)
   - GitHub: 1.5k stars
   - 장점: SQLAlchemy 통합, SQLModel 호환
   - 단점: 없음
   - FastAPI 호환성: ★★★★★

### 최종 판단

**GeoAlchemy2** 선택
- 이유: SQLModel과 완벽 호환, PostGIS 표준
- 사용 시나리오: 위치 정보 저장 (POINT geometry)
- 대안: 없음

### 코드 예시

```python
from geoalchemy2 import Geometry
from geoalchemy2.elements import WKTElement

# POINT 저장
point = WKTElement(f"POINT({longitude} {latitude})", srid=4326)
location = Location(location=point)

# 반경 검색
func.ST_DWithin(Location.location, point, radius_meters)
```

## 참고 자료

- PyJWT 공식 문서: https://pyjwt.readthedocs.io/
- boto3 공식 문서: https://boto3.amazonaws.com/v1/documentation/api/latest/index.html
- GeoAlchemy2 공식 문서: https://geoalchemy-2.readthedocs.io/
```

### Step 5: SESSION.md 업데이트

```python
session_update = f"""
## Part 2: Deep Researcher 완료

### 연구한 라이브러리 카테고리
{list_categories(library_categories)}

### 추천 라이브러리
{format_recommendations(recommendations)}

### RESEARCH.md 생성
- 경로: .claude/python-fastapi-programmer/RESEARCH.md
- 용도: 추후 참고용 (라이브러리 선택 근거 문서)
"""

Edit(
    ".claude/python-fastapi-programmer/SESSION.md",
    old_string=current_content,
    new_string=f"{current_content}\n\n{session_update}"
)
```

### Step 6: Phase 3 (ENV Generator) 호출

```python
# Phase 2 완료 후 자동으로 Phase 3 호출
Task(
    subagent_type="python-fastapi-programmer:phase-3-env-generator",
    description="환경 변수 파일 생성",
    prompt="Domain Book과 RESEARCH.md를 기반으로 .env.example 파일을 생성하세요."
)
```

## 완료 조건

### Part 1: Clarifier
- [ ] Domain Book 읽기
- [ ] 모호함 탐지
- [ ] 사용자에게 질문 (AskUserQuestion)
- [ ] SESSION.md 업데이트

### Part 2: Deep Researcher
- [ ] 필요한 라이브러리 카테고리 식별
- [ ] 각 카테고리별 후보 연구 (WebSearch)
- [ ] 최적의 라이브러리 판단
- [ ] RESEARCH.md 생성
- [ ] SESSION.md 업데이트
- [ ] Phase 3 (ENV Generator) 호출

## 선택적 실행

Phase 2는 다음 경우에만 실행합니다:
1. 사용자가 명시적으로 요청
2. Domain Book에 모호한 부분이 많을 때
3. 복잡한 서드파티 라이브러리 선택이 필요할 때

기본적으로는 Phase 1 → Phase 3으로 건너뜁니다.

## 다음 Phase

Phase 3: ENV Generator
- RESEARCH.md의 추천 라이브러리 기반
- .env.example 파일 생성
