---
name: python-fastapi-programmer:ddd-class-diagram
description: DDD Class Diagram 생성. Domain Book의 domain-model.md를 읽고 Mermaid erDiagram으로 DDD_CLASS_DIAGRAM.md를 생성. PK/FK, Enum, Cascade, Index 전략 포함. Phase 4에서 _models.py 생성 전에 사용.
---

# DDD Class Diagram 생성

Domain Book의 도메인 모델 정의를 Mermaid erDiagram으로 변환합니다.

## 실행 흐름

1. **입력 읽기**: `ai-context/domain-books/{domain}/domain-model.md` 파일 읽기
2. **다이어그램 생성**: Mermaid erDiagram 문법으로 변환
3. **출력 저장**: `docs/DDD_CLASS_DIAGRAM.md`에 저장

## 필수 포함 항목

### Entity 정의
- **PK**: Primary Key (UUID 기본)
- **FK**: Foreign Key (관계 명시)
- **NOT NULL**: 필수 필드 표시
- **UNIQUE**: 유니크 제약 조건
- **DEFAULT**: 기본값
- **INDEX**: 인덱스 전략

### Enum 정의
- 모든 Enum 값 나열
- 각 값의 의미 주석 포함

### 관계 (Relationships)
- 1:1, 1:N, N:M 관계 명시
- FK 위치 명확히 표시

### Cascade 규칙
- ON DELETE (CASCADE, SET NULL, RESTRICT)
- ON UPDATE 정책

### 기타
- Fetch 전략 (EAGER/LAZY) — 주석으로 표시
- Orphan Removal 정책
- 복합 인덱스 전략

## 출력 형식

```markdown
# DDD Class Diagram

## Entity Relationship Diagram

\```mermaid
erDiagram
    USER {
        uuid id PK "NOT NULL"
        string email "NOT NULL, UNIQUE, INDEX"
        string password_hash "NOT NULL"
        string nickname "NOT NULL"
        boolean is_active "DEFAULT true"
        datetime created_at "NOT NULL"
        datetime updated_at "NOT NULL"
        datetime deleted_at "NULLABLE"
    }

    ORDER {
        uuid id PK "NOT NULL"
        uuid user_id FK "NOT NULL, INDEX"
        string status "NOT NULL, DEFAULT 'PENDING'"
    }

    USER ||--o{ ORDER : "places"
\```

## Enum Definitions

| Enum | Values | Description |
|------|--------|-------------|
| OrderStatus | PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED | 주문 상태 |

## Cascade Rules

| Parent | Child | ON DELETE | ON UPDATE |
|--------|-------|-----------|-----------|
| USER | ORDER | CASCADE | CASCADE |

## Index Strategy

| Table | Columns | Type | Purpose |
|-------|---------|------|---------|
| users | email | UNIQUE | 로그인 조회 |
| orders | user_id, created_at | COMPOSITE | 사용자별 주문 목록 |
```

## 참고

- [diagram-template.md](references/diagram-template.md) — 전체 예시 템플릿
