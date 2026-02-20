---
name: logic
description: Generate Flutter DDD business logic layer from Domain Book. Creates Freezed models, Riverpod services, and API integration with parallel team-based implementation.
argument-hint: "[--domain-book-path PATH]"
allowed-tools: "*"
---

# /logic - Business Logic Layer Generation

Generate complete Flutter DDD domain layer from Domain Book documentation using parallel team-based implementation with real-time quality verification.

## Your Task

Implement the business logic layer by:

1. **Reading Domain Book** - Parse `ai-context/domain-books/` to identify domains
2. **Creating Team** - Spawn agent team for parallel implementation
3. **Setting Up Worktrees** - Create isolated git worktrees for each domain
4. **Running Code Generation** - Execute `swagger_parser` and `build_runner`
5. **Parallel Implementation** - Spawn teammates to implement each domain
6. **Quality Verification** - Run `flutter analyze` and build checks
7. **Integration** - Merge worktrees and cleanup

## Arguments

- `--domain-book-path PATH`: Custom path to domain books (default: `ai-context/domain-books/`)

**Example:**
```bash
/logic
/logic --domain-book-path custom/domains/
```

## Step-by-Step Workflow

### Step 1: Parse Domain Book

**Read domain structure:**
```
ai-context/domain-books/
├── auth/
│   ├── README.md
│   ├── features.md
│   ├── domain-model.md
│   ├── api-spec.md
│   └── business-rules.md
├── post/
└── chat/
```

**Extract:**
- List of domains (directory names under domain-books/)
- For each domain: models, endpoints, business rules
- Dependencies between domains (from domain-model.md relationships)

**Store in memory:**
```
domains = ['auth', 'post', 'chat']
domain_info = {
  'auth': {
    'models': ['UserModel', 'AuthStateModel'],
    'endpoints': ['/auth/login', '/auth/logout'],
    'dependencies': []
  },
  'post': {
    'models': ['PostModel'],
    'endpoints': ['/posts', '/posts/:id'],
    'dependencies': ['auth.UserModel']  # Needs auth first
  }
}
```

### Step 2: Create Agent Team

**Spawn team:**
```
Teammate.spawnTeam({
  operation: "spawnTeam",
  team_name: "flutter-logic-team",
  description: "Business logic layer implementation"
})
```

**Create task list:**
```
FOR EACH domain IN domains:
  TaskCreate({
    subject: "Implement {domain} domain",
    description: "Create Freezed models and Riverpod services for {domain} domain based on Domain Book specs",
    activeForm: "Implementing {domain} domain"
  })

# Add integration task
TaskCreate({
  subject: "Integrate router and cleanup",
  description: "Create router domain files and cleanup worktrees",
  activeForm: "Integrating domains"
})
```

**Set up dependencies:**
```
IF domain_info[domain].dependencies NOT empty:
  TaskUpdate({
    taskId: domain_task_id,
    addBlockedBy: [dependency_task_ids]
  })
```

### Step 3: Create Git Worktrees

**Get project name:**
```bash
PROJECT_NAME=$(basename $(pwd))
```

**Create worktree for each domain:**
```bash
for domain in ${domains[@]}; do
  git worktree add -b feature/${domain}-domain ../${PROJECT_NAME}-${domain}
done
```

**Verify:**
```bash
git worktree list
# Should show:
# /path/to/project        abc123 [main]
# /path/to/project-auth   def456 [feature/auth-domain]
# /path/to/project-post   ghi789 [feature/post-domain]
```

### Step 4: Run Code Generation (Team Leader)

**Execute once before spawning teammates:**

```bash
# Generate API clients if swagger spec exists
if [ -f swagger/api_spec.json ]; then
  dart run swagger_parser
fi

# Generate Freezed and Riverpod code
dart run build_runner build --delete-conflicting-outputs
```

**Output monitoring:**
- Show real-time output (Step requirement: real-time streaming)
- If errors occur, retry up to 3 times
- If still failing after 3 attempts, report to user

### Step 5: Spawn Domain Implementers

**For each domain, spawn teammate:**

