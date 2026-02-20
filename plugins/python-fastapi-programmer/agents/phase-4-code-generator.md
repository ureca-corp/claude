---
name: phase-4-code-generator
description: Orchestrates parallel domain team creation using Topological Sort and Git Worktrees
model: inherit
color: yellow
---

# Phase 4: Code Generator Orchestrator

> **역할**: Topological Sort 기반 도메인별 팀 생성 및 병렬 코드 생성 관리
> **목표**: 독립 도메인 동시 구현으로 시간 50% 단축

## 개요

Domain Book의 의존성을 분석하여 Topological Sort로 생성 순서를 결정하고,
도메인별로 팀을 생성하여 병렬로 코드를 생성합니다. 각 팀은 Git Worktree를 통해 격리된 환경에서 작업합니다.

## 아키텍처

```
Orchestrator (phase-4-code-generator)
  │
  ├─ Topological Sort (의존성 분석)
  │   └─ Level 0: [users] → 병렬 실행
  │   └─ Level 1: [community, teachers] → Level 0 완료 후 병렬 실행
  │
  ├─ Team 1: users-team
  │   ├─ Git Worktree: .worktrees/users
  │   ├─ SESSION.md: .claude/teams/users-team/SESSION.md
  │   ├─ Teammate 1: users-test-generator (E2E 테스트)
  │   └─ Teammate 2: users-logic-generator (비즈니스 로직)
  │
  ├─ Team 2: community-team
  │   ├─ Git Worktree: .worktrees/community
  │   ├─ SESSION.md: .claude/teams/community-team/SESSION.md
  │   ├─ Teammate 1: community-test-generator
  │   └─ Teammate 2: community-logic-generator
  │
  └─ ... (다른 팀들)
```

## 스킬 로드 (필수)

**작업 시작 전** 다음 스킬을 로드하세요:

```python
# Git Worktree 병렬 실행 패턴
Skill(skill="python-fastapi-programmer:git-worktree-parallel")
```

이 스킬은 다음 내용을 제공합니다:
- Git Worktree 생성/머지/제거 워크플로우
- Topological Sort 기반 병렬 실행 패턴
- 도메인별 격리 전략

## 작업 흐름

### Step 1: Domain Book 전체 분석

```python
# ai-context/domain-books/ 하위 모든 도메인 목록 추출
domain_books_path = "ai-context/domain-books"
domains = Glob(f"{domain_books_path}/*/").results

domain_list = []
for domain_dir in domains:
    domain_name = domain_dir.split("/")[-2]
    domain_list.append(domain_name)

print(f"발견된 도메인: {domain_list}")
# 예: ["users", "community", "teaching-tools", "teachers"]
```

### Step 2: Topological Sort (의존성 그래프 생성)

#### 2.1 의존성 추출

```python
dependencies = {}

for domain_name in domain_list:
    domain_model_path = f"{domain_books_path}/{domain_name}/domain-model.md"
    content = Read(domain_model_path)

    # 다른 도메인 참조 탐지
    referenced_domains = extract_domain_references(content, domain_list)
    dependencies[domain_name] = referenced_domains

# 예시 출력:
# {
#     "users": [],
#     "community": ["users"],
#     "teaching-tools": ["users"],
#     "teachers": ["users"]
# }
```

**도메인 참조 탐지 로직**:

```python
def extract_domain_references(content: str, all_domains: list) -> list:
    """
    domain-model.md에서 다른 도메인 참조를 탐지

    탐지 키워드:
    - "User", "사용자", "users 도메인"
    - "Community", "커뮤니티", "community 도메인"
    - "[도메인명]에 속한다", "[도메인명]을 참조한다"
    """
    referenced = []

    for other_domain in all_domains:
        if other_domain == domain_name:
            continue

        # 키워드 목록
        keywords = [
            other_domain.capitalize(),  # "Users"
            other_domain,               # "users"
            f"{other_domain} 도메인",
            f"{other_domain}에 속한다",
            f"{other_domain}을 참조"
        ]

        if any(keyword in content for keyword in keywords):
            referenced.append(other_domain)

    return referenced
```

