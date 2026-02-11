---
name: 3-domain-modeler
description: 유비쿼터스 언어 명세 작성 - 서술형 도메인 모델 (ERD X)
---

# Phase 3: Domain Modeler

## 역할

각 도메인의 **유비쿼터스 언어**를 정의하고 서술형 명세 작성

**철학**: "ERD 그리기 말고, 말로 설명하기"

---

## 유비쿼터스 언어란?

**해당 도메인 전용이면서 개발자가 쉽게 이해할 수 있는 전용 언어**

```
ERD (잘못된 접근):
┌─────────┐        ┌──────────────┐
│  User   │───1:N──│ Translation  │
└─────────┘        └──────────────┘

유비쿼터스 언어 (올바른 접근):
"사용자는 여러 개의 번역 기록을 가질 수 있다."
"번역 기록은 반드시 한 명의 사용자에게 속한다."
```

---

## 점진적 업데이트 전략

**도메인별 순차 작성** (의존성 순서):

```python
# 1. 의존성 분석
dependencies = analyze_dependencies()
# {"users": [], "translations": ["users"], ...}

# 2. Topological Sort
sorted_domains = topological_sort(dependencies)
# ["users", "translations", "missions", "phrases"]

# 3. 순차 작성 (의존 도메인 먼저)
for domain in sorted_domains:
    # 3-1. 용어 정의 작성
    write_terms(domain)
    # 즉시 domain-model.md 생성 ⚡

    # 3-2. 관계 규칙 작성
    write_rules(domain)
    # 즉시 domain-model.md 추가 ⚡

    # 사용자 승인 요청
    request_approval(domain)
```

---

## 작업 흐름

### Step 1: 디렉토리 생성

첫 도메인(users) 시작 시:

```bash
mkdir -p ai-context/domain-books/users
```

---

### Step 2: users 도메인 - 용어 정의 작성

#### 2-1. SESSION.md에서 정보 추출

Phase 2 결과 읽기:
```markdown
### users 도메인

- 엔티티: User (6개 속성)
- 관계: Translation (1:N)
- 권한: 본인 수정만
- 제약: Email Unique
```

#### 2-2. domain-model.md 생성 (Write)

```python
content = """# users 도메인 모델

> 생성일: {오늘 날짜}
> Phase: 3 (Domain Modeler)
> 상태: 🚧 작성 중

---

## 📖 유비쿼터스 언어 (용어 정의)

> 이 도메인에서 사용하는 전용 용어들

### 핵심 용어

| 용어 | 정의 | 예시 |
|------|------|------|
| 사용자 (User) | 앱을 사용하는 개인 | "홍길동", "john@example.com" |
| 식별자 (ID) | 사용자를 고유하게 구분하는 값 | "u_123abc" |
| 이메일 (Email) | 로그인 및 연락용 이메일 주소 | "user@example.com" |
| 표시 이름 (DisplayName) | 다른 사용자에게 보이는 이름 | "여행러버", "TravelLover" |
| 프로필 사진 (ProfileImage) | 사용자의 프로필 이미지 URL | "https://.../ profile.jpg" |
| 선호 언어 (PreferredLanguage) | 사용자가 선호하는 언어 설정 | "한국어", "영어" |
| 가입 시각 (CreatedAt) | 사용자가 가입한 날짜와 시간 | "2026-01-28 10:30:00" |

---

> 관계 규칙 작성 중..."""

Write(
    file_path="ai-context/domain-books/users/domain-model.md",
    content=content
)
```

**사용자 피드백**:
```
🎯 users 도메인

📝 용어 정의 작성 완료 (7개 용어)
📄 ai-context/domain-books/users/domain-model.md 생성

계속 진행합니다...
```

---

### Step 3: users 도메인 - 관계 규칙 작성

#### 3-1. 관계 규칙 추가 (Edit)

