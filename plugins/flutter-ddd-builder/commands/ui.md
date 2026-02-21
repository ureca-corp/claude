---
name: ui
description: Generate Flutter UI layer from Domain Book features and screen plan. Creates ASCII art screen designs for approval, then generates ConsumerStatefulWidget pages, components, and router integration with parallel team implementation.
argument-hint: ""
allowed-tools: "*"
---

# /ui - UI Layer Generation

Generate complete Flutter UI layer by creating ASCII art screen plans from Domain Book features, getting user approval, then implementing pages and components using parallel team-based workflow.

## Your Task

Implement the UI layer by:

1. **Reading Domain Book features and APIs** - Parse requirements and available services
2. **Generating Screen Plan** - Create ASCII art wireframes for user approval
3. **Creating Team** - Spawn agent team for parallel page implementation
4. **Setting Up Worktrees** - Create isolated git worktrees for each screen
5. **Parallel Implementation** - Spawn teammates to implement each screen
6. **Quality Verification** - Run `flutter analyze` and build checks
7. **Integration** - Merge worktrees, register routes, cleanup

**Example:**
```bash
/ui
```

## Step-by-Step Workflow

### Step 1: Read Input Documents

**Read Domain Book features (📱 화면 구성):**
```
ai-context/domain-books/*/features.md
- 📋 주요 기능 (사용자 시나리오)
- 📱 화면 구성 (화면 목록, 경로, 네비게이션, UX 레퍼런스)
```

**Read Domain Book APIs:**
```
ai-context/domain-books/*/api-spec.md
- Available API endpoints
- Request/Response models
- Service methods
```

**Parse available services:**
```
available_services = {
  'auth': ['AuthService.login', 'AuthService.logout', 'AuthService.currentUser'],
  'post': ['PostService.getPosts', 'PostService.createPost', 'PostService.getPost'],
  'chat': ['ChatService.getMessages', 'ChatService.sendMessage']
}
```

### Step 2: Generate ASCII Art Screen Plan

**Spawn ui-planner agent:**

```
Task({
  description: "Generate ASCII art screen plan",
  subagent_type: "ui-planner",
  prompt: `Create ASCII art wireframes for all screens defined in Domain Book features.md (📱 화면 구성 section).

For each screen:
1. Design layout with ASCII art (boxes, lines, text)
2. Show components (TextField, FilledButton, OutlinedButton, ListView, Card, ListTile, etc.)
3. Indicate which domain services are used
4. Show navigation flow (using RouterClient pattern)
5. Use LucideIcons instead of Icons

Output format: JSON + Markdown

JSON file (ai-context/screen-plan.json):
{
  "screens": [
    {
      "name": "login",
      "path": "/login",
      "domain": "auth",
      "page_dir": "login",
      "services": ["auth.AuthService"],
      "components": ["TextField", "FilledButton"],
      "description": "User login screen"
    },
    ...
  ]
}

Markdown file (ai-context/screen-layouts.md):
## Login Screen
Domain: auth
Page: lib/apps/domain/auth/pages/login/login_page.dart
Services: auth.AuthService

### Layout
+-----------------------------+
|  [<- Back]      Login       |
+-----------------------------+
|                             |
|  TextField (Email)          |
|    -> email input           |
|                             |
|  TextField (Password)       |
|    -> password input        |
|                             |
|  FilledButton (Login)       |
|    -> auth.login()          |
|                             |
|  TextButton (Sign Up)       |
|    -> RouterClient.register |
+-----------------------------+

... (all screens)

Follow Domain Book features (📱 화면 구성) and use available services. Apply \`frontend-design\` skill for UX quality. Reference large-scale service patterns (Instagram, Facebook, etc.) for proven UX.`
})
```

### Step 3: Display and Get User Approval

**Display screen plan in terminal:**

```
Generated Screen Plan:

