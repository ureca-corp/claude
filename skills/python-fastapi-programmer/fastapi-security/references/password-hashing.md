# Password Hashing with bcrypt

## 개요

비밀번호는 절대 평문으로 저장하지 않고, **bcrypt**를 사용하여 해시합니다.
bcrypt는 salt를 자동으로 생성하고, 느린 해싱으로 무차별 대입 공격(brute-force)을 방지합니다.

## 핵심 원칙

1. **평문 저장 금지**: 비밀번호는 절대 평문으로 저장하지 않음
2. **bcrypt 사용**: 단방향 해시 + 자동 salt + 느린 해싱
3. **10 rounds**: bcrypt의 기본 cost factor (2^10 = 1024회 해싱)
4. **환경 변수 없음**: bcrypt는 salt를 자동 생성 (별도 환경 변수 불필요)

## Implementation

```python
import bcrypt


def hash_password(password: str) -> str:
    """비밀번호를 bcrypt로 해시"""
    return bcrypt.hashpw(
        password.encode("utf-8"), bcrypt.gensalt()
    ).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    """평문 비밀번호와 해시 비교"""
    return bcrypt.checkpw(
        password.encode("utf-8"), hashed.encode("utf-8")
    )
```

## Usage in Use Cases

```python
# register.py (회원가입)
from src.modules.users._models import User

hashed = hash_password(request.password)
user = User(email=request.email, password=hashed, name=request.name)
db.add(user)
db.commit()

# login.py (로그인)
user = db.exec(select(User).where(User.email == request.email)).first()
if not user or not verify_password(request.password, user.password):
    raise UnauthorizedError()  # 401, AppError 사용
```

## 핵심 정리

1. **bcrypt 사용**: 느린 해싱으로 무차별 대입 공격 방지
2. **자동 salt**: bcrypt.gensalt()로 랜덤 salt 생성 (별도 저장 불필요)
3. **10 rounds 기본**: 충분한 보안 + 적절한 성능
4. **평문 저장 금지**: 절대 평문으로 저장하지 않음
5. **단방향 해시**: 복호화 불가능 (오직 검증만 가능)