```python
old_string = """> 관계 규칙 작성 중..."""

new_string = """## 📐 관계 규칙

> 이 도메인의 엔티티들이 어떻게 연결되는지 서술형으로 정의

### 사용자와 번역 기록

**규칙 1**: 사용자는 여러 개의 번역 기록을 가질 수 있다.
- 한 사용자가 0개 이상의 번역을 요청할 수 있음
- 예: "홍길동 사용자는 10개의 번역 기록을 가지고 있다"

**규칙 2**: 번역 기록은 반드시 한 명의 사용자에게 속한다.
- 모든 번역은 누가 요청했는지 기록됨
- 예: "이 번역 기록은 john@example.com 사용자의 것이다"

**규칙 3**: 사용자가 삭제되면 모든 번역 기록도 함께 삭제된다.
- 사용자 탈퇴 시 개인정보 보호를 위해 모든 데이터 삭제
- 예: "홍길동 사용자가 탈퇴하면 그의 번역 기록 10개도 모두 삭제된다"

---

### 사용자와 미션 진행 상태

**규칙 4**: 사용자는 여러 개의 미션 진행 기록을 가질 수 있다.
- 한 사용자가 여러 미션을 동시에 또는 순차적으로 진행 가능
- 예: "홍길동 사용자는 택시 미션, 결제 미션을 진행 중이다"

**규칙 5**: 미션 진행 기록은 반드시 한 명의 사용자에게 속한다.

---

## ✅ 제약 조건

> 엔티티가 지켜야 하는 규칙

### 필수 규칙

1. **식별자 (ID)**는 시스템이 자동으로 생성한다.
   - 사용자가 직접 설정할 수 없음

2. **이메일 (Email)**은 중복될 수 없다.
   - 이미 존재하는 이메일로는 가입 불가
   - 예: "user@example.com"으로 이미 가입되어 있으면 다시 가입 불가

3. **이메일 (Email)**은 반드시 유효한 형식이어야 한다.
   - "@" 기호 포함
   - 예: "user@example.com" (올바름), "userexample.com" (잘못됨)

4. **표시 이름 (DisplayName)**은 비어있을 수 없다.
   - 최소 1자 이상

5. **선호 언어 (PreferredLanguage)**는 '한국어' 또는 '영어'만 가능하다.
   - 다른 언어는 MVP에서 지원하지 않음

6. **프로필 사진 (ProfileImage)**은 선택 사항이다.
   - 없어도 가입 가능

---

## 🔄 생명주기

> 엔티티가 어떻게 생성, 수정, 삭제되는지

### 생성 (가입)

```
사용자가 가입을 요청한다
    ↓
이메일이 중복되지 않는지 확인한다
    ↓
모든 필수 정보가 제공되었는지 확인한다
    ↓
사용자 엔티티를 생성한다
    ↓
식별자(ID)와 가입 시각(CreatedAt)을 자동으로 설정한다
```

**규칙**: 가입 시 선호 언어가 제공되지 않으면 기본값은 '영어'로 설정된다.

### 수정 (프로필 편집)

```
사용자가 프로필 수정을 요청한다
    ↓
본인인지 확인한다 (권한 검사)
    ↓
수정 가능한 필드만 변경한다
```

**수정 가능한 필드**:
- 표시 이름 (DisplayName)
- 프로필 사진 (ProfileImage)
- 선호 언어 (PreferredLanguage)

**수정 불가능한 필드**:
- 식별자 (ID)
- 이메일 (Email)
- 가입 시각 (CreatedAt)

**규칙**: 본인만 자신의 프로필을 수정할 수 있다.

### 삭제 (탈퇴)

```
사용자가 탈퇴를 요청한다
    ↓
본인인지 확인한다
    ↓
연결된 모든 데이터를 확인한다
    ↓
번역 기록, 미션 진행 기록 등 모두 삭제한다
    ↓
사용자 엔티티를 삭제한다
```

**규칙**: 탈퇴는 즉시 실행되며, 복구 불가능하다.

---

## Phase 3 (users 도메인) 완료 ✅

**작성 완료**:
- ✅ 용어 정의 (7개)
- ✅ 관계 규칙 (5개)
- ✅ 제약 조건 (6개)
- ✅ 생명주기 (3단계)

**다음**: 사용자 승인 요청"""

Edit(
    file_path="ai-context/domain-books/users/domain-model.md",
    old_string=old_string,
    new_string=new_string
)
```

