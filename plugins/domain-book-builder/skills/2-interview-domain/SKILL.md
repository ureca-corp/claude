---
name: interview-domain
description: 특정 도메인에 대해 엔티티 속성·관계·생명주기·권한·제약·비즈니스 룰 6가지 카테고리로 상세 인터뷰하여 모든 모호함을 제거한다. 배치(최대 4개)씩 질문하고 답변마다 SESSION.md를 즉시 업데이트한다.
user-invocable: false
---

# Skill: Interview Domain

## 목적

특정 도메인에 대한 **모든 모호함을 제거**하고 완전한 정의 확립

---

## 입력

- 도메인 이름 (예: "users", "translations")
- Phase 1 결과 (SESSION.md의 초기 도메인 정보)
- 이미 해결된 항목 목록 (선택)

---

## 출력

- 도메인별 완전한 정의 (SESSION.md 업데이트)
- 다음 배치 질문 또는 완료 표시

---

## 인터뷰 카테고리

| 카테고리 | 질문 예시 |
|----------|-----------|
| **엔티티 속성** | "User는 어떤 필드를 가지나요?" |
| **관계** | "User와 Translation의 관계는?" |
| **생명주기** | "회원 탈퇴 시 데이터는 어떻게 처리되나요?" |
| **권한** | "프로필 수정은 누가 할 수 있나요?" |
| **제약** | "Email 중복은 허용되나요?" |
| **비즈니스 룰** | "번역 결과는 얼마나 보관하나요?" |

---

## 작동 방식

### 1. 도메인 모호함 식별

SESSION.md에서 해당 도메인 정보를 읽고, 위 6가지 카테고리별로 아직 정의되지 않은 항목을 목록화한다:

```
도메인: users

미정의 항목:
1. 엔티티 속성 (high): User의 정확한 필드 목록?
2. 관계 (high):       User와 Translation의 관계?
3. 권한 (medium):     프로필 수정은 누가?
4. 제약 (medium):     Email 중복 허용 여부?
5. 생명주기 (medium): 탈퇴 시 데이터 처리?
6. 비즈니스 룰 (low): 특별한 정책이 있는지?
```

### 2. 배치 질문 생성

우선순위 순으로 최대 4개를 선택해 AskUserQuestion으로 질문한다.

### 3. 답변 즉시 반영

답변을 받으면 즉시 SESSION.md의 해당 도메인 섹션을 Edit으로 업데이트한다.

### 4. 재평가

답변에서 새로운 용어나 개념이 등장하면 추가 모호함을 생성한다:
- "프로필 사진" 답변 → "어떤 형식으로 저장?" 추가
- "선호 언어" 답변 → "가능한 값은?" 추가

6가지 카테고리가 모두 정의될 때까지 반복한다.

---

## 배치 크기 결정

| 상황 | 배치 크기 | 이유 |
|------|----------|------|
| 초기 인터뷰 | 3-4개 | 기본 구조 파악 |
| 상세 인터뷰 | 2-3개 | 깊이 있는 질문 |
| 마무리 | 1-2개 | 마지막 모호함 제거 |

---

## 질문 생성 원칙

### ✅ 좋은 질문 (도메인 지식)

- "User 엔티티의 속성은?"
- "Translation과 Mission의 관계는?"
- "번역 결과 저장 기간은?"
- "프로필 수정 권한은?"

### ❌ 나쁜 질문 (기술 구현)

- "User 테이블의 컬럼 타입은?"
- "Foreign Key 제약은?"
- "Index는 어디에?"
- "UUID vs Auto Increment?"

→ **개념적 정의만!** 구현 세부사항은 나중에.

---

## 완전성 기준

도메인 인터뷰가 완료되려면 아래 6가지가 모두 정의되어야 한다:

- [ ] **엔티티 속성** — 모든 필드가 정의됨
- [ ] **관계** — 다른 엔티티와의 관계가 명확함
- [ ] **생명주기** — 생성/수정/삭제 규칙이 있음
- [ ] **권한** — 누가 무엇을 할 수 있는지 정의됨
- [ ] **제약** — 필수/선택, 유효성 규칙이 명확함
- [ ] **비즈니스 룰** — 특별한 정책이 있으면 정의됨

