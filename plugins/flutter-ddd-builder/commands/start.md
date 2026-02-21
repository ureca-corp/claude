---
name: start
description: End-to-end Flutter DDD code generation pipeline. Reads Domain Book, generates business logic layer (models + services), then generates UI layer (screen plan + pages) — all in one command.
argument-hint: "[--skip-ui] [--domain-book-path PATH]"
allowed-tools: "*"
---

# /start - Full Pipeline Generation

Generate complete Flutter DDD application code from Domain Book documentation. Runs the entire pipeline: Domain Book validation → Code generation → Business logic layer → UI layer.

## Your Task

Execute the full code generation pipeline sequentially:

1. **Preflight Check** - Validate project prerequisites
2. **Domain Book Reading** - Parse and summarize all domains
3. **Code Generation** - Run swagger_parser + build_runner
4. **Business Logic Layer** - Generate models and services (like /logic)
5. **Build Verification** - Verify logic layer builds cleanly
6. **UI Layer** - Generate screen plan → get approval → implement pages (like /ui)
7. **Final Verification** - Full build + analyze
8. **Summary Report** - Display everything that was created

## Arguments

- `--skip-ui`: Skip UI layer generation (only generate business logic)
- `--domain-book-path PATH`: Custom path to domain books (default: `ai-context/domain-books/`)

**Example:**
```bash
/start
/start --skip-ui
/start --domain-book-path custom/domains/
```

## Step-by-Step Workflow

### Step 1: Preflight Check

Validate all prerequisites before starting. Report clearly what's missing.

```bash
# Check Flutter SDK
flutter --version

# Check required files/directories
ls ai-context/domain-books/   # Domain Book must exist

# Check OpenAPI spec availability (swagger_parser용)
# 방법 1: swagger_parser.yaml에 schema_url 설정 (백엔드 서버 실행 필요)
# 방법 2: swagger/api_spec.json 정적 파일 (오프라인 가능)
if [ -f swagger_parser.yaml ]; then
  echo "swagger_parser.yaml found"
  # schema_url이 설정되어 있으면 백엔드 서버 접근 가능 여부 확인
  if grep -q "schema_url" swagger_parser.yaml; then
    SCHEMA_URL=$(grep "schema_url" swagger_parser.yaml | awk '{print $2}')
    curl -s --max-time 3 "$SCHEMA_URL" > /dev/null 2>&1
    if [ $? -ne 0 ]; then
      echo "⚠️ Backend server not reachable at $SCHEMA_URL"
      echo "   Start the server: uvicorn main:app --reload"
    fi
  fi
fi
```

**Validation checklist:**

| Requirement | Required For | Check |
|-------------|-------------|-------|
| `ai-context/domain-books/` with at least 1 domain | Logic + UI | Must exist |
| `swagger_parser.yaml` with `schema_url` 또는 `swagger/api_spec.json` | API client generation | 둘 중 하나 (Optional) |
| Backend server running (if `schema_url` used) | API client generation | `curl` reachable |
| `pubspec.yaml` | All | Must exist |
| Git repository | Worktree management | Must be initialized |
| `lib/global/types/paginated_response.dart` | Logic | Should exist (boilerplate) |
| `lib/global/utils/validators.dart` | UI | Should exist (boilerplate) |
| `lib/apps/ui/common/async_value_widget.dart` | UI | Should exist (boilerplate) |

**If Domain Book is missing:**
```
Display error:
  "Domain Book not found at ai-context/domain-books/

   To create Domain Book, run: /domain-book-builder

   Domain Book should contain:
   ai-context/domain-books/
   ├── {domain}/
   │   ├── README.md
   │   ├── domain-model.md
   │   ├── api-spec.md
   │   ├── business-rules.md
   │   └── features.md
   └── ..."

Stop execution.
```

**If features.md missing 📱 화면 구성 section and --skip-ui not set:**
```
AskUserQuestion({
  questions: [{
    question: "Domain Book features.md에 📱 화면 구성 섹션이 없습니다. 어떻게 진행할까요?",
    header: "화면 구성 없음",
    multiSelect: false,
    options: [
      {label: "Skip UI generation", description: "Generate only business logic layer"},
      {label: "Add screen section first", description: "I'll stop so you can add 📱 화면 구성 to features.md"}
    ]
  }]
})
```

### Step 2: Domain Book Summary

Read and display a summary of all domains for user confirmation.

```
Read ai-context/domain-books/

For each domain directory:
  Read README.md → overview
  Read domain-model.md → entities and relationships
  Read api-spec.md → endpoints
  Read business-rules.md → rules

Display summary:
```

**Output format:**
```
Domain Book Summary
====================

Found {count} domains:

1. auth
   - Entities: UserModel, AuthStateModel
   - Endpoints: POST /auth/login, POST /auth/logout, GET /auth/me
   - Dependencies: none

2. post
   - Entities: PostModel
   - Endpoints: GET /posts, POST /posts, GET /posts/:id, PUT /posts/:id, DELETE /posts/:id
   - Dependencies: auth.UserModel

3. chat
   - Entities: ChatMessageModel
   - Endpoints: GET /chat/messages, POST /chat/messages
   - Dependencies: auth.UserModel

Dependency graph:
  auth → (none)
  post → auth
  chat → auth

Build order: auth → post, chat (parallel)
```

