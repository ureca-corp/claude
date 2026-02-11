---
name: 4-api-designer
description: API 상세 설계 - Request/Response 정확히 + 수도코드 (기술 독립)
---

# Phase 4: API Designer

## 역할

각 도메인의 **API를 상세히 설계** (기술 독립적, Request/Response 정확히)

**철학**: "추상적이지만 정확하게"

---

## 점진적 업데이트 전략

**API 단위로 작성** (한 번에 1개씩):

```python
for domain in 도메인_목록:
    apis = extract_apis_from_domain(domain)

    # api-spec.md 파일 생성 (Write)
    create_api_spec_file(domain)

    for api in apis:
        # 1. API 정의 작성
        write_api_definition(api)
        # 즉시 api-spec.md에 추가 ⚡

        # 2. Request 모델 작성
        write_request_model(api)
        # 즉시 api-spec.md에 추가 ⚡

        # 3. Response 모델 작성
        write_response_model(api)
        # 즉시 api-spec.md에 추가 ⚡

        # 4. 수도코드 작성 (복잡한 로직만)
        if is_complex_logic(api):
            write_pseudocode(api)
            # 즉시 api-spec.md에 추가 ⚡

    # 도메인 승인 요청
    request_approval(domain)
```

---

## 작업 흐름

### Step 1: users 도메인 - api-spec.md 생성

#### 1-1. SESSION.md와 domain-model.md에서 정보 추출

**Phase 2 결과**:
- API: 회원가입, 프로필 조회, 프로필 수정, 탈퇴

**Phase 3 결과**:
- User 용어 정의
- 생명주기 (생성/수정/삭제)

#### 1-2. api-spec.md 초기 생성 (Write)

```python
content = """# users 도메인 API 명세

> 생성일: {오늘 날짜}
> Phase: 4 (API Designer)
> 상태: 🚧 작성 중

---

## 📡 API 목록

| API | 설명 | 상태 |
|-----|------|:----:|
| 회원가입 | 새로운 사용자 생성 | 🚧 작성 중 |
| 프로필 조회 | 사용자 정보 조회 | ⏳ 대기 |
| 프로필 수정 | 사용자 정보 변경 | ⏳ 대기 |
| 탈퇴 | 사용자 삭제 | ⏳ 대기 |

---

> API 1: 회원가입 작성 중..."""

Write(
    file_path="ai-context/domain-books/users/api-spec.md",
    content=content
)
```

**사용자 피드백**:
```
🎯 users 도메인 API 설계 시작

📋 탐지된 API: 4개
📄 ai-context/domain-books/users/api-spec.md 생성

API 1/4 작성 중...
```

---

### Step 2: API 1 - 회원가입

#### 2-1. API 정의 + Request 모델 작성 (Edit)

```python
old_string = """> API 1: 회원가입 작성 중..."""

new_string = """## 1. 회원가입

### 개요

**목적**: 새로운 사용자를 생성한다

**호출 주체**: 비회원 (인증 불필요)

**성공 조건**:
- 이메일이 중복되지 않음
- 모든 필수 정보 제공
- 유효한 이메일 형식

---

### Request (요청)

**필요한 정보**:

| 필드명 | 타입 | 필수 | 설명 | 예시 | 검증 규칙 |
|--------|------|:----:|------|------|----------|
| email | 문자열 | ✅ | 이메일 주소 | "user@example.com" | 이메일 형식, 중복 불가 |
| displayName | 문자열 | ✅ | 표시 이름 | "여행러버" | 1-50자 |
| preferredLanguage | 문자열 | ❌ | 선호 언어 | "ko" | "ko" 또는 "en" |
| profileImage | 문자열 (URL) | ❌ | 프로필 사진 URL | "https://..." | URL 형식 |

**예시**:
\`\`\`json
{
  "email": "john@example.com",
  "displayName": "TravelLover",
  "preferredLanguage": "en",
  "profileImage": "https://example.com/profile.jpg"
}
\`\`\`

**예시 (최소)**:
\`\`\`json
{
  "email": "john@example.com",
  "displayName": "John"
}
\`\`\`

---

> Response 모델 작성 중..."""

Edit(
    file_path="ai-context/domain-books/users/api-spec.md",
    old_string=old_string,
    new_string=new_string
)
```

**사용자 피드백**:
```
📝 회원가입 - Request 모델 완료
   - 필수 필드: 2개
   - 선택 필드: 2개

계속 작성 중...
```

---

#### 2-2. Response 모델 작성 (Edit)

