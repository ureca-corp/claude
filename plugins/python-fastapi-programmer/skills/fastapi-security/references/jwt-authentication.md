# JWT Bearer Token Authentication

## Pattern

Authorization: Bearer {token}

## Implementation

```python
import os
import jwt
from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthCredentials
from src.core.exceptions import UnauthorizedError, ForbiddenError

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY required")

security = HTTPBearer()

def create_access_token(user_id: str) -> str:
    payload = {"sub": str(user_id)}
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def get_current_user(
    credentials: HTTPAuthCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")
        user = db.get(User, user_id)
        if not user:
            raise UnauthorizedError()  # 401, status=USER_AUTHENTICATION_FAILED
        return user
    except jwt.InvalidTokenError:
        raise UnauthorizedError()  # 401, status=USER_AUTHENTICATION_FAILED
```

## Usage

```python
from src.core.exceptions import ForbiddenError

@router.get("/{user_id}")
def get_profile(
    user_id: UUID,
    current_user: User = Depends(get_current_user)
):
    if current_user.id != user_id:
        raise ForbiddenError()  # 403, status=PERMISSION_DENIED
    return current_user
```

## Important

- **Never** use `HTTPException` directly — always use `UnauthorizedError`, `ForbiddenError`, etc.
- These exceptions automatically return `ApiResponse` format with proper `status` enum values.
