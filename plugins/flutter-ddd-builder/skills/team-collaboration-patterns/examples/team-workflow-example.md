# Team Workflow Example

## Scenario: 3 Domains (auth, post, chat)

### 1. Orchestrator Creates Team

```
TeamCreate({
  team_name: "flutter-logic-team",
  description: "Domain layer implementation"
})
```

### 2. Create Tasks

```
TaskCreate: "Implement auth domain" → task-1
TaskCreate: "Implement post domain" → task-2
TaskCreate: "Implement chat domain" → task-3
TaskCreate: "Integrate and cleanup" → task-4

TaskUpdate: task-2 blockedBy [task-1]  # post needs auth.UserModel
TaskUpdate: task-3 blockedBy [task-1]  # chat needs auth.UserModel
TaskUpdate: task-4 blockedBy [task-1, task-2, task-3]
```

### 3. Spawn Implementers

```
Task({
  subagent_type: "logic-implementer",
  team_name: "flutter-logic-team",
  name: "auth-implementer",
  prompt: "Implement auth domain..."
})

Task({
  subagent_type: "logic-implementer",
  team_name: "flutter-logic-team",
  name: "post-implementer",
  prompt: "Implement post domain..."
})
```

### 4. Communication Flow

```
[auth-implementer completes UserModel]
auth-implementer → orchestrator: "UserModel complete"
TaskUpdate: task-1 → completed

[post-implementer unblocked]
post-implementer → auth-implementer: "Need UserModel, importing from package:app/apps/domain/auth/models/user_model.dart"

[post-implementer completes]
TaskUpdate: task-2 → completed
```

### 5. Integration

```
# Orchestrator merges all worktrees
git merge --no-ff feature/auth-domain
git merge --no-ff feature/post-domain
git merge --no-ff feature/chat-domain

# Create router files
# Update RouterClient
```

### 6. Cleanup

```
SendMessage: shutdown_request to each implementer
git worktree remove ../project-auth
git worktree remove ../project-post
git worktree remove ../project-chat
TeamDelete()
```