```
Task({
  description: "Implement {domain} domain",
  subagent_type: "logic-implementer",
  team_name: "flutter-logic-team",
  name: "{domain}-implementer",
  prompt: `You are implementing the {domain} domain.

Working directory: ../${PROJECT_NAME}-{domain}
Branch: feature/{domain}-domain

Domain Book location: ai-context/domain-books/{domain}/

Your tasks:
1. Read all Domain Book files for {domain} domain
2. Create Freezed 3.x models in lib/apps/domain/{domain}/models/
   - Parse domain-model.md for entities and value objects
   - Parse api-spec.md for request/response models
3. Create Riverpod 3.x services in lib/apps/domain/{domain}/services/
   - Parse api-spec.md for endpoints
   - Use dioProvider directly (no Repository pattern)
   - Import: package:app/apps/infra/common/client/dio_provider.dart
4. After EACH file creation, flutter analyze will run automatically (PostToolUse hook)
   - Fix any errors immediately (up to 3 retries)
5. Communicate with other teammates if you need models from other domains (SendMessage)
6. Mark task complete when done (TaskUpdate)

Follow flutter-ddd-patterns skill for implementation guidelines.

Files you should create:
- lib/apps/domain/{domain}/models/*_model.dart
- lib/apps/domain/{domain}/services/{domain}_service.dart

Rules:
- Absolute imports only: package:app/...
- No Repository pattern: use dioProvider directly
- Freezed 3.x: abstract class with const private constructor

Remember: PostToolUse hook automatically runs flutter analyze after each file write/edit.`
})
```

### Step 6: Monitor Progress

**Real-time streaming output:**

Display teammate progress in real-time:
```
flutter-logic-team Progress:
  auth-implementer: UserModel created, analyzing...
  auth-implementer: AuthService created, analyzing...
  post-implementer: PostModel in progress...
  chat-implementer: Waiting (blocked by auth)
```

**Track with TaskList:**
```
Periodically check TaskList to show:
- Completed tasks
- In-progress tasks
- Blocked tasks
```

**Teammate messages:**
Display SendMessage communication:
```
post-implementer -> auth-implementer: "Need auth.UserModel, is it ready?"
auth-implementer -> post-implementer: "UserModel complete, import from package:app/apps/domain/auth/models/user_model.dart"
```

### Step 7: Handle Errors and Retries

**PostToolUse hook handles file-level errors automatically.**

**If teammate reports failure after 3 retries:**

```
SendMessage from teammate:
  "Failed to create UserModel after 3 analyze attempts. Errors: ..."

Your response:
  1. Check if teammate is still active
  2. If active: SendMessage with guidance or fix attempt
  3. If max retries exceeded: Skip this domain (continue with others)
  4. Log failure for final report
```

**Skipped domains strategy:**
```
skipped_domains = []

IF teammate fails:
  skipped_domains.append(domain)
  Continue with other domains

At end, report skipped domains to user
```

### Step 8: Build Verification

**After all teammates complete, verify builds:**

```bash
# Return to main project
cd original_project_dir

# Build for Android
echo "Building for Android..."
flutter build appbundle

# If Android build fails:
#   1. Identify error file
#   2. Check if teammate still active (worktree not merged yet)
#   3a. If active: SendMessage to reassign fix
#   3b. If inactive: Fix directly in main
#   4. Retry build

# Build for iOS
echo "Building for iOS..."
flutter build ios

# Same error handling as Android
```

### Step 9: Integration

**Merge all worktrees:**

```bash
cd original_project_dir

for domain in ${domains[@]}; do
  echo "Merging ${domain} domain..."
  git merge --no-ff feature/${domain}-domain -m "Merge ${domain} domain implementation

- Freezed models
- Riverpod services
- API client integration

Co-Authored-By: ${domain}-implementer <agent@flutter-ddd-builder>
"
done
```

**Handle merge conflicts:**

```
IF merge conflict:
  git checkout --ours conflicted_file
  git add conflicted_file
  Review conflicted_file
  IF needs manual resolution:
    Fix manually
    git add conflicted_file
  git commit -m "Merge ${domain} domain (resolved conflicts)"
```

**Create router domain files:**

For each domain, create `lib/apps/ui/router/domains/{domain}.dart`:

```dart
import 'package:flutter/widgets.dart';
import 'package:go_router/go_router.dart';

class {Page}Route {
  const {Page}Route();

  static const path = '/{path}';
  static const name = '{name}';

  void go(BuildContext context) => context.go(path);
  Future<T?> push<T>(BuildContext context) => context.push<T>(path);
}
```

**Update RouterClient** (`lib/apps/ui/router/client.dart`):
```dart
abstract final class RouterClient {
  // ... existing + new route instances
  static const newRoute = NewRoute();
}
```

**Update routes** (`lib/apps/ui/router/routes.dart`):
Add GoRoute entries importing pages from `package:app/apps/domain/{domain}/pages/{page}/{page}_page.dart`.

### Step 10: Cleanup

**Shutdown teammates:**

```
FOR EACH teammate:
  SendMessage({
    type: "shutdown_request",
    recipient: "{domain}-implementer",
    content: "All work complete. Shutting down team."
  })

  Wait for shutdown_response
```

**Remove worktrees:**

```bash
for domain in ${domains[@]}; do
  git worktree remove ../${PROJECT_NAME}-${domain}
  git branch -d feature/${domain}-domain
done

git worktree prune
```

**Cleanup team:**

```
Teammate.cleanup({
  operation: "cleanup"
})
```

### Step 11: Final Report

**Display summary to user:**

```
Business Logic Layer Complete

Domains Implemented:
  auth - UserModel, AuthStateModel, AuthService
  post - PostModel, PostService
  chat - ChatMessageModel, ChatService

Router Files Created:
  lib/apps/ui/router/domains/auth.dart
  lib/apps/ui/router/domains/post.dart
  lib/apps/ui/router/domains/chat.dart

Quality Checks:
  flutter analyze - All domains passed
  flutter build appbundle - Success
  flutter build ios - Success

Skipped Domains: {skipped_domains if any}

Next Steps:
  1. Review generated code
  2. Run tests: flutter test
  3. Generate UI layer: /ui
```

## Important Notes

### PostToolUse Hook Integration

**The hook runs automatically after every Write/Edit:**
- You don't need to explicitly call `flutter analyze`
- Teammates will be prompted to fix errors after each file
- Hook retries up to 3 times automatically

**Your role:**
- Monitor hook feedback
- Guide teammates if they're stuck after 3 retries
- Handle build-time errors (not caught by analyze)

### Real-Time Progress Display

**Stream output continuously:**
- Teammate status changes
- File creation events
- Analyze results
- Build progress

### Error Recovery

**3-tier error handling:**
1. **File-level:** PostToolUse hook (auto-retry 3x)
2. **Domain-level:** Skip domain if teammate fails
3. **Build-level:** Fix errors before merge or after merge

## Troubleshooting

**Domain Book not found:**
- Check `ai-context/domain-books/` exists
- Verify at least one domain subdirectory
- Suggest running `/domain-book-builder` first

**Worktree creation fails:**
- Check if worktree already exists: `git worktree list`
- Remove stale worktrees: `git worktree prune`
- Verify git repository is initialized

**Build fails repeatedly:**
- Identify specific errors
- Check if dependency versions compatible
- Run `flutter pub get` before build
- Check for platform-specific issues

**Teammate communication timeout:**
- Check if teammate is still active
- Verify TaskList shows task in-progress
- Consider spawning replacement teammate

## Skills Reference

Load these skills for implementation:
- **flutter-ddd-patterns** - For model/service code patterns
- **git-worktree-management** - For worktree operations
- **team-collaboration-patterns** - For team coordination

## Success Criteria

All domains from Domain Book implemented
Freezed models generated and valid
Riverpod services integrated with Dio directly
Router domain files created
All analyze checks passed
All builds succeeded (appbundle + ios)
Worktrees cleaned up
Team shut down

Execute this workflow to generate a complete, production-ready business logic layer.
