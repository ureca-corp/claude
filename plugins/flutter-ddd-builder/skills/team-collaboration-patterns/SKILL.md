---
name: Team Collaboration Patterns
description: This skill should be used when working with "agent teams", "TaskList", "SendMessage", "teammate coordination", "blocking tasks", or managing multi-agent workflows with Claude Code's Teammate tool.
version: 0.1.0
---

# Team Collaboration Patterns

Provides patterns for coordinating multiple agents using Claude Code's Teammate tool, TaskList, and SendMessage for parallel code generation workflows.

## Purpose

Enable efficient multi-agent collaboration by:
- Creating and managing agent teams
- Coordinating work through TaskList
- Facilitating communication with SendMessage
- Managing dependencies between tasks
- Handling teammate lifecycle

## When to Use

Load this skill when:
- Creating agent teams with Teammate.spawnTeam
- Managing TaskList for parallel work
- Sending messages between teammates
- Handling task dependencies (blockedBy)
- Coordinating multi-agent workflows

## Team Workflow Overview

### Standard Team Pattern

```
1. Leader creates team (Teammate.spawnTeam)
2. Leader creates TaskList (TaskCreate for each unit of work)
3. Leader spawns teammates (Task tool with team_name)
4. Teammates claim tasks (TaskUpdate with owner)
5. Teammates work and communicate (SendMessage)
6. Teammates mark complete (TaskUpdate status: completed)
7. Leader integrates results
8. Leader cleans up team (Teammate.cleanup)
```

## Creating Teams

### Team Creation

```
Teammate.spawnTeam:
  operation: "spawnTeam"
  team_name: "flutter-domain-team"
  description: "Domain layer implementation team"
```

**Team naming:** `{purpose}-team` (e.g., `flutter-domain-team`, `flutter-ui-team`)

### Team Configuration

Team config is automatically created at `~/.claude/teams/{team-name}/config.json`:

```json
{
  "name": "flutter-domain-team",
  "description": "Domain layer implementation team",
  "members": [
    {
      "name": "team-lead",
      "agentId": "uuid-1",
      "agentType": "logic-orchestrator"
    },
    {
      "name": "auth-implementer",
      "agentId": "uuid-2",
      "agentType": "logic-implementer"
    }
  ]
}
```

## TaskList Management

### Creating Tasks

```
TaskCreate:
  subject: "Implement auth domain"
  description: "Create UserModel, AuthService, and router integration for auth domain"
  activeForm: "Implementing auth domain"
```

**Subject format:** Imperative form ("Implement auth domain", not "Implementing...")
**ActiveForm:** Present continuous ("-ing form") shown in progress spinner

### Task Dependencies

```
# Create dependent tasks
TaskCreate:
  subject: "Implement chat domain"
  description: "Chat domain depends on auth.UserModel"
  activeForm: "Implementing chat domain"

# Set up dependency
TaskUpdate:
  taskId: "chat-task-id"
  addBlockedBy: ["auth-task-id"]
```

**Dependency strategy:**
- Use `blockedBy` when one task needs another's output
- Blocked tasks wait until dependencies complete
- Teammates can check TaskList to see what's available

### Claiming Tasks

```
# Teammate claims available task
TaskUpdate:
  taskId: "auth-task-id"
  owner: "auth-implementer"
  status: "in_progress"
```

**Claiming rules:**
- Only claim tasks with no `blockedBy` or all dependencies complete
- Set `owner` to your teammate name (not agentId)
- Set `status` to `in_progress` when starting work

### Completing Tasks

```
TaskUpdate:
  taskId: "auth-task-id"
  status: "completed"
```

**Completion checklist:**
- All work finished
- Files committed (if using git)
- No errors from quality checks
- Mark status as `completed`

## Communication Patterns

### Sending Messages

```
SendMessage:
  type: "message"
  recipient: "auth-implementer"
  content: "Please prioritize UserModel creation, chat domain needs it"
  summary: "Prioritize UserModel creation"
```