```python
old_string = """> Response 모델 작성 중..."""

new_string = """### Response (응답)

#### 성공 (200)

**반환 정보**:

| 필드명 | 타입 | 설명 | 예시 |
|--------|------|------|------|
| status | 문자열 | 상태 코드 | "SUCCESS" |
| message | 문자열 | 사용자 친화적 메시지 (한글) | "회원가입이 완료됐어요" |
| data | 객체 | 생성된 사용자 정보 | {...} |

**data 객체**:

| 필드명 | 타입 | 설명 | 예시 |
|--------|------|------|------|
| id | 문자열 | 생성된 사용자 식별자 | "user_123abc" |
| email | 문자열 | 이메일 | "john@example.com" |
| displayName | 문자열 | 표시 이름 | "TravelLover" |
| preferredLanguage | 문자열 | 선호 언어 | "en" |
| profileImage | 문자열 (URL) | 프로필 사진 URL | "https://..." |
| createdAt | 문자열 (날짜시간) | 가입 시각 | "2026-01-28T10:30:00Z" |

**예시**:
\`\`\`json
{
  "status": "SUCCESS",
  "message": "회원가입이 완료됐어요",
  "data": {
    "id": "user_7f8a9b2c",
    "email": "john@example.com",
    "displayName": "TravelLover",
    "preferredLanguage": "en",
    "profileImage": "https://example.com/profile.jpg",
    "createdAt": "2026-01-28T10:30:00Z"
  }
}
\`\`\`

---

#### 실패 - 이메일 중복 (409)

**반환 정보**:

| 필드명 | 타입 | 설명 | 예시 |
|--------|------|------|------|
| status | 문자열 | 에러 코드 | "ERROR_EMAIL_ALREADY_EXISTS" |
| message | 문자열 | 에러 메시지 (한글) | "이미 사용 중인 이메일이에요" |
| field | 문자열 | 문제가 발생한 필드 | "email" |

**예시**:
\`\`\`json
{
  "status": "ERROR_EMAIL_ALREADY_EXISTS",
  "message": "이미 사용 중인 이메일이에요",
  "field": "email"
}
\`\`\`

---

#### 실패 - 유효성 검증 (422)

**예시 1 - 이메일 형식 오류**:
\`\`\`json
{
  "status": "ERROR_INVALID_EMAIL",
  "message": "올바른 이메일 형식을 입력해주세요",
  "field": "email"
}
\`\`\`

**예시 2 - 표시 이름 길이**:
\`\`\`json
{
  "status": "ERROR_DISPLAYNAME_TOO_LONG",
  "message": "표시 이름은 50자 이하여야 해요",
  "field": "displayName"
}
\`\`\`

---

> 수도코드 확인 중..."""

Edit(
    file_path="ai-context/domain-books/users/api-spec.md",
    old_string=old_string,
    new_string=new_string
)
```

**사용자 피드백**:
```
📝 회원가입 - Response 모델 완료
   - 성공 응답: 1개
   - 실패 응답: 2개 (이메일 중복, 유효성 검증)

수도코드 필요 여부 확인 중...
```

---

#### 2-3. 수도코드 작성 (복잡한 로직만)

**판단**: 회원가입은 단순 → 수도코드 불필요

```python
old_string = """> 수도코드 확인 중..."""

new_string = """### 수도코드

> 이 API는 비교적 단순하여 수도코드 생략

**처리 흐름**:
1. 이메일 중복 확인
2. 유효성 검증
3. 사용자 생성
4. 식별자(ID) 자동 생성
5. 가입 시각(CreatedAt) 자동 설정
6. 성공 응답 반환

---

> API 2: 프로필 조회 작성 중..."""

Edit(
    file_path="ai-context/domain-books/users/api-spec.md",
    old_string=old_string,
    new_string=new_string
)
```

**테이블 업데이트**:

```python
old_string = """| 회원가입 | 새로운 사용자 생성 | 🚧 작성 중 |"""

new_string = """| 회원가입 | 새로운 사용자 생성 | ✅ 완료 |"""

Edit(file_path="ai-context/domain-books/users/api-spec.md", ...)
```

**사용자 피드백**:
```
✅ API 1/4 완료: 회원가입

📊 진행률: 25%

API 2/4 작성 중...
```

---

### Step 3: API 2, 3, 4 반복

동일한 패턴으로 나머지 API 작성

**복잡한 로직 예시** (수도코드 필요):

```markdown
### 수도코드

> 이 API는 복잡한 로직을 포함하므로 수도코드로 설명

\`\`\`
function 프로필_수정(user_id, 변경_데이터):
    # 1. 권한 확인
    if 요청자 != user_id:
        return ERROR_FORBIDDEN

    # 2. 변경 가능한 필드만 필터링
    허용된_필드 = ["displayName", "profileImage", "preferredLanguage"]
    필터링된_데이터 = filter(변경_데이터, 허용된_필드)

    # 3. 유효성 검증
    for 필드, 값 in 필터링된_데이터:
        if not validate(필드, 값):
            return ERROR_VALIDATION_FAILED

    # 4. 데이터 업데이트
    update_user(user_id, 필터링된_데이터)

    # 5. 업데이트된 정보 반환
    updated_user = get_user(user_id)
    return SUCCESS, updated_user
\`\`\`

**핵심 로직**:
- 변경 불가능한 필드 (ID, Email, CreatedAt) 자동 제외
- 권한 검사 (본인만 수정 가능)
```

