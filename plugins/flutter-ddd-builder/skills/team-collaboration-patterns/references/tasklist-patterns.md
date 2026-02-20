# TaskList Patterns

## Creating Tasks with Dependencies

```
# Create domain tasks
TaskCreate({
  subject: "Implement auth domain",
  description: "Create models and services for auth",
  activeForm: "Implementing auth domain"
})
# Returns: task-1

TaskCreate({
  subject: "Implement post domain",
  description: "Create models and services for post",
  activeForm: "Implementing post domain"
})
# Returns: task-2

# Set dependency: post depends on auth
TaskUpdate({
  taskId: "task-2",
  addBlockedBy: ["task-1"]
})
```

## Monitoring Progress

```
# Check all tasks
TaskList()
# Shows: id, subject, status, owner, blockedBy

# Claim a task
TaskUpdate({
  taskId: "task-1",
  owner: "auth-implementer",
  status: "in_progress"
})

# Complete a task
TaskUpdate({
  taskId: "task-1",
  status: "completed"
})
```

## Task Workflow

1. Create tasks for each domain/screen
2. Set dependencies (blockedBy)
3. Assign owners when spawning implementers
4. Implementers mark in_progress when starting
5. Implementers mark completed when done
6. Orchestrator checks TaskList for progress
7. Blocked tasks auto-unblock when dependencies complete
