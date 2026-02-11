# Interview Domain 질문 패턴

## 도메인 인터뷰 카테고리별 질문 템플릿

### 엔티티 속성 (Entity Attributes)

**질문 목적**: 엔티티가 가지는 모든 필드 파악

**질문 템플릿**:
```python
{
    "question": "{Entity}는 어떤 속성을 가지나요?",
    "header": "{Entity} 속성",
    "multiSelect": True,
    "options": [
        {"label": "ID (고유 식별자)", "description": "필수 - 시스템 자동 생성"},
        {"label": "이름/제목", "description": "엔티티를 대표하는 이름"},
        {"label": "설명", "description": "상세 설명 텍스트"},
        {"label": "생성 시각", "description": "생성 날짜/시간"},
        {"label": "수정 시각", "description": "마지막 수정 날짜/시간"}
    ]
}
```

**예시**:
```python
{
    "question": "User 엔티티는 어떤 속성을 가지나요?",
    "header": "User 속성",
    "multiSelect": True,
    "options": [
        {"label": "ID (고유 식별자)", "description": "필수 - 시스템 자동 생성"},
        {"label": "Email (이메일)", "description": "로그인 및 연락용"},
        {"label": "DisplayName (표시 이름)", "description": "사용자 닉네임"},
        {"label": "ProfileImage (프로필 사진)", "description": "선택적"},
        {"label": "PreferredLanguage (선호 언어)", "description": "자동 언어 전환용"},
        {"label": "CreatedAt (가입 시각)", "description": "기록용"}
    ]
}
```

---

### 관계 (Relationships)

**질문 목적**: 다른 엔티티와의 연결 방식 파악

**질문 템플릿**:
```python
{
    "question": "{EntityA}와 {EntityB}의 관계는?",
    "header": "관계 정의",
    "multiSelect": False,
    "options": [
        {"label": "1:N (한 {A}가 여러 {B})", "description": "가장 일반적"},
        {"label": "1:1 (한 {A}당 하나의 {B})", "description": "일대일 대응"},
        {"label": "N:M ({A}와 {B} 다대다)", "description": "복잡한 관계"},
        {"label": "관계 없음", "description": "독립적"}
    ]
}
```

**예시**:
```python
{
    "question": "User와 Translation의 관계는?",
    "header": "관계 정의",
    "multiSelect": False,
    "options": [
        {"label": "1:N (한 사용자가 여러 번역 기록)", "description": "가장 일반적"},
        {"label": "1:1 (한 사용자당 하나의 번역만)", "description": "제한적"},
        {"label": "N:M (사용자와 번역 다대다)", "description": "복잡한 구조"}
    ]
}
```

---

### 생명주기 (Lifecycle)

**질문 목적**: 생성, 수정, 삭제 규칙 파악

**질문 템플릿**:
```python
{
    "question": "{Entity} 삭제 시 연결된 데이터는?",
    "header": "삭제 정책",
    "multiSelect": False,
    "options": [
        {"label": "함께 삭제 (Cascade)", "description": "모든 연결 데이터 삭제"},
        {"label": "연결 해제만", "description": "데이터는 유지, 참조만 제거"},
        {"label": "삭제 차단", "description": "연결 데이터 있으면 삭제 불가"}
    ]
}
```

**예시**:
```python
{
    "question": "User 삭제 시 번역 기록은 어떻게 되나요?",
    "header": "탈퇴 정책",
    "multiSelect": False,
    "options": [
        {"label": "함께 삭제", "description": "모든 번역 기록 삭제"},
        {"label": "익명화 유지", "description": "사용자 정보만 제거"},
        {"label": "삭제 차단", "description": "번역 기록 있으면 탈퇴 불가"}
    ]
}
```

---

### 권한 (Permissions)

**질문 목적**: 누가 어떤 액션을 할 수 있는지 파악

**질문 템플릿**:
```python
{
    "question": "{액션}은 누가 할 수 있나요?",
    "header": "권한",
    "multiSelect": False,
    "options": [
        {"label": "본인만", "description": "일반적인 권한 구조"},
        {"label": "본인 + 관리자", "description": "관리자 개입 가능"},
        {"label": "누구나", "description": "공개 액션"}
    ]
}
```

**예시**:
```python
{
    "question": "프로필 수정은 누가 할 수 있나요?",
    "header": "권한",
    "multiSelect": False,
    "options": [
        {"label": "본인만", "description": "일반적인 권한 구조"},
        {"label": "본인 + 관리자", "description": "관리자 개입 가능"},
        {"label": "누구나", "description": "공개 편집"}
    ]
}
```

---

### 제약 (Constraints)

**질문 목적**: 필수/선택, 유일성, 형식 등 제약 파악

