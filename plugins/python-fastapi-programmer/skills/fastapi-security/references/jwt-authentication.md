# JWT Bearer Token Authentication

## Pattern

Authorization: Bearer {token}

## Implementation

```python
import os
import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthCredentials

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
            raise HTTPException(401, "User not found")
        return user
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")
```

## Usage

```python
@router.get("/{user_id}")
def get_profile(
    user_id: UUID,
    current_user: User = Depends(get_current_user)
):
    if current_user.id != user_id:
        raise HTTPException(403, "Forbidden")
    return current_user
```