1. Login Screen (/login)
+-----------------------------+
|  [<- Back]      Login       |
+-----------------------------+
|                             |
|  TextField (Email)          |
|    -> email input           |
|                             |
|  TextField (Password)       |
|    -> password input        |
|                             |
|  FilledButton (Login)       |
|    -> auth.login()          |
|                             |
|  TextButton (Sign Up)       |
|    -> RouterClient.register |
+-----------------------------+

2. Post List Screen (/posts)
...

Full plan saved to:
  - ai-context/screen-plan.json
  - ai-context/screen-layouts.md
```

**Get user approval:**

```
AskUserQuestion({
  questions: [{
    question: "Screen plan generated. How would you like to proceed?",
    header: "Screen Plan",
    multiSelect: false,
    options: [
      {
        label: "Approve and continue",
        description: "Start implementing screens as designed"
      },
      {
        label: "Request modifications",
        description: "I'll ask what changes you want"
      },
      {
        label: "Edit files directly",
        description: "I'll wait while you edit ai-context/screen-*.md files"
      }
    ]
  }]
})
```

**Handle user choice:**

**If "Approve and continue":**
- Proceed to Step 4

**If "Request modifications":**
```
AskUserQuestion({
  questions: [{
    question: "Which screens need changes? (You can describe changes or screen numbers)",
    header: "Modifications",
    multiSelect: false,
    options: [
      {label: "Screen 1 (Login)", description: "Modify login screen"},
      {label: "Screen 2 (Home)", description: "Modify home screen"},
      {label: "Other", description: "Type your changes"}
    ]
  }]
})

# Re-generate modified screens
# Show again and re-confirm
```

**If "Edit files directly":**
```
Show message:
"Please edit ai-context/screen-plan.json and ai-context/screen-layouts.md
Press Enter when done..."

Wait for user to press Enter

Read updated files
Proceed to Step 4
```

### Step 4: Create Agent Team

**Parse approved screen plan:**

```
Read ai-context/screen-plan.json

screens = [
  {name: 'login', path: '/login', domain: 'auth', page_dir: 'login', ...},
  {name: 'post-list', path: '/posts', domain: 'post', page_dir: 'list', ...},
  ...
]
```

**Spawn team:**

```
Teammate.spawnTeam({
  operation: "spawnTeam",
  team_name: "flutter-ui-team",
  description: "UI layer implementation"
})
```

**Create task list:**

```
FOR EACH screen IN screens:
  TaskCreate({
    subject: "Implement {screen.name} screen",
    description: "Create ConsumerStatefulWidget page at lib/apps/domain/{screen.domain}/pages/{screen.page_dir}/{screen.page_dir}_page.dart. Use services: {screen.services}. Components: {screen.components}",
    activeForm: "Implementing {screen.name} screen"
  })

# Add integration task
TaskCreate({
  subject: "Register routes and cleanup",
  description: "Update router with all new routes and cleanup worktrees",
  activeForm: "Registering routes"
})
```

### Step 5: Create Git Worktrees

**Get project name:**
```bash
PROJECT_NAME=$(basename $(pwd))
```

**Create worktree for each screen:**

```bash
for screen in ${screens[@]}; do
  screen_name=${screen.name}
  git worktree add -b feature/ui-${screen_name} ../${PROJECT_NAME}-ui-${screen_name}
