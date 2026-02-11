---
name: design-api
description: API 명세 작성 - 정확한 Request/Response + 수도코드
user-invocable: false
---

# Skill: Design API

## 목적

도메인의 **API 명세**를 작성하고 입출력과 처리 흐름 정의

**철학**: "추상적 설계 말고, 정확한 명세"

---

## 입력

- 도메인 이름 (예: "users")
- Phase 2 결과 (SESSION.md의 도메인 정의)
- Phase 3 결과 (domain-model.md)

---

## 출력

- `ai-context/domain-books/{domain}/api-spec.md`
- API 목록 + Request/Response + 수도코드 (복잡한 로직만)

---

## 사용 방법

### 1. API 목록 추출

```python
from skills.design_api import extract_apis

apis = extract_apis(
    domain="users",
    session_data=read(".claude/SESSION.md"),
    domain_model=read("ai-context/domain-books/users/domain-model.md")
)

# 결과:
# [
#     {"name": "회원가입", "type": "create", "complexity": "simple"},
#     {"name": "프로필 조회", "type": "read", "complexity": "simple"},
#     {"name": "프로필 수정", "type": "update", "complexity": "simple"},
#     {"name": "회원 탈퇴", "type": "delete", "complexity": "medium"},  # Cascade 처리
#     ...
# ]
```

### 2. Request 모델 생성

```python
from skills.design_api import generate_request_model

request = generate_request_model(
    api_name="회원가입",
    domain_model=read("ai-context/domain-books/users/domain-model.md")
)

# 결과:
# {
#     "fields": [
#         {
#             "name": "email",
#             "type": "문자열",
#             "required": True,
#             "description": "로그인용 이메일 주소",
#             "example": "user@example.com",
#             "validation": ["이메일 형식", "중복 불가", "최대 255자"]
#         },
#         {
#             "name": "displayName",
#             "type": "문자열",
#             "required": True,
#             "description": "사용자 닉네임",
#             "example": "여행러버",
#             "validation": ["최소 1자", "최대 50자"]
#         },
#         ...
#     ]
# }
```

### 3. Response 모델 생성

```python
from skills.design_api import generate_response_model

response = generate_response_model(
    api_name="회원가입",
    domain_model=read("ai-context/domain-books/users/domain-model.md")
)

# 결과:
# {
#     "success": {
#         "status_code": 200,
#         "fields": [
#             {"name": "id", "type": "문자열", "description": "생성된 사용자 ID", "example": "u_123abc"},
#             {"name": "email", "type": "문자열", "description": "이메일 주소", "example": "user@example.com"},
#             {"name": "displayName", "type": "문자열", "description": "표시 이름", "example": "여행러버"},
#             {"name": "createdAt", "type": "날짜시간", "description": "가입 시각", "example": "2026-01-28T10:30:00Z"}
#         ]
#     },
#     "errors": [
#         {
#             "status_code": 409,
#             "condition": "이메일 중복",
#             "message": "이미 가입된 이메일입니다",
#             "fields": {"email": "user@example.com"}
#         },
#         {
#             "status_code": 400,
#             "condition": "필드 검증 실패",
#             "message": "이메일 형식이 올바르지 않습니다",
#             "fields": {"email": "invalid-email"}
#         }
#     ]
# }
```

### 4. 수도코드 생성 (복잡한 로직만)

```python
from skills.design_api import needs_pseudocode

if needs_pseudocode(api_name="회원가입", complexity="simple"):
    # False - 단순 CRUD는 수도코드 불필요
    pass
elif needs_pseudocode(api_name="회원 탈퇴", complexity="medium"):
    # True - Cascade 처리 등 복잡한 로직 있음
    pseudocode = generate_pseudocode(
        api_name="회원 탈퇴",
        domain_model=read("ai-context/domain-books/users/domain-model.md")
    )
```

---

## api-spec.md 구조

