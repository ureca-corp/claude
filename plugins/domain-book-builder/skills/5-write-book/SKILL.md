---
name: write-book
description: Domain Book 완성 - README + features + business-rules 생성
user-invocable: false
---

# Skill: Write Book

## 목적

각 도메인의 **Domain Book을 완성**하고 최종 검증

**철학**: "책의 모든 장(chapter)을 완벽하게 마무리"

---

## 입력

- 도메인 이름 (예: "users")
- Phase 3 결과 (`domain-model.md`)
- Phase 4 결과 (`api-spec.md`)
- SESSION.md (Phase 1-2 결과)

---

## 출력

각 도메인당 5개 파일:
- `README.md` (도메인 개요)
- `features.md` (기능 정의)
- `domain-model.md` ✅ (Phase 3 완성)
- `api-spec.md` ✅ (Phase 4 완성)
- `business-rules.md` (비즈니스 규칙)

---

## 사용 방법

### 1. README.md 생성

```python
from skills.write_book import generate_readme

readme = generate_readme(
    domain="users",
    domain_model=read("ai-context/domain-books/users/domain-model.md"),
    api_spec=read("ai-context/domain-books/users/api-spec.md"),
    session_data=read(".claude/SESSION.md")
)

# 결과:
# """
# # users 도메인
#
# > **역할**: 앱 사용자 관리
#
# ---
#
# ## 📚 목차
# ...
# """
```

### 2. features.md 생성

```python
from skills.write_book import generate_features

features = generate_features(
    domain="users",
    session_data=read(".claude/SESSION.md"),
    api_spec=read("ai-context/domain-books/users/api-spec.md")
)

# SESSION.md Phase 1-2 + api-spec.md 기반
```

### 3. business-rules.md 생성

```python
from skills.write_book import generate_business_rules

rules = generate_business_rules(
    domain="users",
    domain_model=read("ai-context/domain-books/users/domain-model.md"),
    session_data=read(".claude/SESSION.md")
)

# domain-model.md 제약 조건 + SESSION.md 비즈니스 룰 기반
```

### 4. 도메인 관계 추출

```python
from skills.write_book import extract_domain_relationships

relationships = extract_domain_relationships(
    domain="users",
    domain_model=read("ai-context/domain-books/users/domain-model.md"),
    all_domains=["users", "translations", "missions", "phrases"]
)

# 결과:
# {
#     "depends_on": [],  # users는 독립
#     "used_by": ["translations", "missions"]  # 이 도메인들이 users 참조
# }
```

---

## README.md 템플릿

```markdown
# {Domain} 도메인

> **역할**: {한 줄 설명}

---

## 📚 목차

1. [기능 정의](./features.md) - 이 도메인이 하는 일
2. [도메인 모델](./domain-model.md) - 유비쿼터스 언어 명세
3. [API 명세](./api-spec.md) - API 상세 설계
4. [비즈니스 규칙](./business-rules.md) - 제약조건, 정책

---

## 🔗 도메인 관계

### 의존하는 도메인
- `users` - 사용자 정보 필요

### 이 도메인을 사용하는 도메인
- `missions` - 번역 기록 조회

---

## 📊 요약

- **엔티티 수**: {수}
- **API 수**: {수}
- **상태 전이**: {있음/없음}

---

## 🎯 핵심 가치

{이 도메인의 핵심 가치를 한 문장으로}
```

### 사용 예시

```markdown
# users 도메인

> **역할**: 앱 사용자 관리

---

## 📚 목차

1. [기능 정의](./features.md) - 이 도메인이 하는 일
2. [도메인 모델](./domain-model.md) - 유비쿼터스 언어 명세
3. [API 명세](./api-spec.md) - API 상세 설계
4. [비즈니스 규칙](./business-rules.md) - 제약조건, 정책

---

## 🔗 도메인 관계

### 의존하는 도메인
- 없음 (독립 도메인)

### 이 도메인을 사용하는 도메인
- `translations` - 번역 기록 소유자 확인
- `missions` - 미션 진행자 확인

---

## 📊 요약

- **엔티티 수**: 1개 (User)
- **API 수**: 4개
- **상태 전이**: 없음

---

## 🎯 핵심 가치

사용자 정보를 안전하게 관리하고 다른 도메인에 신원 정보를 제공한다
```

