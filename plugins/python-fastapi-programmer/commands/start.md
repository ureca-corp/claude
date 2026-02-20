---
name: start
description: Domain Book을 자동으로 찾아 FastAPI 프로젝트 구현 시작
argument-hint: "[--domain-book-path PATH]"
allowed-tools: "Glob, Read, Task, AskUserQuestion, Skill"
---

You are the **Start Command** for the python-fastapi-programmer plugin.

Your job is to automatically find and validate the Domain Book, then start the FastAPI project implementation.

## Arguments

- `--domain-book-path PATH`: Custom path to domain books directory (default: auto-detect)

## Step 1: Find Domain Book Directory

**IMPORTANT**: Phase-1 Domain Validator expects the structure:
```
ai-context/domain-books/{domain}/
  ├── README.md
  ├── features.md
  ├── domain-model.md
  ├── api-spec.md
  └── business-rules.md
```

**Check these locations in order (use Glob tool):**

```python
# Priority 1: Standard location (Phase-1 expects this!)
Glob(pattern="ai-context/domain-books/*/")

# Priority 2: Alternative location
Glob(pattern="domain-books/*/")

# Priority 3: Alternative in docs/
Glob(pattern="docs/domain-books/*/")
```

**Store the first non-empty result as `domain_book_base_path`.**

If user provided `--domain-book-path` argument, use that path instead and skip auto-detection.

## Step 1.5: Validate Structure (Quick Check)

If Domain Book directory found, validate that each domain has the required 5 files:

```python
# Get list of domains
domains = Glob(pattern=f"{domain_book_base_path}/*/")
domain_names = [path.split("/")[-2] for path in domains]

print(f"\n🔍 Domain Book 발견: {domain_book_base_path}")
print(f"✓ {len(domain_names)}개 도메인: {', '.join(domain_names)}\n")

# Validate each domain has required files
required_files = ["README.md", "features.md", "domain-model.md", "api-spec.md", "business-rules.md"]
invalid_domains = {}

for domain in domain_names:
    missing = []
    for file in required_files:
        result = Glob(pattern=f"{domain_book_base_path}/{domain}/{file}")
        if not result:  # File not found
            missing.append(file)

    if missing:
        invalid_domains[domain] = missing

# Report validation results
if invalid_domains:
    print("⚠️ 일부 도메인에 누락된 파일이 있습니다:")
    for domain, missing in invalid_domains.items():
        print(f"  - {domain}: {', '.join(missing)}")

    # Ask user if they want to proceed
    AskUserQuestion(
        questions=[{
            "question": "일부 도메인이 불완전합니다. 계속 진행하시겠습니까?",
            "header": "검증",
            "multiSelect": false,
            "options": [
                {
                    "label": "계속 진행 (Recommended)",
                    "description": "완전한 도메인만 구현합니다"
                },
                {
                    "label": "수정 후 재시작",
                    "description": "Domain Book을 수정하고 /start를 다시 실행하세요"
                }
            ]
        }]
    )

    # If user chose "수정 후 재시작", stop here
    if user_answer == "수정 후 재시작":
        print("\nDomain Book을 수정한 후 /start를 다시 실행하세요.")
        return
```

## Step 2A: If Domain Book EXISTS

If you found valid Domain Book directories:

1. **Read Domain Books and extract information**:

```python
print("\n📖 Domain Book 읽는 중...\n")

total_endpoints = 0
domain_summaries = []

for domain in domain_names:
    if domain in invalid_domains:
        continue  # Skip invalid domains

    # Read README for overview
    readme_path = f"{domain_book_base_path}/{domain}/README.md"
    readme = Read(file_path=readme_path)

    # Read api-spec to count endpoints
    api_spec_path = f"{domain_book_base_path}/{domain}/api-spec.md"
    api_spec = Read(file_path=api_spec_path)

    # Count endpoints (lines starting with ## POST, ## GET, ## PUT, ## DELETE, ## PATCH)
    endpoint_count = len([line for line in api_spec.split('\n') if line.startswith('## ') and any(method in line for method in ['POST', 'GET', 'PUT', 'DELETE', 'PATCH'])])
    total_endpoints += endpoint_count

    # Read features
    features_path = f"{domain_book_base_path}/{domain}/features.md"
    features = Read(file_path=features_path)

    print(f"  ✓ {domain}: {endpoint_count}개 API")

    domain_summaries.append({
        "name": domain,
        "endpoint_count": endpoint_count,
        "readme": readme,
        "features": features
    })
```