**질문 템플릿**:
```python
{
    "question": "{필드} 중복은 허용되나요?",
    "header": "{필드} 제약",
    "multiSelect": False,
    "options": [
        {"label": "허용", "description": "같은 값 여러 개 가능"},
        {"label": "불허 (Unique)", "description": "고유해야 함"}
    ]
}
```

**예시**:
```python
{
    "question": "Email 중복은 허용되나요?",
    "header": "Email 제약",
    "multiSelect": False,
    "options": [
        {"label": "허용", "description": "같은 이메일로 여러 계정"},
        {"label": "불허 (Unique)", "description": "이메일당 하나의 계정"}
    ]
}
```

---

### 비즈니스 룰 (Business Rules)

**질문 목적**: 도메인 특유의 정책이나 규칙 파악

**질문 템플릿**:
```python
{
    "question": "{데이터}는 얼마나 보관하나요?",
    "header": "보관 정책",
    "multiSelect": False,
    "options": [
        {"label": "영구 보관", "description": "삭제 안 함"},
        {"label": "30일", "description": "30일 후 자동 삭제"},
        {"label": "90일", "description": "90일 후 자동 삭제"},
        {"label": "1년", "description": "1년 후 자동 삭제"}
    ]
}
```

**예시**:
```python
{
    "question": "번역 결과는 얼마나 보관하나요?",
    "header": "보관 정책",
    "multiSelect": False,
    "options": [
        {"label": "영구 보관", "description": "모든 기록 유지"},
        {"label": "30일", "description": "30일 후 자동 삭제"},
        {"label": "세션만", "description": "앱 종료 시 삭제"},
        {"label": "저장 안 함", "description": "실시간만"}
    ]
}
```

---

## 배치 크기 전략

| 상황 | 배치 크기 | 질문 수 | 이유 |
|------|-----------|---------|------|
| 초기 인터뷰 | 3-4개 | 3-4 | 기본 구조 파악 |
| 상세 인터뷰 | 2-3개 | 2-3 | 깊이 있는 질문 |
| 마무리 | 1-2개 | 1-2 | 마지막 모호함 제거 |

---

## 완전성 체크리스트

도메인 인터뷰 완료 조건:

- [ ] **엔티티 속성**: 모든 필드 정의됨
- [ ] **관계**: 다른 엔티티와의 관계 명확
- [ ] **생명주기**: 생성/수정/삭제 규칙
- [ ] **권한**: 누가 무엇을 할 수 있는지
- [ ] **제약**: 필수/선택, 유효성 규칙
- [ ] **비즈니스 룰**: 특별한 정책

---

## 예시: users 도메인 완전 인터뷰

### 배치 1 (기본 구조)

```python
[
    {
        "question": "User 엔티티는 어떤 속성을 가지나요?",
        "header": "User 속성",
        "multiSelect": True,
        "options": [...]  # 6개 속성
    },
    {
        "question": "User와 Translation의 관계는?",
        "header": "관계 정의",
        "multiSelect": False,
        "options": [...]  # 1:N 선택
    },
    {
        "question": "프로필 수정은 누가 할 수 있나요?",
        "header": "권한",
        "multiSelect": False,
        "options": [...]  # 본인만
    }
]
```

**새로운 모호함 발견**:
- ProfileImage는 어떤 형식으로 저장?
- PreferredLanguage의 가능한 값은?
- Email 중복 허용 여부?

---

### 배치 2 (상세 명세)

```python
[
    {
        "question": "ProfileImage는 어떤 형식으로 저장하나요?",
        "header": "이미지 저장",
        "multiSelect": False,
        "options": [
            {"label": "URL (외부 저장소)", "description": "S3, R2 등 외부 경로"},
            {"label": "Base64 인코딩", "description": "문자열로 직접 저장"}
        ]
    },
    {
        "question": "PreferredLanguage의 가능한 값은?",
        "header": "지원 언어",
        "multiSelect": True,
        "options": [
            {"label": "한국어 (ko)", "description": ""},
            {"label": "영어 (en)", "description": ""},
            {"label": "일본어 (ja)", "description": ""},
            {"label": "중국어 (zh)", "description": ""}
        ]
    },
    {
        "question": "Email 중복은 허용되나요?",
        "header": "Email 제약",
        "multiSelect": False,
        "options": [
            {"label": "허용", "description": "같은 이메일로 여러 계정"},
            {"label": "불허 (Unique)", "description": "이메일당 하나의 계정"}
        ]
    }
]
```

**새로운 모호함**: 없음 ✅

---

### 완료 상태

```markdown
### users 도메인 완료 ✅

**최종 정의**:
- 엔티티: User (6개 속성)
- 관계: Translation (1:N)
- 권한: 본인 수정만
- 제약: Email Unique, PreferredLanguage 2개 값만 (ko, en)
- 이미지: URL 형식
```
