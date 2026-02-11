# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

**Domain Book Builder**는 기술 스택에 완전히 독립적인 순수 도메인 설계 문서를 생성하는 Claude Code 플러그인입니다. 코드를 생성하지 않고, 대신 훌륭한 "기획서"를 작성합니다.

### 핵심 철학

- 기술 용어 0개 (FastAPI, PostgreSQL 등 특정 기술 언급 금지)
- 누구나 (개발자, 디자이너, PM) 읽고 이해 가능한 문서
- 백엔드/플러터/웹 어디든 적용 가능한 순수 도메인 지식

## 아키텍처

### 프로젝트 구조

```
domain-book-builder/
├── .claude-plugin/
│   └── plugin.json          # 플러그인 메타데이터 및 워크플로우 정의
├── agents/                  # 5개 Phase 에이전트 프롬프트
│   ├── 1-clarifier.md       # Phase 1: 요구사항 명확화
│   ├── 2-interviewer.md     # Phase 2: 도메인 인터뷰
│   ├── 3-domain-modeler.md  # Phase 3: 유비쿼터스 언어 명세
│   ├── 4-api-designer.md    # Phase 4: API 상세 설계
│   └── 5-book-writer.md     # Phase 5: Domain Book 작성
├── skills/                  # 각 Phase의 실행 스킬
│   ├── 1-clarify/
│   ├── 2-interview-domain/
│   ├── 3-model-domain/
│   ├── 4-design-api/
│   └── 5-write-book/
└── README.md
```

### 5단계 워크플로우

플러그인은 순차적 승인 기반 워크플로우를 따릅니다:

1. **Phase 1: Clarifier** (승인 필요)
   - 출력: `.claude/SESSION.md`
   - 요구사항 모호함 완전 제거
   - 배치 단위(최대 4개씩) 질문 → 답변 → 즉시 문서 업데이트

2. **Phase 2: Interviewer** (승인 필요)
   - 출력: `.claude/SESSION.md` (업데이트)
   - 도메인별 모호함 완전 해결
   - 점진적 SESSION.md 업데이트

3. **Phase 3: Domain Modeler** (승인 필요)
   - 출력: `ai-context/domain-books/{domain}/domain-model.md`
   - 유비쿼터스 언어 서술형 명세 (ERD 아님)
   - "A는 B를 할 수 있다" 형식

4. **Phase 4: API Designer** (승인 필요)
   - 출력: `ai-context/domain-books/{domain}/api-spec.md`
   - Request/Response 정확한 명세
   - 복잡한 로직은 수도코드로 표현

5. **Phase 5: Book Writer** (자동 실행)
   - 출력: `ai-context/domain-books/{domain}/*`
   - 병렬 작성 가능 (도메인 의존성 자동 해결)
   - Topological Sort로 독립 도메인 먼저 → 의존 도메인 나중

### 점진적 업데이트 원칙

**핵심**: 배치 단위로 질문 → 답변 → 즉시 문서 업데이트

```
✅ 좋은 방식:
5개 질문 → 답변 → 즉시 문서 업데이트 ⚡
5개 질문 → 답변 → 문서에 추가 ⚡
5개 질문 → 답변 → 문서에 추가 ⚡

❌ 나쁜 방식:
25개 질문 → 모두 답변 → 마지막에 한 번에 문서 작성
```

**장점**:
- 실시간 진행 상황 확인
- 세션 중단 시 복구 가능
- 에이전트 메모리 부담 감소
- 오류 발생 시 롤백 최소화

## 출력 구조

```
/ai-context/domain-books/{domain}/
├── README.md              # 도메인 목차 + 요약
├── features.md            # 기능 정의
├── domain-model.md        # 유비쿼터스 언어 명세
├── api-spec.md            # API 상세 설계
└── business-rules.md      # 비즈니스 규칙
```

## 에이전트/스킬 수정 시 주의사항

### Agent 프롬프트 수정 (`agents/*.md`)

- 각 에이전트는 독립적으로 실행되는 자율 에이전트
- `AskUserQuestion`의 최대 질문 개수는 4개 (제약 조건)
- 점진적 업데이트 패턴 유지 필수
- Phase 5 에이전트는 도메인 의존성 처리 로직 포함

### Skill 수정 (`skills/*/SKILL.md`)

- 각 스킬은 해당 Phase의 실제 실행 로직
- 템플릿 참조 경로 확인 필수 (`templates/` 디렉토리)
- 점진적 업데이트 구현 시 `Edit` 도구 사용, `Write` 금지

### plugin.json 수정

- `workflow`: "sequential-with-approval" 고정
- Phase 1-4는 `approval_required: true`
- Phase 5만 `approval_required: false` + `parallel: true`
- `incremental_updates: true`는 모든 Phase 권장

## 플러그인이 하지 않는 것

- ❌ 코드 생성
- ❌ 기술 스택 선택
- ❌ 외부 API 연동 세부사항
- ❌ 데이터베이스 설계
- ❌ 테스트 케이스 작성

→ **순수 기획 문서만 작성**

## 다음 단계 통합

Domain Book 완성 후 다른 플러그인과 연계:
- `project-bootstrap` 플러그인 → FastAPI 백엔드 생성
- `flutter-builder` 플러그인 → Flutter 앱 (미래)
- `nextjs-builder` 플러그인 → Next.js 웹 (미래)