**Message types:**
- **message**: Direct message to one teammate
- **broadcast**: Message to all teammates (use sparingly, expensive)
- **shutdown_request**: Ask teammate to shut down
- **shutdown_response**: Respond to shutdown request

### Direct Messaging

```
# From chat-implementer to auth-implementer
SendMessage:
  type: "message"
  recipient: "auth-implementer"
  content: "I need auth.UserModel for ChatMessageModel. Is it ready?"
  summary: "Request UserModel availability"

# Response from auth-implementer
SendMessage:
  type: "message"
  recipient: "chat-implementer"
  content: "UserModel is complete and committed. You can import it now."
  summary: "UserModel ready"
```

**Best practices:**
- Use clear, specific messages
- Include file paths when relevant
- Summarize in 5-10 words for preview
- Don't broadcast unless truly urgent

### Broadcasting (Use Sparingly)

```
# Only for critical issues
SendMessage:
  type: "broadcast"
  content: "STOP: Found breaking change in API client. Waiting for fix before proceeding."
  summary: "Critical: API client breaking change"
```

**When to broadcast:**
- Critical blockers affecting everyone
- Major announcements (architecture change)
- Emergency stops

**When NOT to broadcast:**
- Regular updates
- Questions for one teammate
- Progress reports

## Dependency Coordination

### Pattern 1: TaskList Blocking

**Use when:** Dependencies are known upfront

```
# Create tasks with dependencies
TaskCreate:
  subject: "Implement auth domain"

TaskCreate:
  subject: "Implement post domain"

TaskCreate:
  subject: "Implement chat domain"

TaskUpdate:
  taskId: "chat-task-id"
  addBlockedBy: ["auth-task-id"]  # Chat waits for auth
```

**Flow:**
1. auth-implementer starts auth task
2. chat-implementer sees chat task blocked
3. chat-implementer waits or works on other tasks
4. auth-implementer completes auth task
5. chat task becomes available
6. chat-implementer claims and starts

### Pattern 2: SendMessage Coordination

**Use when:** Dependencies discovered during work

```
# chat-implementer discovers need for auth.UserModel
SendMessage:
  type: "message"
  recipient: "auth-implementer"
  content: "I need auth.UserModel. Can you prioritize it?"
  summary: "Need UserModel"

# auth-implementer responds
SendMessage:
  type: "message"
  recipient: "chat-implementer"
  content: "Working on UserModel now. Will notify when complete."
  summary: "Working on UserModel"

# Later, auth-implementer notifies
SendMessage:
  type: "message"
  recipient: "chat-implementer"
  content: "UserModel complete. Import from lib/apps/domain/auth/models/user_model.dart"
  summary: "UserModel ready"
```

### Pattern 3: Orchestrator Coordination

**Use when:** Dependencies are complex

```
# Teammate reports to orchestrator
SendMessage:
  type: "message"
  recipient: "team-lead"
  content: "Blocked: chat domain needs auth.UserModel but auth task not started"
  summary: "Blocked on auth.UserModel"

# Orchestrator adjusts priorities
# Reassigns tasks or updates dependencies
```

## Teammate Lifecycle

### Spawning Teammates

```
# From orchestrator
Task:
  description: "Implement auth domain"
  subagent_type: "logic-implementer"
  team_name: "flutter-domain-team"
  name: "auth-implementer"
  prompt: "Implement auth domain in worktree at ../project-auth. Create models and services."
```

**Naming:**
- Use descriptive names (`auth-implementer`, not `teammate1`)
- Format: `{domain}-implementer` or `{screen}-builder`
- Names used for messaging and task assignment

### Teammate Work Cycle

```
# Teammate receives task assignment
1. Check TaskList for assigned task
2. Claim task (TaskUpdate with owner)
3. Work on task
4. Communicate issues (SendMessage)
5. Complete task (TaskUpdate status: completed)
6. Check TaskList for next task or wait
```

### Shutting Down Teammates

