# Vertical Slice Architecture Pattern

## 개요

Vertical Slice Architecture는 기능별로 코드를 수직으로 분리하는 패턴입니다.
전통적인 계층형 아키텍처와 달리, **각 기능이 독립적인 파일로 분리**됩니다.

## 핵심 원칙

1. **기능별 파일 분리**: 각 Use Case는 별도 파일
2. **Slim Entities**: Domain 모델은 단순 데이터 구조 (_models.py에만)
3. **Fat Use Cases**: 비즈니스 로직은 Use Case 파일에 집중
4. **Clear Interface**: API 라우터는 Use Case만 호출

## 디렉토리 구조

```
src/modules/{domain}/
├── __init__.py          # Router 조합 (APIRouter + include_router)
├── _models.py           # Entities (BaseModel 상속 → id, timestamps, soft_delete 포함)
├── _repository.py       # 공유 DB 접근 (선택)
├── register.py          # Use Case (DTO + Service + Controller 통합)
├── login.py             # Use Case (DTO + Service + Controller 통합)
└── get_profile.py       # Use Case (DTO + Service + Controller 통합)
```

### __init__.py (Router 조합)

```python
"""users 도메인"""

from fastapi import APIRouter

from .register import router as register_router
from .login import router as login_router
from .get_profile import router as get_profile_router

router = APIRouter(prefix="/users", tags=["users"])
router.include_router(register_router)
router.include_router(login_router)
router.include_router(get_profile_router)
```

### Entities 규칙

```python
# ✅ BaseModel 상속 (id, created_at, updated_at, deleted_at 자동 포함)
from src.core.models import BaseModel as AppBaseModel

class User(AppBaseModel, table=True):
    __tablename__ = "users"
    email: str = Field(max_length=255, unique=True)

# ❌ SQLModel 직접 상속 + 수동 timestamp 금지
```

## 핵심 정리

1. **기능별 파일 분리**: 각 Use Case는 독립 파일 (DTO + Service + Controller 통합)
2. **Entities는 _models.py에만**: Domain 모델 중앙화
3. **Use Case = 완전한 Vertical Slice**: DTO, 비즈니스 로직, 엔드포인트가 한 파일에
4. **__init__.py = Router 조합**: 각 feature의 router를 include_router로 조합
5. **DTO = 인라인**: 각 feature 파일 내에 Request/Response 정의