done
```

**Verify:**
```bash
git worktree list
```

### Step 6: Spawn UI Implementers

**For each screen, spawn teammate:**

```
Task({
  description: "Implement {screen.name} screen",
  subagent_type: "ui-implementer",
  team_name: "flutter-ui-team",
  name: "{screen.name}-page-builder",
  prompt: `You are implementing the {screen.name} screen.

Working directory: ../${PROJECT_NAME}-ui-{screen.name}
Branch: feature/ui-{screen.name}

Screen plan:
- Path: {screen.path}
- Domain: {screen.domain}
- Page dir: {screen.page_dir}
- Services: {screen.services}
- Layout: (refer to ai-context/screen-layouts.md - {screen.name} section)

Your tasks:
1. Create ConsumerStatefulWidget page at:
   lib/apps/domain/{screen.domain}/pages/{screen.page_dir}/{screen.page_dir}_page.dart

2. Follow project conventions:
   - Use ConsumerStatefulWidget (not StatefulWidget)
   - Import services from domain layer using absolute imports
   - Use Theme.of(context).colorScheme for colors
   - Use Theme.of(context).textTheme for text styles

3. UI Design Principles:
   - MUI Component Based Minimalism: Use Material 3 components (FilledButton, OutlinedButton, Card, ListTile, etc.)
   - Lucide Icons: Use LucideIcons.* from package:lucide_icons (not Icons.*)
   - Text-first, no unnecessary decorations
   - SingleChildScrollView for keyboard overflow
   - textInputAction + onSubmitted for form flow
   - Callbacks as methods (prefix _), not inline

4. Navigation:
   - Import: package:app/apps/ui/router/app_router.dart
   - Use: RouterClient.{route}.go(context) or .push(context)

5. Create components if needed:
   - Domain-specific: lib/apps/domain/{screen.domain}/components/
   - Check with other teammates before creating shared components (SendMessage)

6. After EACH file creation, flutter analyze runs automatically (PostToolUse hook)
   - Fix errors immediately (up to 3 retries)

7. All imports must be absolute: package:app/...

8. Mark task complete when done (TaskUpdate)

Layout reference from screen plan:
{ASCII art for this screen from screen-layouts.md}

Standard Widget Patterns (REQUIRED):
- AsyncValueWidget for all async data display (not .when() inline)
- Validators for all form fields
- withLoaderOverlay for mutation buttons
- Theme.of(context).colorScheme for colors (both theme modes)

Imports:
- package:app/apps/ui/common/async_value_widget.dart
- package:app/global/utils/validators.dart
- package:app/global/utils/with_loader_overlay.dart

Remember:
- PostToolUse hook automatically runs flutter analyze
- Use methods for callbacks, not inline functions
- SingleChildScrollView for forms
- Theme tokens, no hardcoded colors
- LucideIcons, not Icons`
})
```

### Step 7: Monitor Progress

**Real-time streaming:**

```
flutter-ui-team Progress:
  login-page-builder: LoginPage created
  login-page-builder: Email/password form complete
  home-page-builder: HomePage scaffold created
  home-page-builder: Post list component in progress
  profile-page-builder -> login-page-builder: "You created AuthGuard? I need it too"
  login-page-builder -> profile-page-builder: "Yes, import from package:app/apps/domain/auth/components/auth_guard.dart"
```

**Track TaskList and display summary periodically**

### Step 8: Handle Component Conflicts

**When teammates create duplicate components:**

```
Scenario:
  login-page-builder creates lib/apps/domain/auth/components/auth_guard.dart
  profile-page-builder also tries to create auth_guard.dart

Detection:
  PostToolUse hook or SendMessage notification

Resolution:
  profile-page-builder: SendMessage to login-page-builder
    "I also need AuthGuard. Did you create it?"

  login-page-builder responds:
    "Yes, import from package:app/apps/domain/auth/components/auth_guard.dart"

  profile-page-builder: Import instead of creating
```

**Orchestrator monitors for conflicts:**

```
IF duplicate component detected:
  Identify which teammate created first
  Notify second teammate to import instead of create
```

### Step 9: Build Verification

**Same process as /logic command:**

```bash
cd original_project_dir

echo "Building for Android..."
flutter build appbundle

echo "Building for iOS..."
flutter build ios
```

**Handle build errors (same strategy as /logic)**

### Step 10: Integration

**Merge all worktrees:**

```bash
cd original_project_dir

for screen in ${screens[@]}; do
  screen_name=${screen.name}
  echo "Merging ${screen_name} screen..."
  git merge --no-ff feature/ui-${screen_name} -m "Merge ${screen_name} screen implementation

- ConsumerStatefulWidget page
- Components and layouts
- Route integration

