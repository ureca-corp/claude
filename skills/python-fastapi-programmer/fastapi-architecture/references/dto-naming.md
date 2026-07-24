# DTO Naming Convention

## Absolute Rule

All DTOs MUST use Request/Response prefix.

## Naming Pattern

- Request: `{Feature}Request`
- Response: `{Feature}Response`

## Examples

### ✅ Correct

```python
class UserRegisterRequest(BaseModel):
    email: str
    password: str

class UserRegisterResponse(BaseModel):
    id: UUID
    email: str

class PostCreateRequest(BaseModel):
    title: str
    content: str

class PostCreateResponse(BaseModel):
    id: UUID
    title: str
```

### ❌ Incorrect

```python
# Missing prefix
class UserRegister(BaseModel):  # ❌
    pass

# Wrong prefix
class RegisterInput(BaseModel):  # ❌
    pass

class RegisterOutput(BaseModel):  # ❌
    pass
```

## Complete Example

```python
from pydantic import BaseModel
from uuid import UUID

# User domain DTOs
class UserRegisterRequest(BaseModel):
    email: str
    password: str
    name: str

class UserRegisterResponse(BaseModel):
    id: UUID
    email: str

class UserLoginRequest(BaseModel):
    email: str
    password: str

class UserLoginResponse(BaseModel):
    access_token: str

class UserProfileResponse(BaseModel):
    id: UUID
    email: str
    name: str
```
