---
name: 5-book-writer
description: Domain Book 완성 - 병렬 작성 + 의존성 자동 해결 (Topological Sort)
---

# Phase 5: Book Writer

## 역할

각 도메인의 **Domain Book을 완성**하고 최종 검증

**철학**: "책의 모든 장(chapter)을 완벽하게 마무리"

---

## 의존성 자동 해결 (Topological Sort)

### 문제

```
users 도메인 (독립)
translations 도메인 (users에 의존)
missions 도메인 (users에 의존)
phrases 도메인 (독립)
```

**병렬 작성 시**:
- translations를 작성하려면 users가 먼저 완성되어야 함
- missions를 작성하려면 users가 먼저 완성되어야 함

### 해결: Topological Sort

```python
# 1. 의존성 그래프 생성
dependencies = {}
for domain in domains:
    # domain-model.md에서 참조하는 다른 도메인 탐지
    refs = extract_domain_references(f"ai-context/domain-books/{domain}/domain-model.md")
    dependencies[domain] = refs

# 예시 결과:
# {
#     "users": [],
#     "translations": ["users"],
#     "missions": ["users"],
#     "phrases": []
# }

# 2. Topological Sort
sorted_domains = topological_sort(dependencies)
# ["users", "phrases", "translations", "missions"]
# 또는 ["users", "phrases"] (병렬), 그 다음 ["translations", "missions"] (병렬)

# 3. 레벨별 그룹화
levels = group_by_dependency_level(dependencies)
# {
#     0: ["users", "phrases"],      # 독립 도메인
#     1: ["translations", "missions"]  # users 의존
# }
```

---

## 작업 흐름

### Step 1: 의존성 분석

```python
print("🔍 도메인 의존성 분석 중...")

# Phase 3 결과에서 의존성 파악
dependencies = {}

for domain in ["users", "translations", "missions", "phrases"]:
    model_file = f"ai-context/domain-books/{domain}/domain-model.md"
    content = read(model_file)

    # "사용자에게 속한다", "User 용어" 등 참조 탐지
    referenced_domains = extract_references(content)
    dependencies[domain] = referenced_domains

print(f"""
의존성 그래프:
  users: []
  translations: ["users"]
  missions: ["users"]
  phrases: []
""")
```

---

### Step 2: Topological Sort + 레벨 그룹화

```python
levels = topological_sort_by_level(dependencies)

print(f"""
레벨별 그룹:
  Level 0 (독립): users, phrases
  Level 1 (users 의존): translations, missions
""")

print("""
병렬 실행 계획:
  1. users, phrases 동시 작성
  2. 완료 대기
  3. translations, missions 동시 작성
  4. 완료 대기
""")
```

---

### Step 3: Level 0 - 독립 도메인 병렬 작성

```python
print("📚 Level 0 작성 시작 (병렬)")

# users와 phrases 동시 작성
Task(
    subagent_type="domain-book-builder:5-book-writer:single",
    prompt="users 도메인 Domain Book 완성",
    domain="users"
)

Task(
    subagent_type="domain-book-builder:5-book-writer:single",
    prompt="phrases 도메인 Domain Book 완성",
    domain="phrases"
)

# 두 Task 모두 완료 대기
wait_for_completion()

print("""
✅ Level 0 완료
  ✅ users 완성
  ✅ phrases 완성
""")
```

---

### Step 4: Level 1 - 의존 도메인 병렬 작성

```python
print("📚 Level 1 작성 시작 (병렬)")

# translations와 missions 동시 작성
Task(
    subagent_type="domain-book-builder:5-book-writer:single",
    prompt="translations 도메인 Domain Book 완성",
    domain="translations"
)

Task(
    subagent_type="domain-book-builder:5-book-writer:single",
    prompt="missions 도메인 Domain Book 완성",
    domain="missions"
)

# 두 Task 모두 완료 대기
wait_for_completion()

print("""
✅ Level 1 완료
  ✅ translations 완성
  ✅ missions 완성
""")
```

---

### Step 5: 단일 도메인 작성 (Sub-Agent)

**5-book-writer:single** (실제 작성 담당):

```python
# 입력: domain (예: "users")

# 1. README.md 생성
create_readme(domain)
# ai-context/domain-books/users/README.md

# 2. features.md 생성
create_features(domain)
# SESSION.md Phase 1-2 결과 기반

# 3. business-rules.md 생성
create_business_rules(domain)
# SESSION.md Phase 2 + domain-model.md 기반

# 4. 기존 파일 정리
# domain-model.md (Phase 3 완성)
# api-spec.md (Phase 4 완성)

# 5. 최종 검증
validate_domain_book(domain)
```

---

### Step 6: 최종 검증

모든 도메인 완성 후:

```python
print("🔍 최종 검증 중...")

for domain in all_domains:
    # 1. 필수 파일 존재 확인
    required_files = [
        "README.md",
        "features.md",
        "domain-model.md",
        "api-spec.md",
        "business-rules.md"
    ]

    for file in required_files:
        path = f"ai-context/domain-books/{domain}/{file}"
        assert exists(path), f"Missing {file} in {domain}"

    # 2. 기술 용어 검사
    tech_terms = ["FastAPI", "PostgreSQL", "UUID", "VARCHAR", "JWT", "REST", "HTTP"]
    for file in required_files:
        content = read(f"ai-context/domain-books/{domain}/{file}")
        for term in tech_terms:
            assert term not in content, f"Technical term '{term}' found in {domain}/{file}"

    # 3. 한글 메시지 검사
    api_spec = read(f"ai-context/domain-books/{domain}/api-spec.md")
    assert contains_korean_messages(api_spec), f"Missing Korean messages in {domain}/api-spec.md"

    print(f"  ✅ {domain} 검증 통과")

print("✅ 모든 도메인 검증 통과")
```

---

### Step 7: 완료 보고

```
╔══════════════════════════════════════════════════════════╗
║               DOMAIN BOOK 완성!                          ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║ 📚 완성된 도메인: 4개                                    ║
║                                                          ║
║   users/                                                 ║
║     ├── README.md                                        ║
║     ├── features.md                                      ║
║     ├── domain-model.md                                  ║
║     ├── api-spec.md                                      ║
║     └── business-rules.md                                ║
║                                                          ║
║   translations/                                          ║
║     ├── README.md                                        ║
║     ├── features.md                                      ║
║     ├── domain-model.md                                  ║
║     ├── api-spec.md                                      ║
║     └── business-rules.md                                ║
║                                                          ║
║   missions/                                              ║
║     └── ... (5개 파일)                                   ║
║                                                          ║
║   phrases/                                               ║
║     └── ... (5개 파일)                                   ║
║                                                          ║
║ 총 파일 수: 20개                                         ║
║                                                          ║
║ 검증 결과:                                               ║
║   ✅ 필수 파일 모두 존재                                 ║
║   ✅ 기술 용어 0개                                       ║
║   ✅ 한글 메시지 사용                                    ║
║   ✅ 도메인 의존성 해결                                  ║
║                                                          ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║ 🎉 Domain Book이 완성되었습니다!                         ║
║                                                          ║
║ 📂 위치: ai-context/domain-books/                        ║
║                                                          ║
║ 다음 단계:                                               ║
║   - project-bootstrap 플러그인으로 백엔드 구현           ║
║   - flutter-builder 플러그인으로 앱 개발 (미래)          ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```

---

## 완료 조건

- [ ] 모든 도메인 5개 파일 완성
- [ ] 의존성 순서 보장 (Topological Sort)
- [ ] 병렬 실행 (독립 도메인 동시)
- [ ] 최종 검증 통과
- [ ] 기술 용어 0개

---

## 출력 파일

각 도메인당:
- `ai-context/domain-books/{domain}/README.md`
- `ai-context/domain-books/{domain}/features.md`
- `ai-context/domain-books/{domain}/domain-model.md` (Phase 3 완성)
- `ai-context/domain-books/{domain}/api-spec.md` (Phase 4 완성)
- `ai-context/domain-books/{domain}/business-rules.md`

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

## 🚫 범위 밖 (Out of Scope)

- {제외 사항 1}
- {제외 사항 2}
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

---

## 의존성 추출 알고리즘

```python
def extract_domain_references(filepath: str) -> list[str]:
    """domain-model.md에서 참조하는 다른 도메인 탐지"""

    content = read(filepath)
    referenced = []

    # 패턴 1: "사용자에게 속한다" → users 도메인 참조
    # 패턴 2: "User 용어" → users 도메인 참조
    # 패턴 3: "Translation과의 관계" → translations 도메인 참조

    domain_keywords = {
        "users": ["사용자", "User", "회원"],
        "translations": ["번역", "Translation"],
        "missions": ["미션", "Mission"],
        "phrases": ["문장", "Phrase", "표현"]
    }

    current_domain = extract_domain_from_path(filepath)

    for domain, keywords in domain_keywords.items():
        if domain == current_domain:
            continue  # 자기 자신 제외

        for keyword in keywords:
            if keyword in content:
                referenced.append(domain)
                break

    return list(set(referenced))
```

---

## Topological Sort 구현

```python
def topological_sort_by_level(dependencies: dict) -> dict:
    """의존성 그래프를 레벨별로 그룹화"""

    levels = {}
    visited = set()

    def get_level(domain, current_level=0):
        if domain in visited:
            return levels.get(domain, 0)

        visited.add(domain)

        if not dependencies[domain]:
            # 의존성 없음 → Level 0
            levels[domain] = 0
            return 0

        # 의존하는 도메인들의 최대 레벨 + 1
        max_dep_level = max(
            get_level(dep, current_level + 1)
            for dep in dependencies[domain]
        )
        levels[domain] = max_dep_level + 1
        return max_dep_level + 1

    for domain in dependencies:
        get_level(domain)

    # 레벨별 그룹화
    grouped = {}
    for domain, level in levels.items():
        if level not in grouped:
            grouped[level] = []
        grouped[level].append(domain)

    return grouped
```
