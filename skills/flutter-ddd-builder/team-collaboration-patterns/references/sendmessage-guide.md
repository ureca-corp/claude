# SendMessage Guide

## Direct Message

```
SendMessage({
  type: "message",
  recipient: "auth-implementer",
  content: "I need auth.UserModel for PostModel author field. Is it ready?",
  summary: "Need auth.UserModel"
})
```

## Broadcast (Use Sparingly)

```
SendMessage({
  type: "broadcast",
  content: "Critical: build failing, stop all work",
  summary: "Build failure - stop work"
})
```

## Shutdown Request

```
SendMessage({
  type: "shutdown_request",
  recipient: "auth-implementer",
  content: "All work complete. Shutting down team."
})
```

## Shutdown Response

```
SendMessage({
  type: "shutdown_response",
  request_id: "abc-123",
  approve: true
})
```

## Best Practices

1. Always use teammate **name** (not UUID) for recipient
2. Include concise summary (5-10 words)
3. Use broadcast only for critical team-wide issues
4. Default to direct message for most communication
5. Teammates must use SendMessage to communicate (plain text output is not visible to others)
