---
description: Domain Book Builder 워크플로우 시작 - 요구사항부터 완벽한 도메인 설계서까지
---

# Domain Book Builder 시작

사용자의 제품 아이디어를 기술 독립적인 완벽한 도메인 설계 문서로 변환하는 5단계 워크플로우를 시작합니다.

## 세션 재개 확인 (최우선)

먼저 `.claude/SESSION.md`가 존재하는지 확인한다.

**기존 세션이 있으면** SESSION.md를 읽고 현재 상태를 파악한 뒤 이어서 진행한다:

```
SESSION.md 상태 → 다음 행동
─────────────────────────────────────────────
"Phase 1 진행 중"  → Phase 1 (Clarifier) 재개
"Phase 1 완료"    → Phase 2 (Interviewer) 시작
"Phase 2 진행 중"  → Phase 2 (Interviewer) 재개
"Phase 2 완료"    → Phase 3 (Domain Modeler) 시작
"Phase 3 진행 중"  → Phase 3 (Domain Modeler) 재개
"Phase 3 완료"    → Phase 4 (API Designer) 시작
"Phase 4 진행 중"  → Phase 4 (API Designer) 재개
"Phase 4 완료"    → Phase 5 (Book Writer) 시작
```

사용자에게 재개 지점을 알리고 승인을 받은 뒤 해당 Phase를 시작한다.

**기존 세션이 없으면** 아래 워크플로우를 새로 시작한다.

---

## 핵심 설계 원칙 (모든 단계에 적용)

Domain Book을 작성하는 동안 아래 5가지 원칙이 모든 판단의 기준이 된다:

| # | 원칙 | 의미 |
|---|------|------|
| 1 | **DDD 기반** | 단순 기능 나열보다 도메인 개념과 확장성 우선 |
| 2 | **Aggregate Root 중심 설계** | 테이블을 단순 나열하지 않고 Aggregate Root를 중심으로 경계를 정의 |
| 3 | **도메인 역할 분리** | 각 도메인의 책임 경계를 엄격히 유지 — 다른 도메인의 내부 로직에 개입하지 않음 |
| 4 | **정규화 준수** | 데이터 중복을 최소화하고 정규형을 유지 |
| 5 | **DTO 분리** | 공통 도메인 DTO(여러 도메인 공유)와 특정 도메인 종속 DTO(해당 도메인 전용)를 명확히 구분 |

이 원칙들은 Phase 2 인터뷰, Phase 3 도메인 모델링, Phase 4 API 설계에 직접 반영된다.

---

## 워크플로우 개요

이 플러그인은 다음 5단계로 진행됩니다:

1. **Phase 1: Clarifier** - 요구사항 명확화
   - 모든 모호함 제거
   - 도메인 목록 확정
   - 출력: `.claude/SESSION.md`

2. **Phase 2: Interviewer** - 도메인 인터뷰
   - 도메인별 모호함 완전 해결
   - 출력: `.claude/SESSION.md` (업데이트)

3. **Phase 3: Domain Modeler** - 유비쿼터스 언어 명세
   - 서술형 도메인 모델 작성
   - 출력: `ai-context/domain-books/{domain}/domain-model.md`

4. **Phase 4: API Designer** - API 상세 설계
   - Request/Response 명세
   - 출력: `ai-context/domain-books/{domain}/api-spec.md`

5. **Phase 5: Book Writer** - Domain Book 작성
   - 최종 도메인 설계서 생성
   - 출력: `ai-context/domain-books/{domain}/*`

---

## 시작하기

사용자가 제공한 제품 아이디어를 바탕으로:

1. 제품의 핵심 목적과 대상 사용자를 이해합니다
2. Phase 1 (Clarifier) 워크플로우를 시작합니다
3. 배치 단위(최대 4개씩)로 질문하여 모호함을 제거합니다

**중요 원칙**:
- 기술 용어 사용 금지 (FastAPI, PostgreSQL 등)
- 누구나 이해 가능한 순수 도메인 언어 사용
- 점진적 문서 업데이트 (질문 → 답변 → 즉시 업데이트)

---

## 진행 방법

사용자에게 다음과 같이 안내하세요:

"Domain Book Builder 워크플로우를 시작합니다. 제품 아이디어를 간단히 설명해주세요. 예:

- '외국인 여행자용 번역 앱'
- '소상공인 재고 관리 시스템'
- '독서 모임 매칭 플랫폼'

설명해주시면 요구사항 명확화를 시작하겠습니다."
