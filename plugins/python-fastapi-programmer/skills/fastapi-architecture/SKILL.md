---
name: python-fastapi-programmer:fastapi-architecture
description: Vertical Slice + Clean Architecture patterns for FastAPI projects. Use when implementing FastAPI domain modules with proper layering (Entities, Use Cases, Interface Adapters), DTO naming conventions (Request/Response prefix), file structure, and OpenAPI metadata for frontend agents.
---

# FastAPI Architecture Patterns

Implement FastAPI domain modules following Vertical Slice Architecture + Clean Architecture principles.

## Core Principles

### 1. Vertical Slice Architecture

Organize by feature, not layer:
- One Use Case = One File
- All layers for a feature together
- See [vertical-slice-pattern.md](references/vertical-slice-pattern.md)

### 2. Clean Architecture Layers

Entities → Use Cases → Interface Adapters → Frameworks

### 3. DTO Naming

**Absolute rule**: Request/Response prefix
- `UserRegisterRequest`, `UserRegisterResponse`
- See [dto-naming.md](references/dto-naming.md)

### 4. OpenAPI Metadata

Required for frontend agents:
```python
openapi_extra={
    "x-pages": ["register", "signup"],
    "x-agent-description": "회원가입 API"
}
```

## Quick Reference

**File Structure**:
```
src/modules/{domain}/
├── _models.py      # Entities
├── register.py     # Use Case
├── dtos.py         # DTOs
└── router.py       # Interface Adapter
```

**See references/** for complete examples and patterns.