```markdown
# {domain} API 명세

> 생성일: {오늘 날짜}
> Phase: 4 (API Designer)
> 상태: ✅ 완료

---

## API 목록

| 번호 | API 이름 | 설명 | 복잡도 |
|------|----------|------|--------|
| 1 | 회원가입 | 새 사용자 생성 | 단순 |
| 2 | 프로필 조회 | 사용자 정보 조회 | 단순 |
| 3 | 프로필 수정 | 사용자 정보 변경 | 단순 |
| 4 | 회원 탈퇴 | 사용자 삭제 (Cascade) | 보통 |

---

## 1. 회원가입

### Request (요청)

| 필드명 | 타입 | 필수 | 설명 | 예시 | 검증 규칙 |
|--------|------|------|------|------|-----------|
| email | 문자열 | O | 로그인용 이메일 주소 | user@example.com | 이메일 형식, 중복 불가, 최대 255자 |
| displayName | 문자열 | O | 사용자 닉네임 | 여행러버 | 최소 1자, 최대 50자 |
| profileImage | 문자열 | X | 프로필 사진 URL | https://example.com/photo.jpg | URL 형식 |
| preferredLanguage | 문자열 | X | 선호 언어 | ko | 'ko' 또는 'en' (기본값: 'en') |

### Response (응답)

#### 성공 (200)

| 필드명 | 타입 | 설명 | 예시 |
|--------|------|------|------|
| id | 문자열 | 생성된 사용자 ID | u_123abc |
| email | 문자열 | 이메일 주소 | user@example.com |
| displayName | 문자열 | 표시 이름 | 여행러버 |
| profileImage | 문자열 | 프로필 사진 URL | https://example.com/photo.jpg |
| preferredLanguage | 문자열 | 선호 언어 | ko |
| createdAt | 날짜시간 | 가입 시각 | 2026-01-28T10:30:00Z |

#### 오류

| 상태 | 조건 | 메시지 | 필드 예시 |
|------|------|--------|-----------|
| 409 | 이메일 중복 | 이미 가입된 이메일입니다 | {"email": "user@example.com"} |
| 400 | 필드 검증 실패 | 이메일 형식이 올바르지 않습니다 | {"email": "invalid-email"} |
| 400 | 필수 필드 누락 | 필수 필드가 누락되었습니다 | {"displayName": null} |
| 400 | 언어 코드 오류 | 지원하지 않는 언어입니다 | {"preferredLanguage": "fr"} |

---

## 2. 프로필 조회

...

---

## 4. 회원 탈퇴

### Request (요청)

| 필드명 | 타입 | 필수 | 설명 | 예시 | 검증 규칙 |
|--------|------|------|------|------|-----------|
| userId | 문자열 | O | 삭제할 사용자 ID | u_123abc | - |

### Response (응답)

#### 성공 (200)

| 필드명 | 타입 | 설명 | 예시 |
|--------|------|------|------|
| message | 문자열 | 완료 메시지 | 회원 탈퇴가 완료되었습니다 |
| deletedCount | 숫자 | 삭제된 연관 데이터 수 | 15 |

#### 오류

| 상태 | 조건 | 메시지 | 필드 예시 |
|------|------|--------|-----------|
| 404 | 사용자 없음 | 존재하지 않는 사용자입니다 | {"userId": "u_999"} |
| 403 | 권한 없음 | 본인만 탈퇴할 수 있습니다 | {"userId": "u_123abc"} |

### 수도코드

\`\`\`
1. userId로 사용자를 조회한다
   - 없으면 404 오류 반환

2. 요청자가 본인인지 확인한다
   - 본인이 아니면 403 오류 반환

3. 연결된 모든 데이터를 조회한다
   - 번역 기록 목록
   - 미션 진행 기록 목록

4. 연결 데이터를 모두 삭제한다
   - 번역 기록 삭제 (Cascade)
   - 미션 진행 기록 삭제 (Cascade)
   - 삭제된 개수를 기록

5. 사용자 엔티티를 삭제한다

6. 삭제 완료 메시지와 개수를 반환한다
\`\`\`
```

---

## 작성 원칙

### Request 필드 설명

| 항목 | 내용 |
|------|------|
| **필드명** | camelCase (예: displayName) |
| **타입** | 한글 (문자열, 숫자, 불린, 날짜시간, 배열, 객체) |
| **필수** | O/X |
| **설명** | 구체적 역할 설명 |
| **예시** | 실제 사용 가능한 값 |
| **검증 규칙** | 모든 제약 조건 나열 |

### Response 필드 설명

| 항목 | 내용 |
|------|------|
| **필드명** | camelCase |
| **타입** | 한글 |
| **설명** | 필드 역할 설명 |
| **예시** | 실제 반환 값 예시 |

### 오류 응답 설명

| 항목 | 내용 |
|------|------|
| **상태** | 숫자 코드 (200, 400, 404 등) |
| **조건** | 오류 발생 조건 |
| **메시지** | **한글** 사용자 메시지 |
| **필드 예시** | 오류 관련 필드와 값 |

---

## 복잡도 판단 기준

### 단순 (수도코드 불필요)

- 단순 CRUD (생성, 조회, 수정, 삭제)
- 검증만 있는 경우
- 직접적인 데이터 반환

**예시**: 회원가입, 프로필 조회, 프로필 수정

### 보통 (수도코드 필요)

- Cascade 처리
- 다단계 검증
- 조건부 로직 (if/else)
- 여러 엔티티 조회/수정

