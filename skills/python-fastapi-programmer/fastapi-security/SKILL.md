---
name: python-fastapi-programmer:fastapi-security
description: FastAPI security patterns including JWT Bearer Token authentication, SQLModel ORM (prevent SQL injection), environment variables (prevent hardcoded secrets), and password hashing (bcrypt). Use when implementing authentication, database operations, or security-sensitive features.
---

# FastAPI Security Patterns

## Core Security Rules

### 1. JWT Bearer Token Authentication

Standard auth method - see [jwt-authentication.md](references/jwt-authentication.md)

### 2. SQLModel ORM Only

**Never** use raw SQL - see [sqlmodel-orm.md](references/sqlmodel-orm.md)

### 3. Environment Variables

**Never** hardcode secrets - see [environment-variables.md](references/environment-variables.md)

### 4. Password Hashing

**Always** use bcrypt - see [password-hashing.md](references/password-hashing.md)

## Quick Patterns

**JWT Auth**:
```python
from fastapi.security import HTTPBearer

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthCredentials = Depends(security)):
    payload = jwt.decode(credentials.credentials, SECRET_KEY)
    return db.get(User, payload["sub"])
```

**SQLModel ORM**:
```python
# ✅ Correct
user = db.exec(select(User).where(User.email == email)).first()

# ❌ Never do this
db.execute("SELECT * FROM users WHERE email = ?", [email])
```

**Environment Variables**:
```python
# ✅ Correct
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY required")

# ❌ Never do this
SECRET_KEY = "hardcoded_secret_123"
```

### 5. Sensitive Data Masking

**Always** mask sensitive data in logs:
```python
from src.core.masking import mask_dict, mask_value

# ✅ Correct - 로그 출력 시 마스킹
logger.info("request", data=mask_dict({"password": "secret", "name": "John"}))
# → {"password": "se***et", "name": "John"}

# ❌ Never do this
logger.info("request", data={"password": "secret"})
```

### 6. Exception Handling

**Always** use AppError subclasses:
```python
from src.core.exceptions import NotFoundError, ConflictError, UnauthorizedError

# ✅ Correct - 자동으로 ApiResponse 형식 반환
raise NotFoundError()           # 404 {"status": "RESOURCE_NOT_FOUND", "message": "찾으시는 정보가 없어요"}
raise ConflictError()           # 409 {"status": "RESOURCE_ALREADY_EXISTS", "message": "이미 등록된 정보예요"}
raise UnauthorizedError()       # 401 {"status": "USER_AUTHENTICATION_FAILED", "message": "로그인이 필요해요"}

# ❌ Never do this
raise HTTPException(status_code=404, detail="Not found")
```