---

## 예시

### 입력 (users 도메인)

```
도메인: users
초기 정보: "회원 관리 도메인"
완료된 항목: []
```

### 배치 1 질문

```python
{
    "questions": [
        {
            "question": "User 엔티티는 어떤 속성을 가지나요?",
            "header": "User 속성",
            "multiSelect": True,
            "options": [
                {
                    "label": "ID (고유 식별자)",
                    "description": "필수 - 시스템 자동 생성"
                },
                {
                    "label": "Email (이메일)",
                    "description": "로그인 및 연락용"
                },
                {
                    "label": "DisplayName (표시 이름)",
                    "description": "사용자 닉네임"
                },
                {
                    "label": "ProfileImage (프로필 사진)",
                    "description": "선택적"
                }
            ]
        },
        {
            "question": "User와 Translation의 관계는?",
            "header": "관계 정의",
            "multiSelect": False,
            "options": [
                {
                    "label": "1:N (한 사용자가 여러 번역 기록)",
                    "description": "가장 일반적"
                },
                {
                    "label": "1:1 (한 사용자당 하나의 번역만)",
                    "description": "제한적"
                }
            ]
        },
        {
            "question": "프로필 수정은 누가 할 수 있나요?",
            "header": "권한",
            "multiSelect": False,
            "options": [
                {
                    "label": "본인만",
                    "description": "일반적인 권한 구조"
                },
                {
                    "label": "본인 + 관리자",
                    "description": "관리자 개입 가능"
                }
            ]
        }
    ]
}
```

### 배치 1 답변 → SESSION.md 업데이트

```markdown
#### 배치 1 (완료 ✅)

| 항목 | 결정 |
|------|------|
| User 속성 | ID, Email, DisplayName, ProfileImage |
| User-Translation 관계 | 1:N (한 사용자가 여러 번역 기록) |
| 프로필 수정 권한 | 본인만 |

**새로운 모호함 발견**:
- ProfileImage는 어떤 형식으로 저장?
- Email 중복 허용 여부?
- DisplayName 길이 제한?

> 배치 2 질문 준비 중...
```

### 배치 2 질문

```python
{
    "questions": [
        {
            "question": "ProfileImage는 어떤 형식으로 저장하나요?",
            "header": "이미지 저장",
            "multiSelect": False,
            "options": [
                {
                    "label": "URL (외부 저장소)",
                    "description": "이미지는 외부에, 경로만 저장"
                },
                {
                    "label": "Base64 인코딩",
                    "description": "문자열로 직접 저장"
                }
            ]
        },
        {
            "question": "Email 중복은 허용되나요?",
            "header": "Email 제약",
            "multiSelect": False,
            "options": [
                {
                    "label": "허용",
                    "description": "같은 이메일로 여러 계정"
                },
                {
                    "label": "불허 (Unique)",
                    "description": "이메일당 하나의 계정"
                }
            ]
        }
    ]
}
```

### 배치 2 답변 → SESSION.md 업데이트

```markdown
#### 배치 2 (완료 ✅)

| 항목 | 결정 |
|------|------|
| ProfileImage 형식 | URL (외부 저장소 경로) |
| Email 중복 | 불허 (Unique 제약) |

**새로운 모호함**: 없음 ✅

### users 도메인 완료 ✅

**최종 정의**:
- 엔티티: User (4개 속성)
- 관계: Translation (1:N)
- 권한: 본인 수정만
- 제약: Email Unique, ProfileImage 선택적
```

---

## 옵션 설명 작성 가이드

**좋은 설명**:
- 구체적: "한 사용자가 여러 번역 기록" (좋음) vs "관계 정의" (나쁨)
- 결과 명시: "이메일당 하나의 계정" (좋음) vs "Unique 제약" (나쁨)
- 한글 사용: "본인만" (좋음) vs "Self-only" (나쁨)

---

## 진행 상황 테이블 포맷

```markdown
| 도메인 | 상태 | 배치 수 |
|--------|------|------------|
| users | ✅ 완료 | 2 |
| translations | 🚧 진행 중 | 1 |
| missions | ⏳ 대기 | 0 |
| phrases | ⏳ 대기 | 0 |
```