```
# Orchestrator requests shutdown
SendMessage:
  type: "shutdown_request"
  recipient: "auth-implementer"
  content: "All tasks complete. Shutting down team."

# Teammate approves
SendMessage:
  type: "shutdown_response"
  request_id: "shutdown-request-id"
  approve: true

# Teammate exits automatically after approval
```

## Team Cleanup

### Cleanup Process

```
# After all work complete
Teammate.cleanup:
  operation: "cleanup"

# This removes:
# - Team directory (~/.claude/teams/{team-name}/)
# - Task list directory (~/.claude/tasks/{team-name}/)
```

**Cleanup rules:**
- All teammates must be shut down first
- Cleanup fails if active members exist
- Always cleanup after team work complete

## Common Patterns

### Pattern: Parallel Domain Implementation

```
1. Orchestrator:
   - spawnTeam("flutter-domain-team")
   - TaskCreate for auth, post, chat domains
   - Spawn 3 implementers

2. Implementers work in parallel:
   - auth-implementer: claims auth task
   - post-implementer: claims post task
   - chat-implementer: blocked by auth, waits

3. auth-implementer completes:
   - TaskUpdate status: completed
   - SendMessage to chat-implementer: "auth ready"

4. chat-implementer unblocked:
   - Claims chat task
   - Proceeds with work

5. Orchestrator integrates:
   - All tasks complete
   - Merge results
   - cleanup team
```

### Pattern: UI Screen Generation

```
1. Orchestrator:
   - spawnTeam("flutter-ui-team")
   - TaskCreate for each screen
   - Spawn implementers (one per screen)

2. Implementers work independently:
   - No dependencies between screens
   - Parallel implementation

3. Component conflicts detected:
   - Implementer A: "I'm creating AuthGuard component"
   - Implementer B: "I also need AuthGuard"
   - SendMessage coordination: "You create it, I'll import"

4. Integration:
   - Merge all screens
   - Resolve component duplicates
   - cleanup team
```

## Error Handling

### Teammate Failure

```
# Teammate reports failure after 3 retries
SendMessage:
  type: "message"
  recipient: "team-lead"
  content: "Failed to implement auth domain after 3 attempts. Error: ..."
  summary: "Auth domain failed"

# Orchestrator decides:
# Option 1: Skip domain (continue with others)
# Option 2: Retry with different approach
# Option 3: Stop entire workflow
```

### Idle Teammate

**Normal:** Teammates go idle after every turn
**Not an error:** Idle means waiting for input

```
# After teammate sends message
# System: "auth-implementer is now idle"

# This is NORMAL - teammate is waiting
# Send message to wake up if needed
SendMessage:
  type: "message"
  recipient: "auth-implementer"
  content: "Next task: implement PostModel"
```

## Best Practices

### Do's
✅ Create TaskList before spawning teammates
✅ Use descriptive task subjects
✅ Set dependencies upfront when known
✅ Communicate proactively via SendMessage
✅ Mark tasks completed promptly
✅ Cleanup team after work complete
✅ Prefer tasks in ID order (lower ID first)

### Don'ts
❌ Broadcast messages unnecessarily
❌ Leave teams running after work done
❌ Ignore teammate messages
❌ Create circular dependencies
❌ Skip TaskUpdate after completing work
❌ Send structured JSON status messages (use TaskUpdate instead)

## Reference

For detailed patterns and examples:
- **`references/tasklist-patterns.md`** - Advanced TaskList usage
- **`references/sendmessage-guide.md`** - Communication best practices

For working examples:
- **`examples/team-workflow-example.md`** - Complete team workflow

## Quick Reference

### Team Lifecycle
```
spawnTeam → TaskCreate → spawn teammates → work → cleanup
```

### Task States
```
pending → in_progress → completed
```

### Message Types
```
message: Direct to one teammate
broadcast: To all (use sparingly)
shutdown_request/response: Lifecycle management
```

### Task Dependencies
```
TaskUpdate with addBlockedBy: ["task-id"]
```

Follow these patterns for effective multi-agent collaboration in Flutter DDD Builder workflows.