Co-Authored-By: ${screen_name}-page-builder <agent@flutter-ddd-builder>
"
done
```

**Create/Update Route classes** in `lib/apps/ui/router/domains/{domain}.dart`:

```dart
import 'package:flutter/widgets.dart';
import 'package:go_router/go_router.dart';

class {Screen}Route {
  const {Screen}Route();

  static const path = '/{path}';
  static const name = '{name}';

  void go(BuildContext context) => context.go(path);
  Future<T?> push<T>(BuildContext context) => context.push<T>(path);
}
```

**Update RouterClient** (`lib/apps/ui/router/client.dart`):

```dart
abstract final class RouterClient {
  // ... existing routes
  static const newScreen = NewScreenRoute();
}
```

**Update routes** (`lib/apps/ui/router/routes.dart`):

Add GoRoute entries importing pages from `package:app/apps/domain/{domain}/pages/{page}/{page}_page.dart`.

### Step 11: Cleanup

**Same process as /logic:**

- Shutdown teammates (SendMessage shutdown_request)
- Remove worktrees
- Cleanup team

### Step 12: Final Report

```
UI Layer Complete

Screens Implemented:
  Login (/login) - LoginPage
  Post List (/posts) - PostListPage
  Profile (/profile) - ProfilePage
  Post Create (/posts/create) - PostCreatePage

Components Created:
  Domain: AuthGuard, PostCard
  Page-specific: LoginForm, PostList

Routes Registered:
  lib/apps/ui/router/domains/auth.dart updated
  lib/apps/ui/router/domains/post.dart updated
  lib/apps/ui/router/client.dart updated
  lib/apps/ui/router/routes.dart updated

Quality Checks:
  flutter analyze - All screens passed
  flutter build appbundle - Success
  flutter build ios - Success

Next Steps:
  1. Review UI implementation
  2. Test user flows manually
  3. Run widget tests: flutter test
  4. Consider adding integration tests
```

## Important Notes

### ASCII Art Approval Workflow

**Critical:** Always get user approval before implementation
- Display ASCII art in terminal (readable format)
- Save to files for review (screen-plan.json, screen-layouts.md)
- Give user 3 options: Approve, Modify, or Edit directly
- Don't proceed without approval

### Component Coordination

**Shared components require teammate coordination:**
- Use SendMessage to check if component exists
- First creator owns the component
- Others import instead of creating
- Orchestrator monitors for duplicates

### Route Organization

**Follow project patterns:**
- Pages at `lib/apps/domain/{domain}/pages/{page}/{page}_page.dart`
- Route classes in `lib/apps/ui/router/domains/{domain}.dart`
- RouterClient in `lib/apps/ui/router/client.dart` (const instances)
- GoRouter config in `lib/apps/ui/router/routes.dart`
- Navigation: `RouterClient.{route}.go(context)` or `.push(context)`

### Real-Time Progress

**Stream continuously:**
- Screen creation events
- Component conflicts
- Analyze results
- Build progress

## Troubleshooting

**Domain Book features not found:**
- Check `ai-context/domain-books/*/features.md` exists
- Verify 📱 화면 구성 section is present in features.md
- Run domain-book-builder first if missing

**Screen plan generation fails:**
- Retry with ui-planner agent
- Simplify features.md if too complex
- Generate screens one-by-one

**Component conflicts:**
- Check global components first before creating
- Use SendMessage for coordination
- Orchestrator resolves duplicates

**Route registration fails:**
- Verify page imports correct
- Check GoRouter syntax
- Ensure paths unique

## Skills Reference

Load these skills:
- **flutter-ddd-patterns** - For page structure patterns
- **git-worktree-management** - For worktree operations
- **team-collaboration-patterns** - For team coordination

## Success Criteria

ASCII art screen plan approved by user
All screens implemented as ConsumerStatefulWidget
Components created (no duplicates)
Routes registered (Route classes + RouterClient + routes.dart)
All analyze checks passed
All builds succeeded
Worktrees cleaned up
Team shut down

Execute this workflow to generate a complete, production-ready UI layer.