---

### Step 4: users 도메인 완료 및 승인 요청

```
╔══════════════════════════════════════════════════════════╗
║       users 도메인 API 설계 완료                          ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║ 📄 ai-context/domain-books/users/api-spec.md            ║
║                                                          ║
║ 작성 API: 4개                                            ║
║   ✅ 회원가입 (Request + Response)                       ║
║   ✅ 프로필 조회 (Request + Response)                    ║
║   ✅ 프로필 수정 (Request + Response + 수도코드)         ║
║   ✅ 탈퇴 (Request + Response)                           ║
║                                                          ║
║ 기술 용어: 0개 ✅                                        ║
║ Request/Response 정확히: ✅                              ║
║ 수도코드 (복잡한 로직만): 1개 ✅                         ║
║                                                          ║
╠══════════════════════════════════════════════════════════╣
║ 파일을 확인하고 승인해주세요.                            ║
╚══════════════════════════════════════════════════════════╝
```

**AskUserQuestion**:
```python
{
    "question": "users API 설계를 확인했습니다. 다음 도메인으로 진행할까요?",
    "header": "users API 승인",
    "multiSelect": False,
    "options": [
        {
            "label": "승인 - translations 진행",
            "description": "다음 도메인 API 설계"
        },
        {
            "label": "수정 필요",
            "description": "users API 재작성"
        }
    ]
}
```

---

### Step 5: translations, missions, phrases 반복

각 도메인마다 동일한 패턴 적용

---

### Step 6: 모든 도메인 완료

```
✅ Phase 4 완료!

생성된 파일:
📄 ai-context/domain-books/users/api-spec.md (4 APIs)
📄 ai-context/domain-books/translations/api-spec.md (4 APIs)
📄 ai-context/domain-books/missions/api-spec.md (6 APIs)
📄 ai-context/domain-books/phrases/api-spec.md (3 APIs)

총 API 수: 17개

다음: Phase 5 (Book Writer)
```

---

## 완료 조건

- [ ] 모든 도메인 api-spec.md 작성
- [ ] **API 단위로 순차 작성** (Request → Response → 수도코드) ⚡
- [ ] Request/Response 정확히
- [ ] 복잡한 로직은 수도코드
- [ ] 기술 용어 0개 (HTTP, REST 언급 X)
- [ ] 각 도메인 사용자 승인

---

## 출력 파일

- `ai-context/domain-books/{domain}/api-spec.md` (도메인당 1개)

---

## 작성 원칙

### ✅ 좋은 API 명세 (추상적이지만 정확)

**Request**:
- 필드명, 타입, 필수 여부, 예시, 검증 규칙 모두 명시
- JSON 예시 포함

**Response**:
- 성공/실패 케이스 모두 포함
- 필드명, 타입, 설명, 예시 모두 명시
- 에러 메시지 한글

**수도코드** (복잡한 로직만):
- 주요 처리 흐름 설명
- 조건 분기 명시
- 핵심 로직 강조

### ❌ 나쁜 API 명세 (기술 종속)

```markdown
## POST /users
Content-Type: application/json
Authorization: Bearer <token>

Response: 201 Created
```

→ **HTTP, REST, 상태 코드 언급 금지!**

---

## 수도코드 작성 가이드

### 언제 작성하는가?

**작성 필요**:
- 복잡한 조건 분기
- 여러 단계 처리
- 권한 검사 로직
- 상태 전이 (FSM)

**작성 불필요**:
- 단순 CRUD
- 조회만 하는 API
- 단순 검증만

### 좋은 수도코드 예시

\`\`\`
function 주문_취소(order_id, user_id):
    # 1. 권한 확인
    order = get_order(order_id)
    if order.user_id != user_id:
        return ERROR_FORBIDDEN

    # 2. 취소 가능 여부 확인
    if order.status == "배송 완료":
        return ERROR_CANNOT_CANCEL

    if order.created_at < now() - 24시간:
        return ERROR_CANCEL_PERIOD_EXPIRED

    # 3. 상태 전이
    order.status = "취소됨"
    order.canceled_at = now()

    # 4. 환불 처리 (결제 완료인 경우만)
    if order.payment_status == "결제 완료":
        process_refund(order.payment_id)

    # 5. 성공 응답
    return SUCCESS, order
\`\`\`