**Get user confirmation:**

```
AskUserQuestion({
  questions: [{
    question: "Domain Book parsed successfully. Ready to generate code?",
    header: "Confirm",
    multiSelect: false,
    options: [
      {label: "Start generation", description: "Generate business logic + UI layers"},
      {label: "Review domains first", description: "I'll show detailed domain info before proceeding"}
    ]
  }]
})
```

### Step 3: Code Generation (Infra)

Run swagger_parser and build_runner to prepare infrastructure code.

```bash
# Step 3a: Generate API clients from OpenAPI spec
# swagger_parser.yaml 설정에 따라 schema_url(런타임) 또는 schema_path(정적 파일) 사용
if [ -f swagger_parser.yaml ]; then
  echo "Step 3/8: Generating API clients from OpenAPI spec..."

  # schema_url 방식이면 백엔드 서버 접근 가능 여부 재확인
  if grep -q "schema_url" swagger_parser.yaml; then
    SCHEMA_URL=$(grep "schema_url" swagger_parser.yaml | awk '{print $2}')
    if ! curl -s --max-time 5 "$SCHEMA_URL" > /dev/null 2>&1; then
      echo "⚠️ Backend server not reachable at $SCHEMA_URL"
      AskUserQuestion({
        questions: [{
          question: "Backend server가 응답하지 않습니다. API client 생성을 어떻게 할까요?",
          header: "서버 미응답",
          multiSelect: false,
          options: [
            {label: "서버 시작 후 재시도", description: "uvicorn main:app --reload 실행 후 계속"},
            {label: "건너뛰기", description: "API client 없이 진행 (수동 생성 필요)"}
          ]
        }]
      })
    fi
  fi

  dart run swagger_parser

  if [ $? -ne 0 ]; then
    echo "swagger_parser failed, retrying..."
    dart run swagger_parser
  fi
elif [ -f swagger/api_spec.json ]; then
  echo "Step 3/8: Generating API clients from static OpenAPI spec..."
  dart run swagger_parser
fi

# Step 3b: Run build_runner for existing code
echo "Step 3/8: Running build_runner..."
dart run build_runner build --delete-conflicting-outputs
```

**Display progress:**
```
Step 3/8: Code Generation
  [1/2] swagger_parser... done (generated 42 files)
  [2/2] build_runner... done (176 outputs)
```

### Step 4: Business Logic Layer

Execute the same workflow as `/logic` command. This is the core of the pipeline.

**Follow the complete /logic workflow:**
1. Create team (`flutter-logic-team`)
2. Create git worktrees for each domain
3. Spawn logic-implementer agents for each domain
4. Monitor progress and handle dependencies
5. Wait for all implementers to complete
6. Merge worktrees back to main
7. Create router domain files (`lib/apps/ui/router/domains/{domain}.dart`)
8. Update RouterClient (`lib/apps/ui/router/client.dart`)
9. Cleanup worktrees and team

**Display progress:**
```
Step 4/8: Business Logic Layer
  Domains: auth, post, chat

  [auth] Creating UserModel... done
  [auth] Creating AuthService... done
  [auth] Committed: feat(auth): implement domain layer

  [post] Creating PostModel... done
  [post] Creating PostService... done
  [post] Committed: feat(post): implement domain layer

  [chat] Creating ChatMessageModel... done
  [chat] Creating ChatService... done
  [chat] Committed: feat(chat): implement domain layer

  Merging auth domain... done
  Merging post domain... done
  Merging chat domain... done

  Router files created:
    lib/apps/ui/router/domains/auth.dart
    lib/apps/ui/router/domains/post.dart
    lib/apps/ui/router/domains/chat.dart
    lib/apps/ui/router/client.dart (updated)
```

### Step 5: Build Verification (Logic)

Verify the logic layer builds cleanly before proceeding to UI.

```bash
echo "Step 5/8: Verifying logic layer..."

# Run code generation for new files
dart run build_runner build --delete-conflicting-outputs

# Run analysis
flutter analyze

# If analysis fails, fix issues before continuing
```

**If analysis fails:**
- Identify errors
- Attempt to fix (up to 3 retries)
- If unfixable, ask user whether to continue to UI or stop

**Display:**
```
Step 5/8: Build Verification (Logic)
  build_runner... done
  flutter analyze... No issues found!
  Logic layer verified successfully.
```

### Step 6: UI Layer (Skip if --skip-ui)

If `--skip-ui` is set, skip to Step 7.

Otherwise, execute the same workflow as `/ui` command:

**6a. Screen Plan Generation:**
- Spawn ui-planner agent
- Read Domain Book features (📱 화면 구성) + APIs
- Generate ASCII art wireframes
- Create `ai-context/screen-plan.json` and `ai-context/screen-layouts.md`

