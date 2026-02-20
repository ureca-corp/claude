# Environment Variables Pattern

## 개요

환경 변수를 사용하여 외부 의존성(DB, API 키 등)을 관리하고, Mock 데이터 사용을 방지합니다.

## 핵심 원칙

1. **하드코딩 금지**: 모든 외부 연결 정보는 환경 변수로
2. **Mock 데이터 금지**: 테스트도 실제 환경 변수 사용
3. **.env.example 제공**: 필요한 환경 변수 목록 문서화
4. **명확한 에러 메시지**: 환경 변수 없을 때 에러 발생

## Implementation (pydantic-settings)

```python
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """환경 변수 설정 (pydantic-settings 기반)"""

    # Database
    DATABASE_URL: str

    # JWT
    SECRET_KEY: str

    # Application
    DEBUG: bool = False
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    # Optional external APIs
    NAVER_CLIENT_ID: str | None = None
    NAVER_CLIENT_SECRET: str | None = None

    model_config = {"env_file": ".env.local", "extra": "ignore"}


settings = Settings()
```

## Usage in Code

```python
from src.core.config import settings

# ✅ Correct - pydantic-settings로 환경 변수 접근
db_url = settings.DATABASE_URL
secret = settings.SECRET_KEY

# ❌ Never do this - 하드코딩
SECRET_KEY = "hardcoded_secret_123"
DATABASE_URL = "postgresql://localhost/mydb"
```

## Usage in Tests

```python
import os
import pytest

# 환경 변수 없으면 테스트 skip
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    pytest.skip("DATABASE_URL 환경 변수 없음 - .env.example 참조", allow_module_level=True)
```

## 핵심 정리

1. **하드코딩 금지**: 모든 외부 연결은 환경 변수로
2. **Mock 데이터 금지**: 테스트도 실제 환경 사용
3. **.env.example 필수**: 필요한 환경 변수 문서화
4. **명확한 에러**: 환경 변수 없을 때 어떤 변수가 필요한지 안내
5. **선택적 외부 API**: 없어도 앱이 동작하도록 설계
