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
├── __init__.py
├── _models.py          # Entities (Domain 모델만)
├── register.py         # Use Case (회원가입 비즈니스 로직)
├── login.py            # Use Case (로그인 비즈니스 로직)
├── get_profile.py      # Use Case (프로필 조회 비즈니스 로직)
└── router.py           # Interface Adapter (API 엔드포인트만)
```

## 핵심 정리

1. **기능별 파일 분리**: 각 Use Case는 독립 파일
2. **Entities는 _models.py에만**: Domain 모델 중앙화
3. **Use Case = 비즈니스 로직**: 모든 로직은 Use Case 파일에
4. **Router = 엔드포인트만**: 단순 Use Case 호출
5. **DTO = Request/Response만**: 데이터 변환 역할