---

## features.md 템플릿

```markdown
# {Domain} 기능 정의

## 📋 주요 기능

### 1. {기능 이름}

**설명**: {무엇을 하는가}

**사용자 시나리오**:
\`\`\`
사용자: {상황}
1. {액션 1}
2. {액션 2}
3. 결과: {결과}
\`\`\`

**입력**:
- {입력 1}
- {입력 2}

**출력**:
- {출력 1}
- {출력 2}

---

## 📱 화면 구성

> **디자인 원칙**: Instagram, Facebook, Twitter 등 1억 명 이상 사용하는 서비스의 UX를 참고하되, 심플하고 미니멀한 구성을 지향한다. `frontend-design` 스킬을 활용하여 디자인 품질을 확보한다.

### 화면 1: {화면 이름}

- **경로**: /{path}
- **도메인**: {domain}
- **화면 목적**: {이 화면의 핵심 가치}
- **UX 레퍼런스**: {참고 서비스의 유사 화면}
- **핵심 인터랙션**:
  - {주요 행동 1}
  - {주요 행동 2}
- **정보 구조**: {정보 우선순위}
- **네비게이션**: {이동 경로}
- **관련 기능**: 기능 {N}

---

## 🚫 범위 밖 (Out of Scope)

- {제외 사항 1}
- {제외 사항 2}
```

### 사용 예시

```markdown
# users 기능 정의

## 📋 주요 기능

### 1. 회원가입

**설명**: 새로운 사용자 계정을 생성한다

**사용자 시나리오**:
\`\`\`
여행자: 앱을 처음 사용한다
1. 이메일과 닉네임을 입력한다
2. 선호 언어를 선택한다 (선택사항)
3. 결과: 계정이 생성되고 자동 로그인된다
\`\`\`

**입력**:
- 이메일 (필수)
- 닉네임 (필수)
- 프로필 사진 (선택)
- 선호 언어 (선택, 기본값: 영어)

**출력**:
- 사용자 ID
- 가입 시각
- 프로필 정보

---

### 2. 프로필 조회

...

---

## 📱 화면 구성

> **디자인 원칙**: Instagram, KakaoTalk 등 1억 명 이상 사용하는 서비스의 UX를 참고하되, 심플하고 미니멀한 구성을 지향한다. `frontend-design` 스킬을 활용하여 디자인 품질을 확보한다.

### 화면 1: 로그인

- **경로**: /login
- **도메인**: users
- **화면 목적**: 최소한의 마찰로 앱에 진입한다
- **UX 레퍼런스**: Instagram 로그인 (로고 + 단 2개 입력필드 + 소셜 로그인)
- **핵심 인터랙션**:
  - 이메일/비밀번호 입력 후 로그인
  - 소셜 로그인 원탭 진입
- **정보 구조**: 브랜드 로고 > 입력 폼 > 소셜 로그인 > 회원가입 링크
- **네비게이션**: 성공 → /home, 회원가입 → /register
- **관련 기능**: 기능 1 (회원가입)

---

### 화면 2: 프로필

- **경로**: /profile
- **도메인**: users
- **화면 목적**: 내 정보를 한눈에 확인하고 편집한다
- **UX 레퍼런스**: Instagram 프로필 (프로필 사진 + 핵심 숫자 + 편집 버튼)
- **핵심 인터랙션**:
  - 프로필 사진/닉네임 확인
  - "편집" 탭하여 수정 모드 진입
- **정보 구조**: 프로필 사진 > 닉네임 > 활동 요약 > 설정
- **네비게이션**: 편집 → /profile/edit, 설정 → /settings
- **관련 기능**: 기능 2 (프로필 조회), 기능 3 (프로필 수정)

---

## 🚫 범위 밖 (Out of Scope)

- 소셜 로그인 (Google, Apple 등)
- 이메일 인증
- 비밀번호 찾기
- 관리자 권한 관리
```

