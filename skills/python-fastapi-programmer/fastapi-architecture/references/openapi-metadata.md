# OpenAPI Metadata for Frontend Agents

## Purpose

Enable frontend agents to automatically find and use APIs by page name.

## Required Fields

1. **x-pages**: List of page names where this API is used
2. **x-agent-description**: Korean description for frontend agents

## Pattern

```python
@router.post(
    "/endpoint",
    openapi_extra={
        "x-pages": ["page1", "page2"],
        "x-agent-description": "Korean description"
    }
)
```

## Complete Example

```python
@router.post(
    "/register",
    response_model=UserRegisterResponse,
    status_code=201,
    openapi_extra={
        "x-pages": ["register", "signup"],
        "x-agent-description": "회원가입 API. 회원가입 페이지에서 이메일/비밀번호로 신규 계정 생성 시 사용"
    }
)
def register_endpoint(...):
    pass

@router.get(
    "/{user_id}",
    response_model=UserProfileResponse,
    openapi_extra={
        "x-pages": ["user-profile", "user-settings", "admin-user-detail"],
        "x-agent-description": "사용자 프로필 조회 API. 프로필 페이지, 설정 페이지, 관리자 상세 페이지에서 사용"
    }
)
def get_profile_endpoint(...):
    pass
```

## Benefits

Frontend agents can read FRONTEND_API_MAPPING.json:
```json
{
  "register": [{
    "method": "POST",
    "path": "/api/users/register",
    "description": "회원가입 API"
  }]
}
```
