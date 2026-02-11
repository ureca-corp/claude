---
description: Domain Book Builder 워크플로우 시작 - 요구사항부터 완벽한 도메인 설계서까지
disable-model-invocation: true
---

# Domain Book Builder 시작

사용자의 제품 아이디어를 기술 독립적인 완벽한 도메인 설계 문서로 변환하는 5단계 워크플로우를 시작합니다.

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

## 시작하기

사용자가 제공한 제품 아이디어를 바탕으로:

1. 제품의 핵심 목적과 대상 사용자를 이해합니다
2. Phase 1 (Clarifier) 워크플로우를 시작합니다
3. 배치 단위(최대 4개씩)로 질문하여 모호함을 제거합니다

**중요 원칙**:
- 기술 용어 사용 금지 (FastAPI, PostgreSQL 등)
- 누구나 이해 가능한 순수 도메인 언어 사용
- 점진적 문서 업데이트 (질문 → 답변 → 즉시 업데이트)

## 진행 방법

사용자에게 다음과 같이 안내하세요:

"Domain Book Builder 워크플로우를 시작합니다. 제품 아이디어를 간단히 설명해주세요. 예:

- '외국인 여행자용 번역 앱'
- '소상공인 재고 관리 시스템'
- '독서 모임 매칭 플랫폼'

설명해주시면 요구사항 명확화를 시작하겠습니다."