2. **Output a summary** in this format:

```markdown
✅ Domain Book 발견: {domain_book_base_path}

## 📋 프로젝트 개요
{Extract overview from first domain's README or create summary}

## 🏗️ 도메인 목록
{for each domain_summary}
- {name}: {extract description from README}

## 🚀 주요 기능
{combine features from all domains}

## 📊 API 엔드포인트
총 {total_endpoints}개 엔드포인트

---

이제 Phase-1 Domain Validator를 시작합니다...
```

3. **Launch Phase-1 Domain Validator**:

```python
print("\n🚀 Phase-1 Domain Validator 시작...\n")

try:
    Task(
        subagent_type="python-fastapi-programmer:phase-1-domain-validator",
        prompt=f"Domain Book 검증 및 FastAPI 프로젝트 구현 시작. Domain Book 경로: {domain_book_base_path}",
        description="Validate domain book and start implementation"
    )
except Exception as error:
    print(f"❌ Phase-1 Validator 시작 실패: {error}")

    # Ask user what to do
    AskUserQuestion(
        questions=[{
            "question": "Phase-1 Validator 시작에 실패했습니다. 어떻게 하시겠습니까?",
            "header": "에러",
            "multiSelect": false,
            "options": [
                {"label": "재시도", "description": "Phase-1 Validator를 다시 시작합니다"},
                {"label": "수동 실행", "description": "Task 도구를 직접 사용하여 디버그하세요"}
            ]
        }]
    )

    if user_answer == "재시도":
        # Retry
        Task(
            subagent_type="python-fastapi-programmer:phase-1-domain-validator",
            prompt=f"Domain Book 검증 및 FastAPI 프로젝트 구현 시작. Domain Book 경로: {domain_book_base_path}",
            description="Validate domain book and start (retry)"
        )
```

## Step 2B: If Domain Book DOES NOT EXIST

If you did NOT find any Domain Book directories:

1. **Output this message**:

```markdown
❌ Domain Book을 찾을 수 없습니다.

다음 경로를 확인했습니다:
- ai-context/domain-books/
- domain-books/
- docs/domain-books/

FastAPI 프로젝트를 구현하려면 먼저 Domain Book이 필요합니다.
```

2. **Ask the user what to do** using AskUserQuestion:

```python
AskUserQuestion(
    questions=[{
        "question": "Domain Book을 어떻게 생성하시겠습니까?",
        "header": "Domain Book",
        "multiSelect": false,
        "options": [
            {
                "label": "domain-book-builder로 자동 생성 (Recommended)",
                "description": "대화형 인터뷰를 통해 Domain Book을 단계별로 생성합니다"
            },
            {
                "label": "기존 문서 제공",
                "description": "PRD나 요구사항 문서가 있다면 경로를 알려주세요"
            },
            {
                "label": "수동으로 작성 후 다시 시작",
                "description": "직접 ai-context/domain-books/ 디렉토리를 만들고 /start를 다시 실행하세요"
            }
        ]
    }]
)
```

3. **Execute based on user's choice**:

```python
if user_answer == "domain-book-builder로 자동 생성 (Recommended)":
    # Launch domain-book-builder skill
    Skill(skill="domain-book-builder:1-clarify")

elif user_answer == "기존 문서 제공":
    # Ask for document path
    print("PRD나 요구사항 문서의 경로를 알려주세요.")
    print("해당 문서를 읽고 Domain Book 형식으로 변환하는 것을 도와드리겠습니다.")
    # Wait for user to provide path

else:  # "수동으로 작성 후 다시 시작"
    print("\nDomain Book 디렉토리 구조:")
    print("```")
    print("ai-context/domain-books/")
    print("├── {domain1}/")
    print("│   ├── README.md          # 도메인 개요")
    print("│   ├── features.md        # 주요 기능")
    print("│   ├── domain-model.md    # 엔티티 및 관계")
    print("│   ├── api-spec.md        # API 명세")
    print("│   └── business-rules.md  # 비즈니스 규칙")
    print("├── {domain2}/")
    print("│   └── ...")
    print("```")
    print("\n각 도메인마다 위 5개 파일을 작성한 후 /start를 다시 실행하세요.")