**예시**: 회원 탈퇴 (연결 데이터 삭제), 주문 생성 (재고 확인 + 차감)

### 복잡 (수도코드 필수)

- 상태 전이 (FSM)
- 복잡한 계산 로직
- 외부 API 호출 + 후처리
- 트랜잭션 관리

**예시**: 결제 처리 (검증 → 결제 → 재고 차감 → 알림), 미션 진행 (상태 전이)

---

## 수도코드 작성 가이드

### 구조

```
1. [액션 1]
   - [세부사항 1-1]
   - [세부사항 1-2]

2. [액션 2]
   - [조건] 확인
   - 맞으면: [처리 A]
   - 아니면: [처리 B]

3. [액션 3]
   - [반복 처리]
   - 각 항목마다 [처리]

4. [결과 반환]
```

### 조건문

```
1. X를 확인한다
   - 맞으면: Y를 한다
   - 아니면: Z 오류 반환
```

### 반복문

```
1. 모든 A 목록을 조회한다

2. 각 A마다:
   - B를 처리한다
   - C를 기록한다

3. 처리된 개수를 반환한다
```

### 외부 호출

```
1. X API에 Y를 요청한다
   - 성공하면: 결과를 저장
   - 실패하면: Z 오류 반환

2. 저장된 결과로 A를 처리한다
```

---

## 타입 표현

### 기본 타입

| 영어 | 한글 |
|------|------|
| string | 문자열 |
| number | 숫자 |
| boolean | 불린 |
| datetime | 날짜시간 |
| array | 배열 |
| object | 객체 |

### 복합 타입

```markdown
| 필드명 | 타입 | 설명 |
|--------|------|------|
| tags | 문자열 배열 | 관심 태그 목록 |
| address | 주소 객체 | 주소 정보 |
| metadata | 객체 | 추가 정보 (자유 형식) |
```

**객체 타입은 별도 정의**:

```markdown
### 주소 객체

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| street | 문자열 | O | 도로명 |
| city | 문자열 | O | 도시 |
| zipCode | 문자열 | O | 우편번호 |
```

---

## 검증 규칙 예시

| 규칙 유형 | 표현 |
|-----------|------|
| 형식 | 이메일 형식, URL 형식, 전화번호 형식 |
| 길이 | 최소 N자, 최대 N자, 정확히 N자 |
| 범위 | N 이상, N 이하, N~M 사이 |
| 선택 | 'A', 'B', 'C' 중 하나 |
| 유일성 | 중복 불가 |
| 참조 | 존재하는 X여야 함 |

**예시**:
- "이메일 형식, 중복 불가, 최대 255자"
- "'ko', 'en' 중 하나 (기본값: 'en')"
- "1 이상 100 이하"
- "존재하는 사용자여야 함"

---

## 기술 용어 필터링

**금지 키워드**:
```python
TECH_KEYWORDS = [
    # 프로토콜
    "HTTP", "HTTPS", "REST", "GraphQL", "WebSocket",
    "GET", "POST", "PUT", "PATCH", "DELETE",

    # 인증
    "JWT", "OAuth", "Bearer", "Token",

    # 형식
    "JSON", "XML", "YAML",

    # 헤더
    "Content-Type", "Authorization", "Accept",

    # 상태 코드 용어
    "OK", "Created", "Bad Request", "Unauthorized", "Forbidden", "Not Found",
    "Conflict", "Internal Server Error"
]
```

**대신 사용**:
- "GET /api/users" → "사용자 목록 조회"
- "200 OK" → "성공 (200)"
- "404 Not Found" → "404"
- "JWT Token" → "인증 정보"
- "JSON Response" → "응답"

---

## 한글 메시지 필수

### ✅ 좋은 메시지

- "이미 가입된 이메일입니다"
- "필수 필드가 누락되었습니다"
- "본인만 수정할 수 있습니다"
- "회원 탈퇴가 완료되었습니다"

### ❌ 나쁜 메시지

- "Email already exists"
- "Invalid request"
- "Forbidden"
- "Success"

---

## 검증 체크리스트

api-spec.md 작성 완료 후:

- [ ] API 목록 테이블 있음
- [ ] 각 API마다 Request/Response 있음
- [ ] Request에 검증 규칙 명시
- [ ] Response에 성공/오류 모두 포함
- [ ] 오류 메시지가 모두 한글
- [ ] 복잡한 로직에 수도코드 있음
- [ ] 단순 CRUD에는 수도코드 없음
- [ ] 기술 용어 (HTTP, REST, JWT 등) 0개
- [ ] 타입 표현이 한글 ("문자열", "숫자" 등)
