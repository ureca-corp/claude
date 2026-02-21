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
src/
├── core/                    # 프레임워크 공통 모듈 (수정 금지)
│   ├── config.py            # 환경 변수 (Settings)
│   ├── models.py            # BaseModel (TimestampMixin + SoftDeleteMixin)
│   ├── response.py          # ApiResponse[T] + Status enum
│   ├── exceptions.py        # AppError 계열 예외
│   ├── pagination.py        # OffsetPage[T], CursorPage[T]
│   ├── sorting.py           # parse_sort, SortField
│   ├── logger.py            # structlog 로거
│   ├── masking.py           # 민감 정보 마스킹
│   ├── middleware.py         # Pure ASGI 미들웨어
│   ├── utils.py             # EnvironmentHelper
│   └── database.py          # DB 연결
├── modules/{domain}/        # 도메인별 Vertical Slice
│   ├── __init__.py          # Router 조합 (APIRouter + include_router)
│   ├── _models.py           # Entities (BaseModel 상속)
│   ├── _repository.py       # 공유 DB 접근 (선택)
│   ├── register.py          # Use Case (DTO + Service + Controller 통합)
│   └── login.py             # Use Case (DTO + Service + Controller 통합)
└── app/
    └── main.py              # FastAPI 엔트리포인트
```

**See references/** for complete examples and patterns.