---

## business-rules.md 템플릿

```markdown
# {Domain} 비즈니스 규칙

## 📐 제약 조건

### 1. {제약 이름}
{설명}

**이유**: {왜 이 제약이 필요한가}

---

## 🔄 상태 전이

{있으면 FSM 다이어그램, 없으면 "이 도메인은 상태 전이가 없습니다"}

---

## 🔐 권한 규칙

| 액션 | 권한 | 조건 |
|------|------|------|
| ... | ... | ... |

---

## 💡 비즈니스 로직

### {로직 이름}

\`\`\`
{처리 흐름}
\`\`\`

---

## 🚨 예외 상황 처리

### 1. {예외 상황}
- **대응**: {처리 방법}
```

### 사용 예시

```markdown
# users 비즈니스 규칙

## 📐 제약 조건

### 1. 이메일 유일성
이메일 주소는 시스템 전체에서 고유해야 한다.

**이유**: 이메일을 사용자 식별 수단으로 사용하므로, 중복되면 로그인 시 혼란 발생

---

### 2. 닉네임 길이
닉네임은 최소 1자, 최대 50자여야 한다.

**이유**: 너무 짧으면 식별 불가, 너무 길면 UI 깨짐

---

## 🔄 상태 전이

이 도메인은 상태 전이가 없습니다.

사용자는 "활성" 상태만 가지며, 탈퇴 시 즉시 삭제됩니다.

---

## 🔐 권한 규칙

| 액션 | 권한 | 조건 |
|------|------|------|
| 회원가입 | 누구나 | - |
| 프로필 조회 | 본인 | 자신의 프로필만 |
| 프로필 수정 | 본인 | 자신의 프로필만 |
| 회원 탈퇴 | 본인 | 자신의 계정만 |

---

## 💡 비즈니스 로직

### 선호 언어 기본값

\`\`\`
회원가입 시:
  - 선호 언어가 제공되면: 해당 언어 사용
  - 제공되지 않으면: 기본값 '영어' 설정
\`\`\`

---

### Cascade 삭제

\`\`\`
회원 탈퇴 시:
  1. 사용자의 모든 번역 기록 삭제
  2. 사용자의 모든 미션 진행 기록 삭제
  3. 사용자 엔티티 삭제
\`\`\`

---

## 🚨 예외 상황 처리

### 1. 이메일 중복
- **대응**: 가입 차단 + "이미 가입된 이메일입니다" 메시지

### 2. 존재하지 않는 사용자 조회
- **대응**: 404 오류 + "존재하지 않는 사용자입니다" 메시지

### 3. 권한 없는 수정 시도
- **대응**: 403 오류 + "본인만 수정할 수 있습니다" 메시지
```

---

## 도메인 요약 생성

```python
def generate_domain_summary(domain: str) -> dict:
    """도메인 요약 정보 생성"""

    domain_model = read(f"ai-context/domain-books/{domain}/domain-model.md")
    api_spec = read(f"ai-context/domain-books/{domain}/api-spec.md")

    # 엔티티 수 추출
    entities = extract_entities(domain_model)

    # API 수 추출
    apis = extract_api_count(api_spec)

    # 상태 전이 확인
    has_state_machine = detect_state_machine(domain_model)

    return {
        "entity_count": len(entities),
        "api_count": apis,
        "has_state_machine": has_state_machine
    }
```

---

## 핵심 가치 추출