**사용자 피드백**:
```
✅ users 도메인 명세 완료!

📝 관계 규칙 (5개)
📝 제약 조건 (6개)
📝 생명주기 (3단계)

📄 ai-context/domain-books/users/domain-model.md 완성

확인해주세요.
```

---

### Step 4: users 도메인 승인 요청

```
╔══════════════════════════════════════════════════════════╗
║       users 도메인 모델 작성 완료                         ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║ 📄 ai-context/domain-books/users/domain-model.md        ║
║                                                          ║
║ 작성 내용:                                               ║
║   - 용어 정의: 7개                                       ║
║   - 관계 규칙: 5개                                       ║
║   - 제약 조건: 6개                                       ║
║   - 생명주기: 3단계 (생성/수정/삭제)                     ║
║                                                          ║
║ 기술 용어: 0개 ✅                                        ║
║ 서술형 작성: ✅                                          ║
║                                                          ║
╠══════════════════════════════════════════════════════════╣
║ 파일을 확인하고 승인해주세요.                            ║
╚══════════════════════════════════════════════════════════╝
```

**AskUserQuestion**:
```python
{
    "question": "users 도메인 모델을 확인했습니다. 다음 도메인으로 진행할까요?",
    "header": "users 승인",
    "multiSelect": False,
    "options": [
        {
            "label": "승인 - translations 진행",
            "description": "다음 도메인 작성"
        },
        {
            "label": "수정 필요",
            "description": "users 다시 작성"
        }
    ]
}
```

---

### Step 5: translations 도메인 작성

**동일한 패턴**:
1. `ai-context/domain-books/translations/` 디렉토리 생성
2. `domain-model.md` 생성 (Write)
3. 용어 정의 작성
4. 관계 규칙 추가 (Edit)
5. 제약 조건 추가 (Edit)
6. 생명주기 추가 (Edit)
7. 승인 요청

**의존성 주의**:
```
translations 도메인은 users에 의존
→ users 용어를 참조 가능
→ "번역 기록은 사용자에게 속한다" (users 용어 사용)
```

---

### Step 6: 모든 도메인 완료

```
✅ Phase 3 완료!

생성된 파일:
📄 ai-context/domain-books/users/domain-model.md
📄 ai-context/domain-books/translations/domain-model.md
📄 ai-context/domain-books/missions/domain-model.md
📄 ai-context/domain-books/phrases/domain-model.md

다음: Phase 4 (API Designer)
```

---

## 완료 조건

- [ ] 모든 도메인 domain-model.md 작성
- [ ] **용어 정의 → 관계 규칙 순차 작성** ⚡
- [ ] 서술형 명세 (ERD X)
- [ ] 기술 용어 0개
- [ ] 각 도메인 사용자 승인

---

## 출력 파일

- `ai-context/domain-books/{domain}/domain-model.md` (도메인당 1개)

---

## 작성 원칙

### ✅ 좋은 명세 (서술형)

"사용자는 여러 개의 번역 기록을 가질 수 있다."
"번역 기록은 반드시 한 명의 사용자에게 속한다."
"이메일은 중복될 수 없다."

### ❌ 나쁜 명세 (기술적)

"User 테이블의 id 컬럼은 UUID 타입"
"Translation.user_id는 User.id를 참조하는 Foreign Key"
"email 컬럼에 UNIQUE 제약"

→ **말로 설명하기!** 테이블/컬럼 언급 금지.

---

## 템플릿 구조

```markdown
# {domain} 도메인 모델

## 📖 유비쿼터스 언어 (용어 정의)

| 용어 | 정의 | 예시 |
|------|------|------|
| ... | ... | ... |

## 📐 관계 규칙

**규칙 1**: A는 B를 할 수 있다.
**규칙 2**: B는 반드시 C여야 한다.

## ✅ 제약 조건

1. X는 중복될 수 없다.
2. Y는 반드시 유효한 형식이어야 한다.

## 🔄 생명주기

### 생성
...

### 수정
...

### 삭제
...
```