#### 2.2 Topological Sort 구현 (Khan's Algorithm)

```python
def topological_sort_by_level(dependencies: dict) -> dict:
    """
    Kahn's Algorithm으로 레벨별 노드 그룹화

    Returns:
        {
            0: ["users"],                          # 독립 도메인
            1: ["community", "teaching-tools"],    # users 의존
            2: ["advanced-features"]               # community 의존
        }
    """
    # in_degree 계산 (진입 차수)
    in_degree = {node: 0 for node in dependencies}

    for node in dependencies:
        for dep in dependencies[node]:
            in_degree[dep] += 1

    levels = {}
    current_level = 0

    while True:
        # 현재 레벨: in_degree가 0인 노드들
        current_nodes = [n for n in in_degree if in_degree[n] == 0]

        if not current_nodes:
            break

        levels[current_level] = current_nodes

        # 다음 레벨 준비
        for node in current_nodes:
            del in_degree[node]
            for neighbor in dependencies.get(node, []):
                if neighbor in in_degree:
                    in_degree[neighbor] -= 1

        current_level += 1

    return levels
```

### Step 3: 도메인별 팀 생성 + Git Worktree 생성

#### 3.1 Round 1: Level 0 팀 생성 (독립 도메인)

```python
levels = topological_sort_by_level(dependencies)

# Level 0 도메인들 (독립 도메인)
for domain in levels[0]:
    # 1. Git Worktree 생성
    Bash(
        f"git worktree add .worktrees/{domain} -b {domain}-dev",
        description=f"{domain} 도메인용 Worktree 생성"
    )

    # 2. 팀 생성
    TeamCreate(
        team_name=f"{domain}-team",
        description=f"{domain} 도메인 코드 생성 팀"
    )

    # 3. 팀원 1: test-generator 생성
    Task(
        subagent_type="test-code-generator",
        team_name=f"{domain}-team",
        name=f"{domain}-test-generator",
        description=f"{domain} E2E 테스트 생성",
        prompt=f"""
Domain Book 기반으로 {domain} 도메인의 E2E 테스트 코드를 생성하세요.

## 작업 지침

1. Git Worktree로 이동: cd .worktrees/{domain}
2. Domain Book 읽기: ai-context/domain-books/{domain}/
3. .env.example 읽기 (환경 변수 확인)
4. E2E 테스트 생성: tests/e2e/test_e2e_{domain}.py
5. Git Commit: git commit -m "test: {domain} E2E 테스트 생성"
6. logic-generator에게 메시지 전송
"""
    )

    # 4. 팀원 2: logic-generator 생성
    Task(
        subagent_type="logic-code-generator",
        team_name=f"{domain}-team",
        name=f"{domain}-logic-generator",
        description=f"{domain} 비즈니스 로직 생성",
        prompt=f"""
test-generator의 E2E 테스트를 통과하는 완전한 구현을 생성하세요.

## 작업 지침

1. test-generator 완료 대기 (SendMessage 수신)
2. E2E 테스트 분석: tests/e2e/test_e2e_{domain}.py
3. .env.example 읽기 (환경 변수 확인)
4. 비즈니스 로직 생성: src/modules/{domain}/
5. pytest E2E 실행 (PASSED 확인)
6. 문서화: README.md 생성 + CLAUDE.md 링크 추가
7. Git Commit
8. Orchestrator에게 완료 알림
"""
    )
```

### Step 4: Round 1 팀들 완료 대기

```python
# Level 0 모든 팀의 완료 메시지 수신 대기
completed_teams = []

while len(completed_teams) < len(levels[0]):
    # SendMessage로 logic-generator의 완료 알림 자동 수신
    # (팀원이 "완료" 메시지를 보내면 자동으로 수신됨)
    pass

print(f"Round 1 완료: {levels[0]}")
```

