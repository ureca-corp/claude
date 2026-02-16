---
name: ui
description: Generate Flutter UI layer from PRD and screen plan. Creates ASCII art screen designs for approval, then generates ConsumerStatefulWidget pages, components, and router integration with parallel team implementation.
argument-hint: "[--prd-path PATH]"
allowed-tools: "*"
---

# /ui - UI Layer Generation

Generate complete Flutter UI layer by creating ASCII art screen plans from PRD, getting user approval, then implementing pages and components using parallel team-based workflow.

## Your Task

Implement the UI layer by:

1. **Reading PRD and Domain APIs** - Parse requirements and available services
2. **Generating Screen Plan** - Create ASCII art wireframes for user approval
3. **Creating Team** - Spawn agent team for parallel page implementation
4. **Setting Up Worktrees** - Create isolated git worktrees for each screen
5. **Parallel Implementation** - Spawn teammates to implement each screen
6. **Quality Verification** - Run `flutter analyze` and build checks
7. **Integration** - Merge worktrees, register routes, cleanup

## Arguments

- `--prd-path PATH`: Custom path to PRD (default: `ai-context/PRD.md`)

**Example:**
```bash
/ui
/ui --prd-path docs/requirements.md
```

## Step-by-Step Workflow

### Step 1: Read Input Documents

**Read PRD:**
```
ai-context/PRD.md
- Product requirements
- User flows
- Screen descriptions
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
  prompt: `Create ASCII art wireframes for all screens described in PRD.

For each screen:
1. Design layout with ASCII art (boxes, lines, text)
2. Show components (TextField, Button, ListView, etc.)
3. Indicate which domain services are used
4. Show navigation flow

Output format: JSON + Markdown

JSON file (ai-context/screen-plan.json):
{
  "screens": [
    {
      "name": "login",
      "path": "/auth/login",
      "services": ["auth.AuthService"],
      "components": ["TextField", "Button"],
      "description": "User login screen"
    },
    ...
  ]
}

Markdown file (ai-context/screen-layouts.md):
## 로그인 화면
경로: /auth/login
서비스: auth.AuthService

### Layout
┌─────────────────────────────┐
│  [← 뒤로]      로그인        │
├─────────────────────────────┤
│                             │
│  TextField (이메일)          │
│    → email input            │
│                             │
│  TextField (비밀번호)        │
│    → password input         │
│                             │
│  Button (로그인)             │
│    → auth.login()           │
│                             │
│  TextButton (회원가입)       │
│    → Navigate to /register  │
└─────────────────────────────┘

... (all screens)

Follow PRD requirements and use available services from Domain Book.`
})
```

### Step 3: Display and Get User Approval

**Display screen plan in terminal:**

```
📱 Generated Screen Plan:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. 로그인 화면 (/auth/login)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌─────────────────────────────┐
│  [← 뒤로]      로그인        │
├─────────────────────────────┤
│                             │
│  TextField (이메일)          │
│    → email input            │
│                             │
│  TextField (비밀번호)        │
│    → password input         │
│                             │
│  Button (로그인)             │
│    → auth.login()           │
│                             │
│  TextButton (회원가입)       │
│    → Navigate to /register  │
└─────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. 홈 피드 화면 (/home)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 Full plan saved to:
  - ai-context/screen-plan.json
  - ai-context/screen-layouts.md
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
      {label: "Screen 1 (로그인)", description: "Modify login screen"},
      {label: "Screen 2 (홈)", description: "Modify home screen"},
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
  {name: 'login', path: '/auth/login', ...},
  {name: 'home', path: '/home', ...},
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
    description: "Create ConsumerStatefulWidget page for {screen.name} at {screen.path}. Use services: {screen.services}. Components: {screen.components}",
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
- Services: {screen.services}
- Layout: (refer to ai-context/screen-layouts.md - {screen.name} section)

Your tasks:
1. Create ConsumerStatefulWidget page at:
   lib/apps/ui/pages/{depth1}/{depth2}/page.dart
   (Determine depth1/depth2 from path)

2. Follow si_taelimwon_app conventions:
   - File name is always "page.dart"
   - Use ConsumerStatefulWidget (not StatefulWidget)
   - Import required services from domain layer
   - Use Theme.of(context).colorScheme for colors
   - Use Theme.of(context).textTheme for text styles

3. UI Design Principles (from CLAUDE.md):
   - Minimalist: Text-first, icons only when functional
   - No unnecessary placeholders or decorations
   - Clean spacing and typography
   - SingleChildScrollView for keyboard overflow
   - textInputAction + onSubmitted for form flow
   - Callbacks as methods (prefix _), not inline

4. Create components if needed:
   - Page-specific: lib/apps/ui/pages/{depth1}/{depth2}/components/
   - Global shared: lib/apps/ui/common/components/
   - Check with other teammates before creating global components (SendMessage)

5. After EACH file creation, flutter analyze runs automatically (PostToolUse hook)
   - Fix errors immediately (up to 3 retries)

6. Communicate with teammates if you're creating shared components (SendMessage)

7. Mark task complete when done (TaskUpdate)

Layout reference from screen plan:
{ASCII art for this screen from screen-layouts.md}

Remember:
- PostToolUse hook automatically runs flutter analyze
- Use methods for callbacks, not inline functions
- SingleChildScrollView for forms
- Theme tokens, no hardcoded colors`
})
```

### Step 7: Monitor Progress

**Real-time streaming:**

```
🎨 flutter-ui-team Progress:
  ✅ login-page-builder: LoginPage created
  ✅ login-page-builder: Email/password form complete
  🔄 home-page-builder: HomePage scaffold created
  🔄 home-page-builder: Post list component in progress
  💬 profile-page-builder → login-page-builder: "You created AuthGuard? I need it too"
  💬 login-page-builder → profile-page-builder: "Yes, it's in lib/apps/ui/common/components/auth_guard.dart"
