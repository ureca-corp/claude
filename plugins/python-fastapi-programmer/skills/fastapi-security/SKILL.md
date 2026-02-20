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