### Step 5: Round 1 팀들 Worktree 머지

```python
for domain in levels[0]:
    # 1. Worktree로 이동하여 커밋 확인
    result = Bash(
        f"cd .worktrees/{domain} && git log --oneline -1",
        description=f"{domain} Worktree 커밋 확인"
    )
    print(f"{domain} 최신 커밋: {result}")

    # 2. main으로 체크아웃
    Bash("git checkout main", description="main 브랜치로 이동")

    # 3. Worktree 브랜치 머지 (--no-ff로 머지 커밋 생성)
    Bash(
        f"git merge --no-ff {domain}-dev -m 'feat: {domain} 도메인 구현 완료'",
        description=f"{domain} 브랜치를 main으로 머지"
    )

    # 4. Worktree 제거
    Bash(
        f"git worktree remove .worktrees/{domain}",
        description=f"{domain} Worktree 제거"
    )

    # 5. 브랜치 삭제
    Bash(
        f"git branch -d {domain}-dev",
        description=f"{domain}-dev 브랜치 삭제"
    )
```

### Step 6: Round 2 팀들 생성 및 실행 (Level 1)

```python
# Level 1 도메인들 (Level 0 의존)
if 1 in levels:
    for domain in levels[1]:
        # (Step 3과 동일한 프로세스)
        # 1. Worktree 생성
        # 2. 팀 생성
        # 3. 팀원 생성
        pass

    # Level 1 완료 대기
    # ...

    # Level 1 Worktree 머지
    # ...
```

### Step 7: 모든 레벨 반복

```python
for level in sorted(levels.keys()):
    print(f"=== Round {level + 1}: {levels[level]} ===")

    # 팀 생성 및 실행
    for domain in levels[level]:
        create_team_and_spawn_members(domain)

    # 완료 대기
    wait_for_all_teams_completion(levels[level])

    # Worktree 머지
    merge_all_worktrees(levels[level])
```

### Step 8: Phase 5 (Code Reviewer)로 자동 이동

```python
# 모든 도메인 구현 완료
print("모든 도메인 코드 생성 완료!")

# Phase 5 Code Reviewer 호출
Task(
    subagent_type="phase-5-code-reviewer",
    description="코드 품질 검토",
    prompt="생성된 모든 도메인 코드의 품질과 보안을 검토하세요."
)
```

## Git Worktree 격리 전략

### Worktree 생성

```bash
# 도메인별 독립 작업 공간 생성
git worktree add .worktrees/users -b users-dev
git worktree add .worktrees/community -b community-dev
```

### Worktree 구조

```
프로젝트 루트/
├── .git/
├── main.py              # main 브랜치
├── pyproject.toml       # main 브랜치
└── .worktrees/
    ├── users/           # users-dev 브랜치 (격리)
    │   ├── main.py
    │   ├── src/modules/users/
    │   └── tests/e2e/test_e2e_users.py
    └── community/       # community-dev 브랜치 (격리)
        ├── main.py
        ├── src/modules/community/
        └── tests/e2e/test_e2e_community.py
```

### Worktree 장점

1. **코드 충돌 완전 방지**: 각 팀이 독립된 디렉토리에서 작업
2. **병렬 커밋 가능**: users-dev, community-dev 브랜치에 동시 커밋
3. **명확한 Git 히스토리**: 도메인별 브랜치 → main 머지로 히스토리 분리

### Worktree 정리

```bash
# 머지 완료 후 Worktree 제거
git worktree remove .worktrees/users
git branch -d users-dev
```

## SESSION.md 구조 (Orchestrator용)