```

**Track TaskList and display summary periodically**

### Step 8: Handle Component Conflicts

**When teammates create duplicate components:**

```
Scenario:
  login-page-builder creates lib/apps/ui/common/components/auth_guard.dart
  profile-page-builder also tries to create auth_guard.dart

Detection:
  PostToolUse hook or SendMessage notification

Resolution:
  profile-page-builder: SendMessage to login-page-builder
    "I also need AuthGuard. Did you create it?"

  login-page-builder responds:
    "Yes, import from lib/apps/ui/common/components/auth_guard.dart"

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

echo "🔨 Building for Android..."
flutter build appbundle

echo "🔨 Building for iOS..."
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

**Register routes in router:**

Update `lib/apps/ui/router/routes.dart` to include all new routes:

```dart
// Add new routes from screen plan
final router = GoRouter(
  routes: [
    // Existing routes
    ...

    // New routes
    GoRoute(
      path: '/auth/login',
      builder: (context, state) => LoginPage(),
    ),
    GoRoute(
      path: '/home',
      builder: (context, state) => HomePage(),
    ),
    ...
  ],
);
```

**Update RouterClient if needed:**

Create route classes in `lib/apps/ui/router/client.dart`:

```dart
class RouterClient {
  static final login = LoginRoute();
  static final home = HomeRoute();
  ...
}

class LoginRoute {
  static const path = '/auth/login';

  void push(BuildContext context) {
    context.push(path);
  }
}
```

### Step 11: Cleanup

**Same process as /logic:**

- Shutdown teammates (SendMessage shutdown_request)
- Remove worktrees
- Cleanup team

### Step 12: Final Report

```
✅ UI Layer Complete

Screens Implemented:
  ✅ 로그인 (/auth/login) - LoginPage
  ✅ 홈 피드 (/home) - HomePage
  ✅ 프로필 (/profile) - ProfilePage
  ✅ 글 작성 (/post/create) - PostCreatePage

Components Created:
  ✅ Global: AuthGuard, AppBarTitle
  ✅ Page-specific: LoginForm, PostList, PostCard

Routes Registered:
  ✅ lib/apps/ui/router/routes.dart updated
  ✅ lib/apps/ui/router/client.dart updated

Quality Checks:
  ✅ flutter analyze - All screens passed
  ✅ flutter build appbundle - Success
  ✅ flutter build ios - Success

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

**Follow si_taelimwon_app patterns:**
- Pages at `lib/apps/ui/pages/{depth1}/{depth2}/page.dart`
- Always named `page.dart` (not `login_page.dart`)
- Depth1/depth2 from route path (e.g., `/auth/login` → `auth/login/page.dart`)
- Router files: `routes.dart` (global), `client.dart` (static instances)

### Real-Time Progress

**Stream continuously:**
- Screen creation events
- Component conflicts
- Analyze results
- Build progress

## Troubleshooting

**PRD not found:**
- Check `ai-context/PRD.md` exists
- Suggest creating PRD first
- Provide template if needed

**Screen plan generation fails:**
- Retry with ui-planner agent
- Simplify PRD if too complex
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

✅ ASCII art screen plan approved by user
✅ All screens implemented as ConsumerStatefulWidget
✅ Components created (no duplicates)
✅ Routes registered in router
✅ All analyze checks passed
✅ All builds succeeded
✅ Worktrees cleaned up
✅ Team shut down

Execute this workflow to generate a complete, production-ready UI layer.