```

## Error Handling

### Multiple Domain Book Locations Found

If Glob finds Domain Books in multiple locations:

```python
found_locations = []
for pattern in ["ai-context/domain-books/*/", "domain-books/*/", "docs/domain-books/*/"]:
    result = Glob(pattern=pattern)
    if result:
        base = pattern.replace("*/", "")
        found_locations.append(base)

if len(found_locations) > 1:
    # Ask user to choose
    AskUserQuestion(
        questions=[{
            "question": "여러 위치에서 Domain Book을 발견했습니다. 어느 것을 사용하시겠습니까?",
            "header": "경로 선택",
            "multiSelect": false,
            "options": [
                {"label": location, "description": f"Domain count: {count_domains(location)}"}
                for location in found_locations
            ]
        }]
    )

    domain_book_base_path = user_selected_location
```

### Invalid Domain Book Structure

If a domain is missing required files, the validation step (Step 1.5) will catch it and ask the user whether to proceed or fix.

### Task Spawn Failure

If launching Phase-1 Validator fails, the error handler in Step 2A will offer retry or manual execution.

## Important Notes

- **ALWAYS** check `ai-context/domain-books/` first (Phase-1 Validator expects this path!)
- **ALWAYS** use the Glob tool to find files, NOT bash find/ls commands
- **ALWAYS** use the Read tool to read files, NOT bash cat commands
- **ALWAYS** validate Domain Book structure before proceeding (5 required files per domain)
- **DO NOT** proceed to implementation without a valid Domain Book (환경 변수 우선 원칙)
- **DO NOT** skip error handling - always gracefully handle failures
- Be concise and clear in your output
- Use Korean for all user-facing messages
- Show progress indicators (🔍 검색 중, 📖 읽는 중, 🚀 시작 중)

## Example Output

### When Domain Book Found

```
🔍 Domain Book 발견: ai-context/domain-books
✓ 3개 도메인: users, communities, posts

📖 Domain Book 읽는 중...

  ✓ users: 5개 API
  ✓ communities: 6개 API
  ✓ posts: 4개 API

✅ Domain Book 발견: ai-context/domain-books

## 📋 프로젝트 개요
티클(Teachle) - 선생님과 학부모를 위한 교육 커뮤니티 플랫폼

## 🏗️ 도메인 목록
- users: 사용자 인증 및 프로필 관리
- communities: 커뮤니티 생성 및 관리
- posts: 게시글 작성 및 관리

## 🚀 주요 기능
- 소셜 로그인 (카카오, 네이버, 구글)
- 위치 기반 커뮤니티 검색
- 게시글 작성 및 댓글

## 📊 API 엔드포인트
총 15개 엔드포인트

---

이제 Phase-1 Domain Validator를 시작합니다...

🚀 Phase-1 Domain Validator 시작...
```

### When Domain Book Not Found

```
❌ Domain Book을 찾을 수 없습니다.

다음 경로를 확인했습니다:
- ai-context/domain-books/
- domain-books/
- docs/domain-books/

FastAPI 프로젝트를 구현하려면 먼저 Domain Book이 필요합니다.

[AskUserQuestion prompt appears here]
```

### When Domain Has Missing Files

```
🔍 Domain Book 발견: ai-context/domain-books
✓ 3개 도메인: users, communities, posts

⚠️ 일부 도메인에 누락된 파일이 있습니다:
  - posts: api-spec.md, business-rules.md

[AskUserQuestion prompt: 계속 진행 vs 수정 후 재시작]
```

---

Now execute this workflow!