```python
def extract_core_value(domain: str, session_data: dict) -> str:
    """도메인의 핵심 가치를 한 문장으로 추출"""

    # SESSION.md Phase 1에서 도메인 설명 찾기
    domain_desc = find_domain_description(domain, session_data)

    # 핵심 역할 추출
    core_role = extract_core_role(domain_desc)

    # 한 문장으로 요약
    # 예: "사용자 정보를 안전하게 관리하고 다른 도메인에 신원 정보를 제공한다"
    return summarize_to_sentence(core_role)
```

---

## 최종 검증

```python
def validate_domain_book(domain: str) -> dict:
    """Domain Book 완전성 검증"""

    base_path = f"ai-context/domain-books/{domain}"

    # 1. 필수 파일 존재 확인
    required_files = [
        "README.md",
        "features.md",
        "domain-model.md",
        "api-spec.md",
        "business-rules.md"
    ]

    for file in required_files:
        path = f"{base_path}/{file}"
        assert exists(path), f"Missing {file} in {domain}"

    # 2. 기술 용어 검사
    tech_terms = [
        "FastAPI", "PostgreSQL", "UUID", "VARCHAR",
        "JWT", "REST", "HTTP", "GET", "POST"
    ]

    for file in required_files:
        content = read(f"{base_path}/{file}")
        for term in tech_terms:
            assert term not in content, f"Technical term '{term}' found in {domain}/{file}"

    # 3. 한글 메시지 검사 (api-spec.md만)
    api_spec = read(f"{base_path}/api-spec.md")
    assert contains_korean_messages(api_spec), f"Missing Korean messages in {domain}/api-spec.md"

    # 4. 상호 참조 일관성
    domain_model = read(f"{base_path}/domain-model.md")
    api_spec = read(f"{base_path}/api-spec.md")
    assert is_consistent(domain_model, api_spec), f"Inconsistent references in {domain}"

    return {
        "domain": domain,
        "status": "PASS",
        "files": len(required_files),
        "technical_terms": 0,
        "korean_messages": True
    }
```

---

## 상호 참조 일관성 검사

```python
def is_consistent(domain_model: str, api_spec: str) -> bool:
    """domain-model과 api-spec 일관성 확인"""

    # 1. domain-model에 정의된 용어 추출
    defined_terms = extract_terms_from_model(domain_model)

    # 2. api-spec에서 사용된 필드명 추출
    used_fields = extract_fields_from_spec(api_spec)

    # 3. 모든 필드가 domain-model에 정의되어 있는지 확인
    for field in used_fields:
        if field not in defined_terms:
            return False

    return True
```

---

## 의존성 추출

```python
def extract_domain_references(domain: str, all_domains: list) -> list:
    """domain-model.md에서 참조하는 다른 도메인 탐지"""

    domain_model = read(f"ai-context/domain-books/{domain}/domain-model.md")
    referenced = []

    domain_keywords = {
        "users": ["사용자", "User", "회원"],
        "translations": ["번역", "Translation"],
        "missions": ["미션", "Mission"],
        "phrases": ["문장", "Phrase", "표현"]
    }

    for other_domain, keywords in domain_keywords.items():
        if other_domain == domain:
            continue  # 자기 자신 제외

        for keyword in keywords:
            if keyword in domain_model:
                referenced.append(other_domain)
                break

    return list(set(referenced))
```

---

## 완료 조건

Domain Book 완성 조건:

- [ ] 5개 파일 모두 존재
- [ ] README.md에 도메인 관계 명시
- [ ] features.md에 범위 밖 명시
- [ ] business-rules.md에 권한 규칙 포함
- [ ] 기술 용어 0개
- [ ] 한글 메시지 사용
- [ ] 상호 참조 일관성
- [ ] 모든 엔티티가 domain-model에 정의됨
- [ ] 모든 API가 api-spec에 명시됨
- [ ] 📱 화면 구성이 주요 사용자 시나리오를 커버
- [ ] 각 화면에 UX 레퍼런스 명시
- [ ] 화면 간 네비게이션 연결 확인
