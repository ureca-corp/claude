# Domain Book Builder

> **"소문날 정도로 완벽한 도메인 설계서를 작성하는 플러그인"**

기술 스택에 완전히 독립적인 순수 도메인 지식 문서화.
백엔드, 플러터, 웹 어디든 적용 가능한 **진짜 제품 명세서**.

---

## 🎯 철학

### "책 집필"에 비유

이 플러그인은 **코드를 생성하지 않습니다**.
대신, 훌륭한 **기획서(책)**를 씁니다.

- 📖 **1장**: 이 도메인이 하는 일 (기능 정의)
- 📖 **2장**: 도메인의 언어 (유비쿼터스 언어)
- 📖 **3장**: API 설계 (추상적, 기술 무관)
- 📖 **4장**: 비즈니스 규칙 (제약조건, 정책)

이 책은 개발자, 디자이너, PM 누구나 읽고 이해할 수 있어야 합니다.

---

## 🚀 워크플로우

```
사용자 요청
    ↓
┌─────────────────────────────────────────────────┐
│ Phase 1: Clarifier (요구사항 명확화)             │
│   - 모호함 제로까지 질문                         │
│   - SESSION.md 점진적 업데이트                   │
│   → 사용자 승인 ✅                               │
└─────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────┐
│ Phase 2: Interviewer (도메인 완전 인터뷰)        │
│   - 도메인별 모호함 완전 해결                    │
│   - 배치별 점진적 업데이트                       │
│   - SESSION.md 실시간 갱신                       │
│   → 사용자 승인 ✅                               │
└─────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────┐
│ Phase 3: Domain Modeler (유비쿼터스 언어 명세)  │
│   - ERD 그리기 X                                │
│   - 서술형 명세 (A는 B를 할 수 있다)            │
│   - domain-model.md 점진적 작성                 │
│   → 사용자 승인 ✅                               │
└─────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────┐
│ Phase 4: API Designer (API 상세 설계)           │
│   - Request/Response 정확히                     │
│   - 복잡한 로직 → 수도코드                      │
│   - api-spec.md 점진적 작성                     │
│   → 사용자 승인 ✅                               │
└─────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────┐
│ Phase 5: Book Writer (병렬 책 집필)             │
│   - 도메인 의존성 자동 해결 (Topological Sort)  │
│   - 독립 도메인 먼저 → 의존 도메인 나중         │
│   - 병렬 작성 (여러 도메인 동시)                │
│   → 자동 완료 (승인 불필요)                     │
└─────────────────────────────────────────────────┘
    ↓
✅ Domain Book 완성
```

---

## 📚 생성 결과

```
/ai-context/domain-books/{domain}/
├── README.md              # 도메인 목차 + 요약
├── features.md            # 기능 정의
├── domain-model.md        # 유비쿼터스 언어 명세
├── api-spec.md            # API 상세 설계
└── business-rules.md      # 비즈니스 규칙
```

**특징**:
- ✅ 기술 용어 0개 (FastAPI, PostgreSQL 언급 X)
- ✅ 누구나 읽고 이해 가능
- ✅ 백엔드/플러터/웹 모두 적용 가능
- ✅ 개발 진행 상태 포함 X

---

## 🔄 점진적 업데이트

**핵심 원칙**: 배치 단위로 질문 → 답변 → 즉시 문서 업데이트

```
❌ 나쁜 방식:
25개 질문 → 모두 답변 → 마지막에 한 번에 문서 작성

✅ 좋은 방식:
5개 질문 → 답변 → 즉시 문서 업데이트 ⚡
5개 질문 → 답변 → 문서에 추가 ⚡
5개 질문 → 답변 → 문서에 추가 ⚡
```

**장점**:
- 🔄 실시간 진행 상황 확인
- 💾 세션 중단 시 복구 가능
- 🧠 에이전트 메모리 부담 감소
- 🐛 오류 발생 시 롤백 최소화

---

## 🔗 도메인 의존성 처리

### 문제 상황

```
users 도메인 (독립)
orders 도메인 (users에 의존, FK)
payments 도메인 (orders에 의존, FK)
```

Phase 5에서 병렬 작성 시:
- orders를 작성하려면 users가 먼저 완성되어야 함
- payments를 작성하려면 orders가 먼저 완성되어야 함

### 해결: Topological Sort

```python
dependencies = {
    "users": [],
    "orders": ["users"],
    "payments": ["orders"]
}

sorted_domains = ["users", "orders", "payments"]

# 순차 병렬 실행
Task("5-book-writer", domain="users")       # 즉시
# users 완료 대기
Task("5-book-writer", domain="orders")      # users 후
# orders 완료 대기
Task("5-book-writer", domain="payments")    # orders 후
```

---

## 🚫 이 플러그인이 하지 않는 것

- ❌ 코드 생성
- ❌ 기술 스택 선택
- ❌ 외부 API 연동 세부사항
- ❌ 데이터베이스 설계
- ❌ 테스트 케이스 작성

→ **순수 기획 문서만 작성**합니다.

---

## 📖 다음 단계

Domain Book 완성 후:
- `project-bootstrap` 플러그인 → FastAPI 백엔드
- `flutter-builder` 플러그인 → Flutter 앱 (미래)
- `nextjs-builder` 플러그인 → Next.js 웹 (미래)

---

## 🎯 사용 예시

```
사용자: "외국인 여행자용 번역 앱 만들어줘"

Claude:
🔍 Phase 1 시작: 요구사항 명확화
❓ 배치 1: 4개 질문
...
✅ Phase 1 완료

🔍 Phase 2 시작: 도메인 인터뷰
🎯 users 도메인
❓ 배치 1: 3개 질문
...
✅ users 완료

🎯 translations 도메인
...
✅ Phase 2 완료

🔍 Phase 3 시작: 유비쿼터스 언어 명세
📝 users/domain-model.md 작성 중...
...
✅ Phase 3 완료

🔍 Phase 4 시작: API 설계
📝 users/api-spec.md 작성 중...
...
✅ Phase 4 완료

🔍 Phase 5 시작: Domain Book 작성
📚 users, translations, missions, phrases 병렬 작성...
✅ Phase 5 완료

✅ Domain Book 완성!
   - ai-context/domain-books/users/
   - ai-context/domain-books/translations/
   - ai-context/domain-books/missions/
   - ai-context/domain-books/phrases/
```
