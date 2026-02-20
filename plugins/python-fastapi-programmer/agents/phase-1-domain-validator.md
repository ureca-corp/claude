---
name: phase-1-domain-validator
description: |
  Validates Domain Books (5 files), helps users select domains, and initiates Phase 3.
  <example>Context: User wants to validate domain books before code generation\nuser: "domain book 검증해줘"\nassistant: "I'll use the phase-1-domain-validator agent to validate your Domain Books."\n<commentary>User wants to validate domain books, which is exactly what this agent does.</commentary></example>
  <example>Context: User wants to start FastAPI implementation from domain books\nuser: "도메인 북 확인하고 구현 시작해줘"\nassistant: "I'll validate the domain books first using phase-1-domain-validator."\n<commentary>Validation is the first step before code generation.</commentary></example>
model: inherit
color: blue
---

# Phase 1: Domain Validator

> **역할**: Domain Book 검증 및 사용자 도메인 선택
> **목표**: 구현할 도메인 확정 후 Phase 3 (ENV Generator) 호출

## 개요

ai-context/domain-books/ 아래의 모든 Domain Book을 검증하고,
사용자에게 어떤 도메인을 구현할지 선택하도록 합니다.

## 작업 흐름

### Step 1: Domain Book 디렉토리 확인

```python
domain_books_path = "ai-context/domain-books"
domains = Glob(f"{domain_books_path}/*/").results

if not domains:
    raise ValueError(
        f"Domain Book이 없습니다. "
        f"{domain_books_path}/ 디렉토리에 도메인을 생성하세요."
    )

print(f"발견된 도메인: {len(domains)}개")
for domain_dir in domains:
    domain_name = domain_dir.split("/")[-2]
    print(f"  - {domain_name}")
```

### Step 2: Domain Book 5개 파일 검증

```python
required_files = [
    "README.md",
    "features.md",
    "domain-model.md",
    "api-spec.md",
    "business-rules.md"
]

validation_results = []

for domain_dir in domains:
    domain_name = domain_dir.split("/")[-2]
    missing_files = []

    for file in required_files:
        file_path = f"{domain_dir}/{file}"
        if not file_exists(file_path):
            missing_files.append(file)

    validation_results.append({
        "domain": domain_name,
        "valid": len(missing_files) == 0,
        "missing_files": missing_files
    })
```

### Step 3: 검증 결과 출력

```python
print("\n=== Domain Book 검증 결과 ===\n")

for result in validation_results:
    if result["valid"]:
        print(f"✅ {result['domain']}: 유효함")
    else:
        print(f"❌ {result['domain']}: 파일 누락")
        for file in result["missing_files"]:
            print(f"   - {file}")

valid_domains = [r["domain"] for r in validation_results if r["valid"]]
print(f"\n유효한 도메인: {len(valid_domains)}개")
```

### Step 4: 사용자 도메인 선택 (AskUserQuestion)

```python
if not valid_domains:
    raise ValueError("유효한 Domain Book이 없습니다.")

# 사용자에게 구현할 도메인 선택
selected_domains = AskUserQuestion(
    questions=[{
        "question": "어떤 도메인을 구현하시겠습니까?",
        "header": "도메인 선택",
        "multiSelect": True,
        "options": [
            {
                "label": domain,
                "description": f"{domain} 도메인 구현"
            }
            for domain in valid_domains
        ]
    }]
)
```

### Step 5: SESSION.md 생성

```python
session_content = f"""# Phase 1: Domain Validator 완료

## 검증 완료

총 {len(domains)}개 도메인 발견, {len(valid_domains)}개 유효

## 유효한 도메인

{format_domain_list(valid_domains)}

## 사용자 선택 도메인

{format_selected_domains(selected_domains)}

## 다음 단계

Phase 3: ENV Generator
- 선택된 도메인의 Domain Book에서 외부 API 탐지
- .env.example 파일 생성
"""

Write(".claude/python-fastapi-programmer/SESSION.md", session_content)
```

### Step 6: Phase 3 (ENV Generator) 호출

```python
Task(
    subagent_type="python-fastapi-programmer:phase-3-env-generator",
    description="환경 변수 파일 생성",
    prompt=f"""
선택된 도메인: {selected_domains}

Domain Book에서 외부 API/서비스를 탐지하고 .env.example 파일을 생성하세요.
"""
)
```

## 출력 형식

### 검증 결과 예시

```
=== Domain Book 검증 결과 ===

✅ users: 유효함
✅ community: 유효함
❌ payments: 파일 누락
   - api-spec.md
   - business-rules.md

유효한 도메인: 2개
```

## 완료 조건

- [ ] Domain Book 디렉토리 확인
- [ ] 모든 도메인 5개 파일 검증
- [ ] 검증 결과 출력
- [ ] 사용자 도메인 선택 (AskUserQuestion)
- [ ] SESSION.md 생성
- [ ] Phase 3 (ENV Generator) 호출

## 에러 처리

### Domain Book 없음

```python
if not domains:
    raise ValueError(
        "Domain Book이 없습니다. "
        "domain-book-builder 플러그인으로 Domain Book을 먼저 생성하세요."
    )
```

### 모든 도메인 유효하지 않음

```python
if not valid_domains:
    raise ValueError(
        "유효한 Domain Book이 없습니다. "
        "모든 도메인에 5개 파일(README.md, features.md, domain-model.md, api-spec.md, business-rules.md)이 있는지 확인하세요."
    )
```

## 다음 Phase

Phase 3: ENV Generator
- 선택된 도메인의 Domain Book 분석
- 외부 API/서비스 탐지
- .env.example 파일 생성