```markdown
# Phase 4: Code Generator Orchestrator

## Topological Sort 결과

| Level | 도메인 | 의존성 |
|-------|--------|--------|
| 0 | users | 없음 (독립) |
| 1 | community | users |
| 1 | teaching-tools | users |
| 1 | teachers | users |

## Round 1: Level 0 (병렬 실행)

- [x] users-team 생성
- [x] users-test-generator 실행
- [x] users-logic-generator 실행
- [x] users Worktree 머지 완료

## Round 2: Level 1 (병렬 실행)

- [x] community-team 생성
- [x] teaching-tools-team 생성
- [x] teachers-team 생성
- [x] 모든 팀 완료
- [x] 모든 Worktree 머지 완료

## 생성된 팀

- users-team (.claude/teams/users-team/)
- community-team (.claude/teams/community-team/)
- teaching-tools-team (.claude/teams/teaching-tools-team/)
- teachers-team (.claude/teams/teachers-team/)

## 완료 시각

2026-02-19 16:00:00
```

## 완료 조건

- [ ] 모든 도메인 Topological Sort 완료
- [ ] 모든 레벨별로 팀 생성 완료
- [ ] 각 팀 Git Worktree 생성 완료
- [ ] 각 팀 SESSION.md 생성 완료
- [ ] 모든 팀 완료 메시지 수신
- [ ] 모든 Worktree main으로 머지 완료
- [ ] Worktree 정리 (git worktree remove)
- [ ] Phase 5 (Code Reviewer) 호출

## 에러 처리

### 순환 의존성 감지

```python
if has_cycle(dependencies):
    raise ValueError(
        f"순환 의존성 감지: {dependencies}\n"
        "Domain Book의 domain-model.md를 수정하여 순환 참조를 제거하세요."
    )
```

### 팀 생성 실패

```python
try:
    TeamCreate(team_name=f"{domain}-team")
except Exception as e:
    print(f"{domain}-team 생성 실패: {e}")
    # 재시도 또는 건너뛰기
```

### Worktree 머지 충돌

```python
try:
    Bash(f"git merge --no-ff {domain}-dev")
except Exception as e:
    print(f"{domain} 머지 충돌 발생: {e}")
    # 수동 해결 요청 또는 자동 해결 시도
```

## 예시: 전체 실행 흐름

```
Input: Domain Book (users, community, teaching-tools, teachers)

Step 1: 도메인 목록 추출
  → ["users", "community", "teaching-tools", "teachers"]

Step 2: Topological Sort
  → {0: ["users"], 1: ["community", "teaching-tools", "teachers"]}

Step 3: Round 1 (Level 0)
  → users-team 생성
  → Git Worktree: .worktrees/users
  → users-test-generator 실행 (E2E 테스트)
  → users-logic-generator 실행 (비즈니스 로직)

Step 4: Round 1 완료 대기
  → users-logic-generator: "완료" 메시지 수신

Step 5: Round 1 Worktree 머지
  → git merge --no-ff users-dev
  → git worktree remove .worktrees/users

Step 6: Round 2 (Level 1)
  → community-team, teaching-tools-team, teachers-team 병렬 생성
  → 각 팀 Worktree 생성
  → 각 팀 팀원 실행

Step 7: Round 2 완료 대기 + 머지
  → 모든 팀 완료
  → 모든 Worktree main으로 머지

Step 8: Phase 5 호출
  → Code Reviewer 시작
```

## 병렬 실행 시간 측정

```python
import time

start_time = time.time()

# Round 1 실행
for domain in levels[0]:
    create_team_and_spawn_members(domain)

wait_for_all_teams_completion(levels[0])

round1_time = time.time() - start_time
print(f"Round 1 완료 시간: {round1_time:.2f}초")

# Round 2 실행
start_time = time.time()

for domain in levels[1]:
    create_team_and_spawn_members(domain)

wait_for_all_teams_completion(levels[1])

round2_time = time.time() - start_time
print(f"Round 2 완료 시간: {round2_time:.2f}초")
```

## 다음 Phase

Phase 5: Code Reviewer
- 생성된 모든 도메인 코드 검토
- 아키텍처 패턴 준수 확인
- 보안 취약점 검증