**6b. User Approval:**
- Display screen plan
- Get user approval (approve / modify / edit directly)
- Loop until approved

**6c. Screen Implementation:**
- Create team (`flutter-ui-team`)
- Create git worktrees for each screen
- Spawn ui-implementer agents
- Monitor progress
- Merge worktrees
- Register routes in `routes.dart`
- Update RouterClient
- Cleanup

**Display progress:**
```
Step 6/8: UI Layer

  [Screen Plan] Generating wireframes...

  Screen Plan Generated:
  =====================
  1. Login (/login) - auth domain
  2. Post List (/posts) - post domain
  3. Post Detail (/posts/:id) - post domain
  4. Post Create (/posts/create) - post domain

  (User approves)

  [Implementation]
  [login] Creating LoginPage... done
  [post-list] Creating PostListPage... done
  [post-detail] Creating PostDetailPage... done
  [post-create] Creating PostCreatePage... done

  Merging login screen... done
  Merging post-list screen... done
  ...

  Routes registered:
    lib/apps/ui/router/routes.dart (updated)
    lib/apps/ui/router/client.dart (updated)
```

### Step 7: Final Verification

Run comprehensive verification after all layers are complete.

```bash
echo "Step 7/8: Final Verification..."

# Regenerate all code
dart run build_runner build --delete-conflicting-outputs

# Full analysis
flutter analyze

# Build verification
flutter build appbundle
flutter build ios
```

**Display:**
```
Step 7/8: Final Verification
  build_runner... done
  flutter analyze... No issues found!
  flutter build appbundle... Success
  flutter build ios... Success

  All verifications passed!
```

### Step 8: Summary Report

Display a comprehensive summary of everything that was generated.

```
==============================================
  Flutter DDD Code Generation Complete
==============================================

Pipeline: Domain Book → Logic → UI → Verified

Domains ({count}):
  auth - UserModel, AuthStateModel, AuthService
  post - PostModel, PostService
  chat - ChatMessageModel, ChatService

{IF UI generated:}
Screens ({count}):
  Login (/login) - lib/apps/domain/auth/pages/login/login_page.dart
  Post List (/posts) - lib/apps/domain/post/pages/list/post_list_page.dart
  Post Detail (/posts/:id) - lib/apps/domain/post/pages/detail/post_detail_page.dart
  Post Create (/posts/create) - lib/apps/domain/post/pages/create/post_create_page.dart
{END IF}

Router:
  lib/apps/ui/router/domains/auth.dart
  lib/apps/ui/router/domains/post.dart
  lib/apps/ui/router/domains/chat.dart
  lib/apps/ui/router/client.dart
  lib/apps/ui/router/routes.dart

Verification:
  flutter analyze: No issues found
  flutter build appbundle: Success
  flutter build ios: Success

Files Created: {count} new files
Git Commits: {count} commits

Next Steps:
  1. Review generated code in lib/apps/domain/
  2. Run tests: flutter test
  3. Start the app: flutter run
  4. Test user flows manually
```

## Error Recovery

### At Any Step

If a step fails critically:

1. **Display what was completed successfully**
2. **Display what failed and why**
3. **Ask user how to proceed:**

```
AskUserQuestion({
  questions: [{
    question: "Step {N} failed. How would you like to proceed?",
    header: "Error",
    multiSelect: false,
    options: [
      {label: "Retry this step", description: "Attempt the failed step again"},
      {label: "Skip and continue", description: "Move to next step (may cause issues)"},
      {label: "Stop here", description: "Keep completed work, stop pipeline"}
    ]
  }]
})
```

### Resumability

If the pipeline stops mid-way:
- Completed domains/screens are already committed to git
- User can re-run `/start` and it will detect existing work
- Or run individual commands: `/logic` or `/ui` for specific layers

## Important Notes

### Sequential Execution

This command runs steps **sequentially**, not in parallel:
1. Logic must complete before UI (UI imports services from logic layer)
2. Each step verifies before proceeding to the next
3. User approval is required for screen plan before UI implementation

### Relationship to Other Commands

- `/start` = `/logic` + `/ui` in sequence with preflight checks and verification
- If only logic is needed: use `/logic` directly
- If only UI is needed: use `/ui` directly
- `/start --skip-ui` = preflight + `/logic` + final verification

### Team Management

- Logic layer uses `flutter-logic-team`
- UI layer uses `flutter-ui-team`
- Teams are created and destroyed within each phase
- Never two teams running simultaneously

## Skills Reference

Load these skills automatically:
- **flutter-ddd-patterns** - For model/service/page code patterns
- **git-worktree-management** - For worktree operations
- **team-collaboration-patterns** - For team coordination

## Success Criteria

- [ ] All domains from Domain Book implemented
- [ ] All screens from Domain Book features implemented (unless --skip-ui)
- [ ] Router fully configured
- [ ] flutter analyze: no issues
- [ ] flutter build: success (appbundle + ios)
- [ ] All worktrees cleaned up
- [ ] All teams shut down
- [ ] Comprehensive summary displayed

Execute this pipeline to go from Domain Book to running Flutter app!
