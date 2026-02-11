# Clarify 질문 패턴

## 모호함 카테고리별 질문 템플릿

### 범위 (Scope)

**탐지 패턴**:
- "회원", "주문", "상품" 같은 추상적 엔티티 용어
- "관리", "처리" 같은 광범위한 동작

**질문 템플릿**:
```python
{
    "question": "{엔티티}는 어떤 정보를 가지나요?",
    "header": "{엔티티} 범위",
    "multiSelect": True,
    "options": [
        {"label": "기본 정보 (이름, ID)", "description": "필수 식별 정보만"},
        {"label": "연락처 정보", "description": "이메일, 전화번호 등"},
        {"label": "주소 정보", "description": "배송/거주지"},
        {"label": "프로필 정보", "description": "사진, 소개 등"}
    ]
}
```

---

### 기능 (Feature)

**탐지 패턴**:
- "번역", "추천", "검색" 같은 동작 용어
- 동작의 범위나 세부사항이 불명확

**질문 템플릿**:
```python
{
    "question": "{기능} 결과를 저장하나요?",
    "header": "{기능} 저장",
    "multiSelect": False,
    "options": [
        {"label": "영구 저장", "description": "모든 기록 보관"},
        {"label": "세션만", "description": "앱 종료 시 삭제"},
        {"label": "저장 안 함", "description": "실시간만"}
    ]
}
```

---

### 제약 (Constraint)

**탐지 패턴**:
- "지원", "허용", "가능" 같은 제한 관련 용어
- 범위나 한계가 명확하지 않음

**질문 템플릿**:
```python
{
    "question": "언어 지원 범위는 어떻게 되나요?",
    "header": "지원 언어",
    "multiSelect": True,
    "options": [
        {"label": "한국어, 영어만", "description": "MVP 기본 2개 언어"},
        {"label": "주요 5개 언어", "description": "한/영/중/일/스페인어"},
        {"label": "10개 이상", "description": "다국어 확장"},
        {"label": "자동 감지", "description": "사용자 위치 기반"}
    ]
}
```

---

### 관계 (Relationship)

**탐지 패턴**:
- "A와 B", "연결", "연동" 같은 관계 표현
- 엔티티 간 연결 방식이 불명확

**질문 템플릿**:
```python
{
    "question": "{A}와 {B}의 관계는 어떻게 되나요?",
    "header": "{A}-{B} 관계",
    "multiSelect": False,
    "options": [
        {"label": "1:N (한 {A}가 여러 {B})", "description": "가장 일반적"},
        {"label": "1:1 (한 {A}당 하나의 {B})", "description": "일대일 대응"},
        {"label": "N:M (다대다)", "description": "복잡한 관계"}
    ]
}
```

---

### 권한 (Permission)

**탐지 패턴**:
- "누가", "어떻게" 같은 주체/방법 질문
- 권한이나 접근 제어가 불명확

**질문 템플릿**:
```python
{
    "question": "{액션}은 누가 할 수 있나요?",
    "header": "{액션} 권한",
    "multiSelect": False,
    "options": [
        {"label": "본인만", "description": "일반적인 권한 구조"},
        {"label": "본인 + 관리자", "description": "관리자 개입 가능"},
        {"label": "누구나", "description": "공개 액션"}
    ]
}
```

---

### 생명주기 (Lifecycle)

**탐지 패턴**:
- "생성", "삭제", "취소" 같은 생명주기 관련 동작
- 데이터 보관 정책이 불명확

**질문 템플릿**:
```python
{
    "question": "{엔티티} 삭제 시 데이터는 어떻게 처리하나요?",
    "header": "삭제 정책",
    "multiSelect": False,
    "options": [
        {"label": "즉시 삭제", "description": "복구 불가"},
        {"label": "30일 보관 후 삭제", "description": "복구 가능 기간"},
        {"label": "익명화 보관", "description": "개인정보만 제거"},
        {"label": "영구 보관", "description": "삭제 안 함"}
    ]
}
```

---

## 옵션 수에 따른 multiSelect 결정

| 옵션 수 | multiSelect | 이유 |
|---------|-------------|------|
| 2개 | False | 예/아니오 선택 |
| 3-4개 | True | 여러 선택 가능 |
| 5개 이상 | True + "기타" | 확장 가능 |

---

## 좋은 질문 예시

### ✅ 도메인 중심

```python
{
    "question": "회원 프로필에 어떤 정보가 필요한가요?",
    "header": "회원 정보",
    "multiSelect": True,
    "options": [
        {"label": "기본 (이름, 이메일)", "description": "최소한의 정보만"},
        {"label": "프로필 사진", "description": "선택적 이미지 추가"},
        {"label": "선호 언어", "description": "자동 언어 전환용"}
    ]
}
```

### ❌ 기술 중심 (금지)

```python
{
    "question": "User 테이블에 어떤 컬럼이 필요한가요?",
    "header": "User 스키마",
    "options": [
        {"label": "UUID vs INT", "description": "Primary Key 타입"},
        {"label": "VARCHAR(255)", "description": "이메일 컬럼"},
        {"label": "TIMESTAMP", "description": "생성 시각"}
    ]
}
```

---

## 옵션 설명 작성 원칙

### ✅ 좋은 설명

- **구체적**: "한국어, 영어만" (좋음) vs "기본 언어" (나쁨)
- **결과 명시**: "앱 종료 시 삭제" (좋음) vs "세션 저장" (나쁨)
- **한글 사용**: "일반 소비자" (좋음) vs "B2C" (나쁨)

### ❌ 나쁜 설명

- 추상적: "기본 설정", "일반적인 방식"
- 기술 용어: "JWT 인증", "REST API"
- 영어: "Free tier", "Basic plan"
