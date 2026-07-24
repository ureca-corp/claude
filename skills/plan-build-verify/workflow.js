// plan-build-verify (ADAPTIVE) — 슬라이스 난이도(tier)에 맞춰 리뷰 규모를 자동 조절하는 워크플로우
//
// 파이프라인: 계획(슬라이스 분해 + tier 판정) -> 슬라이스별 구현 -> tier별 리뷰 규모로
// 병렬 적대적 리뷰 -> 컨펌 이슈 0건까지 리팩토링 루프 -> 최종 전체 테스트·빌드 통과 보장.
//
// workflow-routed.js와의 차이(adaptive 핵심):
//  1) Plan이 슬라이스별 tier(light|medium|heavy|max)까지 판정한다(추가 비용 0, 같은 호출).
//  2) tier가 리뷰 관점 수 + Codex 사용 + maxRounds + max 완전성 크리틱 게이트를 함께 조절한다.
//  3) 바닥선: 모든 tier가 최소 1관점 리뷰 + Final 전체 빌드/테스트 게이트를 통과한다.
//  4) 사후 에스컬레이션: light/medium이라도 (a) 첫 리뷰가 critical/major를 뱉거나
//     (b) git diff가 위험 신호(마이그레이션·도메인 불변식 변경·변경 파일 다수)면
//     그 슬라이스만 heavy로 승격해 남은 라운드를 풀 리뷰한다.
//
// Workflow 도구로 호출한다(scriptPath = 이 파일). 작업 내용은 args로 넘긴다:
//   args = {
//     task:    string  (필수) 무엇을 만들/고칠지에 대한 자기완결 설명
//     repo:    string  (선택) 저장소 절대경로(기본: 현재 작업 디렉터리)
//     build:   string  (선택) 전체 빌드 명령
//     test:    string  (선택) 전체 테스트 명령
//     slices:  array   (선택) 미리 정한 슬라이스 목록(각 항목에 tier 지정 가능; 없으면 Plan이 분해·판정)
//     protect: array   (선택) 절대 건드리면 안 되는 파일/디렉터리
//     maxRounds: number(선택) heavy/max tier 상한(기본 4). light=1·medium=2는 이 값으로 상향 클램프.
//     buildModel: string(선택) 구현/리팩터/최종수정 모델(기본 'sonnet'). 결함이 실려 나가면 비싼 작업은 'opus'.
//     sliceGate: string(선택) 슬라이스마다 통과를 강제하는 기계 게이트 명령(exit 0=통과). 실패 시 그 자리에서 수정 루프(sliceGateRounds회). 프로젝트 하네스가 자기 게이트를 주입(스킬은 내용 불문).
//     sliceGateRounds: number(선택) sliceGate 수정 시도 상한(기본 maxRounds).
//     tier:    string  (선택) 전체 강제 tier(개별 슬라이스 tier보다 우선). "light|medium|heavy|max".
//     escalateFiles: number (선택) 에스컬레이션 변경파일 임계(기본 8)
//     integrateInto: string(선택) 이 웨이브가 나중에 병합될 "대상 통합 브랜치"명. 지정하면 Final 뒤
//       통합 프로브가 대상 브랜치와의 시험 병합을 스크래치에서 수행해, 격리 워크트리가 못 보는
//       통합 비용(충돌·삭제/이름변경한 공유 심볼을 소비하는 대상측 새 코드의 컴파일 파괴)을 가시화한다.
//     context: string  (선택) 공통 컨텍스트
//   }

export const meta = {
  name: 'plan-build-verify',
  description: '계획+tier판정 → 슬라이스별 구현 → tier별 적응 리뷰(경량~풀) → 이슈 0건까지 리팩토링 → 최종 통과 보장',
  phases: [
    { title: 'Plan', detail: '슬라이스 분해 + 슬라이스별 tier(light/medium/heavy/max) 판정 + 빌드/테스트 명령' },
    { title: 'Build', detail: '슬라이스별 구현(순차, 의존 순서대로)' },
    { title: 'Review', detail: 'tier별 적응 리뷰(light=1관점, medium=2관점, heavy=4관점+Codex, max=+완전성 크리틱 게이트)' },
    { title: 'Refactor', detail: '컨펌된 critical/major 0건까지 수정·재리뷰(에스컬레이션 시 heavy 승격)' },
    { title: 'Final', detail: '전체 테스트·빌드 통과 보장(모든 tier 공통 바닥선)' },
    { title: 'Integrate', detail: '대상 브랜치와 시험 병합해 통합 비용(충돌·심볼 파괴) 가시화 — integrateInto 지정 시에만' },
  ],
}

function resolveArgs(raw) {
  if (raw == null) return {}
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch (e) { return { task: raw } }
  }
  return raw
}
const A = resolveArgs(args)
const TASK = A.task || A.goal || ''
const REPO = A.repo || A.repoPath || '현재 작업 디렉터리'
const BUILD_IN = A.build || A.buildCommand || ''
const TEST_IN = A.test || A.testCommand || ''
const HEAVY_MAX_ROUNDS = A.maxRounds || 4
// 코드를 "쓰는" 에이전트(build·refactor·final-fix)의 모델. 기본은 sonnet(비용 효율).
// 리뷰어는 opus 고정이라 비대칭이 생기는데, 리팩터가 4라운드 안에 critical/major를
// 못 닫으면 웨이브가 그 결함을 안고 다음 슬라이스로 넘어간다(outstandingIssues로만 기록).
// 결함이 실려 나가는 게 더 비싼 작업(보안·정산·마이그레이션)에서는 buildModel:'opus'로 올린다.
const BUILD_MODEL = A.buildModel || 'sonnet'
// sliceGate: 슬라이스마다 "통과할 때까지 고치는" 기계 게이트 명령(exit 0 = 통과).
// 리뷰→리팩터 루프(라운드 상한 있음, 사람식 판단)와 달리 exit code로 객관
// 판정되며 green을 강제한다 — 리뷰가 놓친 결함도 게이트가 실패로 잡으면 반드시
// 수정되고 넘어간다. 명령 내용은 프로젝트가 정하며(이 스킬은 모름), 프로젝트
// 하네스가 자기 게이트를 이 인자로 주입한다. accept와의 차이: accept는 최종에
// 한 번, sliceGate는 슬라이스마다(조기 차단·조기 수정).
const SLICE_GATE = A.sliceGate || A.sliceGateCommand || ''
const SLICE_GATE_MAX = A.sliceGateRounds || HEAVY_MAX_ROUNDS
const PROTECT = Array.isArray(A.protect) ? A.protect : []
const EXTRA_CONTEXT = A.context || ''
const PRESET_SLICES = Array.isArray(A.slices) ? A.slices : null
const FORCED_TIER = (typeof A.tier === 'string' && ['light', 'medium', 'heavy', 'max'].includes(A.tier)) ? A.tier : null
const ESCALATE_FILES = A.escalateFiles || 8
// ---- 방향 가드레일(범용) ----
// accept: 작업의 "의도(형상/계약)"를 객관 검증하는 실행 명령(exit 0 = 통과). 테스트만으로 못 잡는
//   구조 규약·아키텍처 형상·API 계약 등을 exit code로 판정하게 만든다. 없으면 Plan이 제안하도록 유도.
// tracer: true면 첫(레퍼런스) 슬라이스만 만들고 멈춰서 방향을 확정한 뒤 resumeFromRunId로 나머지를
//   이어가게 한다("잘못된 방향으로 5시간" 대신 레퍼런스 1개로 30분 내 방향 확정).
const ACCEPT_IN = A.accept || A.acceptCommand || ''
const TRACER = A.tracer === true || A.tracerFirst === true
// integrateInto: 이 웨이브가 병합될 대상 통합 브랜치명. 지정하면 Final 뒤 통합 프로브가
//   대상 브랜치와의 시험 병합을 스크래치에서 수행한다. 격리 워크트리는 자기 base 위에서만
//   게이트를 통과시키므로, 그 사이 대상 브랜치에 쌓인 동시 커밋이 이 웨이브가 지운/이름바꾼
//   공유 심볼을 소비하면 격리 게이트는 모두 통과해도 "병합하는 순간" 깨진다 — 격리 자체가 못
//   보는 통합 비용이다. 이 프로브가 그걸 Final 단계에서 미리 드러낸다(브랜치명은 인자, 검증
//   명령은 기존 build/test/accept 재사용 — 이 스킬은 프로젝트 값을 담지 않는다).
const INTEGRATE_INTO = A.integrateInto || A.targetBranch || ''

if (!TASK) {
  log('ERROR: args.task가 필요합니다(무엇을 만들지 설명).')
  return { error: 'args.task is required' }
}

const PROTECT_NOTE = PROTECT.length
  ? '\n\n절대 수정·생성하면 안 되는 경로(동시 작업 보호): ' + PROTECT.join(', ') + ' — 이 경로의 파일은 읽기만 하고 변경하지 말 것.'
  : ''
const CONTEXT_NOTE = EXTRA_CONTEXT ? '\n\n공통 컨텍스트(계약/시그니처 등):\n' + EXTRA_CONTEXT : ''
const BASE = '저장소: ' + REPO + '.\n작업(전체 목표): ' + TASK + CONTEXT_NOTE + PROTECT_NOTE

// ---- tier -> 리뷰 규모 매핑 (adaptive 핵심 테이블) ----
// lensCount: Claude 리뷰 관점 수(1~4). useCodex: Codex 적대적 리뷰 사용 여부. rounds: 리팩토링 최대 라운드.
// critic: max 전용 완전성 크리틱 게이트(표준 리뷰가 clean이어도 돈·보안 실패모드를 한 번 더 적대 탐색).
const TIER_CONFIG = {
  light: { lensCount: 1, useCodex: false, rounds: 1 },
  medium: { lensCount: 2, useCodex: false, rounds: 2 },
  heavy: { lensCount: 4, useCodex: true, rounds: HEAVY_MAX_ROUNDS },
  max: { lensCount: 4, useCodex: true, rounds: HEAVY_MAX_ROUNDS, critic: true },
}
// Codex 적대 리뷰 강제 비활성(args.useCodex === false) — Codex 런타임(omo)이 rate-limit·프로세스
// leak으로 로컬 CPU/RAM 과부하를 유발할 때 Claude 관점만으로 돌린다. 품질 바닥선은 유지된다:
// heavy/max는 여전히 4관점, max는 완전성 크리틱(Claude)까지 유지. 기본값은 tier 설정(하위호환).
if (A.useCodex === false) {
  TIER_CONFIG.heavy.useCodex = false
  TIER_CONFIG.max.useCodex = false
}
// tier 강도 순서: 에스컬레이션(자동 승격)은 heavy 미만만 대상으로 하고, max는 절대 강등하지 않는다.
const TIER_ORDER = { light: 0, medium: 1, heavy: 2, max: 3 }
function tierOf(t) {
  const key = FORCED_TIER || (typeof t === 'string' && TIER_CONFIG[t] ? t : 'medium')
  return { key, cfg: TIER_CONFIG[key] }
}

const PLAN_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['slices'],
  properties: {
    overview: { type: 'string' },
    buildCommand: { type: 'string' },
    testCommand: { type: 'string' },
    // 작업 의도를 객관 검증하는 실행 명령(exit 0 = 통과). 테스트로 못 잡는 형상/계약을 exit code로.
    acceptCommand: { type: 'string' },
    slices: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['title', 'goal', 'tier', 'tierReason'],
        properties: {
          title: { type: 'string' },
          goal: { type: 'string' },
          files: { type: 'array', items: { type: 'string' } },
          acceptance: { type: 'string' },
          // adaptive: 슬라이스 난이도. light=선례복제·시드·필드추가, medium=표준 CRUD·어댑터,
          // heavy=도메인 불변식 신설/변경·마이그레이션·경계 재작성·동시성/트랜잭션·보안민감,
          // max=돈·정산·결제·인증 등 오류 시 실피해가 나는 소수 슬라이스(heavy + 완전성 크리틱 게이트).
          tier: { type: 'string', enum: ['light', 'medium', 'heavy', 'max'] },
          tierReason: { type: 'string' },
        },
      },
    },
  },
}

const FINDINGS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['issues'],
  properties: {
    issues: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['severity', 'title', 'detail', 'file'],
        properties: {
          severity: { type: 'string', enum: ['critical', 'major', 'minor', 'nit'] },
          title: { type: 'string' },
          detail: { type: 'string' },
          file: { type: 'string' },
          line: { type: 'integer' },
          suggestedFix: { type: 'string' },
        },
      },
    },
  },
}

const BUILD_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['passed', 'details'],
  properties: {
    passed: { type: 'boolean' },
    details: { type: 'string' },
    failing: { type: 'array', items: { type: 'string' } },
  },
}

// 에스컬레이션 판정용 diff 신호 스키마.
const DIFF_SIGNAL_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['changedFileCount', 'touchesMigration', 'touchesInvariant', 'reason'],
  properties: {
    changedFileCount: { type: 'integer' },
    touchesMigration: { type: 'boolean' },   // db/migration 등 마이그레이션 파일 변경
    touchesInvariant: { type: 'boolean' },   // 도메인 불변식(require(/init{/aggregate) 또는 보안/트랜잭션 경계 변경
    reason: { type: 'string' },
  },
}

// 4관점 리뷰 렌즈. tier에 따라 앞에서부터 lensCount개만 사용(1관점=correctness가 항상 바닥선).
const DEFAULT_LENSES = [
  { key: 'correctness-contract', focus: '정확성·계약: 요구한 동작/외부 계약(API 응답 형태, 입출력 타입, 엣지 입력)을 정확히 만족하는가? 잘못된 결과·누락된 케이스·계약 불일치를 찾아라.' },
  { key: 'architecture-conventions', focus: '아키텍처·관례: 레이어/경계/의존 방향, 네이밍, 코드 컨벤션, 문서/주석 규약(예: KDoc), 죽은 코드·중복을 점검하라. 프로젝트의 기존 가드 테스트를 깨뜨릴 위반을 찾아라.' },
  { key: 'security-robustness', focus: '보안·견고성: 인증/인가 범위, 입력 검증, 인젝션, 비밀/PII 노출, 동시성, 트랜잭션 경계, 자원 누수, 실패 시 degrade를 점검하라.' },
  { key: 'tests-edgecases', focus: '테스트·엣지: 새 동작에 대한 테스트가 충분한가? null/빈값/경계/예외 경로가 검증되는가? 실수로 깨진 기존 테스트는 없는가? 빠진 테스트를 지목하라.' },
]
const LENSES = Array.isArray(A.lenses) && A.lenses.length
  ? A.lenses.map((l, i) => (typeof l === 'string' ? { key: 'lens-' + i, focus: l } : l))
  : DEFAULT_LENSES

// ---------------------------------------------------------------------------
// Phase 1: Plan — 슬라이스 분해 + tier 판정 + 빌드/테스트 명령
// ---------------------------------------------------------------------------
phase('Plan')
let slices = PRESET_SLICES
let buildCmd = BUILD_IN
let testCmd = TEST_IN
let acceptCmd = ACCEPT_IN

if (!slices) {
  const plan = await agent(
    BASE +
    '\n\n위 작업을 구현하기 위한 계획을 세워라. 저장소를 탐색해(빌드 파일·기존 구조·관례) 작업을 서로 독립적이거나 의존 순서가 분명한 "슬라이스"(업무 단위)로 분해하라. 각 슬라이스는 단독으로 구현·검증 가능한 응집 단위여야 한다(너무 잘게 쪼개지 말 것 — 보통 2~6개). 각 슬라이스에 title·goal·예상 files·acceptance를 채워라.' +
    '\n\n또한 각 슬라이스의 난이도 tier를 판정하라(리뷰 규모를 여기에 맞춰 자동 조절한다):' +
    '\n- light: 기존 선례를 복제하거나(예: 유사 엔드포인트/엔티티 복제), 시드/상수/데이터, 응답 DTO에 필드 추가, 설정 변경 등 새 로직·새 불변식이 거의 없는 저위험 작업.' +
    '\n- medium: 표준 CRUD 슬라이스, 어댑터/포트 결선, 기존 패턴을 따르는 신규 서비스 등 로직은 있으나 도메인 불변식·경계를 새로 만들지 않는 작업.' +
    '\n- heavy: 도메인 불변식(aggregate init/require)을 신설·변경하거나, DB 마이그레이션(스키마 변경), 트랜잭션/동시성 경계, 인증·인가·PII 등 보안 민감, 여러 컨텍스트에 걸친 계약 변경 등 오류 시 파급이 큰 작업.' +
    '\n- max: heavy 중에서도 "오류 시 실제 금전·법적 피해"가 나는 극소수 슬라이스에만. 결제/정산/지급대행/환불/위약금 계산, 이중지급·이중예약 멱등성, 인증·인가 경계 신설 등. heavy보다 비싸므로 남발 금지 — 정말 돈·보안이 걸린 것만 max로 올리고, 확신이 없으면 heavy로 두어라.' +
    '\n판정이 애매하면 한 단계 높게(보수적으로) 잡아라. 단, max는 돈·보안 실피해 슬라이스에만 아껴 쓴다. tierReason에 근거를 한 문장으로 적어라.' +
    '\n\n또한 이 프로젝트의 전체 빌드 명령(buildCommand)과 전체 테스트 명령(testCommand)을 실제 빌드 설정에서 확인해 채워라.' +
    (ACCEPT_IN ? '' :
      '\n\n[중요·방향 가드레일] 이 작업의 "의도(원하는 형상·구조·계약)"가 테스트만으로 객관 검증되지 않으면(스택/아키텍처 무관 — 예: 구조·계층·의존 방향 규칙, 공개 API/응답 계약, 스키마·마이그레이션 정합, 성능/번들 예산, 문서·네이밍 규약, 개수·경계 조건 등 프로젝트가 정한 어떤 것이든), 그것을 exit code로 판정하는 acceptCommand를 제안하라. "제대로", "~답게" 같은 형용사가 아니라 실행하면 통과/실패가 갈리는 명령이어야 한다(예: 형상 검증 스크립트를 만들어 실행, 계약 테스트, grep/count 기반 assert). 그런 체커가 아직 없으면 "체커를 만들어 두는 것"을 첫(레퍼런스) 슬라이스에 포함시켜라 — 이후 슬라이스가 그 체커로 게이트된다. 테스트로 충분하면 acceptCommand는 비워도 된다.') +
    '\n\n파일을 수정하지 말고 계획만 반환하라.',
    { label: 'plan', phase: 'Plan', effort: 'high', model: 'opus', schema: PLAN_SCHEMA }
  )
  slices = (plan && plan.slices && plan.slices.length) ? plan.slices : [{ title: '전체 작업', goal: TASK, acceptance: '작업 설명을 모두 충족', tier: 'heavy', tierReason: '분해 실패 폴백 — 보수적으로 heavy' }]
  if (!buildCmd) buildCmd = (plan && plan.buildCommand) || ''
  if (!testCmd) testCmd = (plan && plan.testCommand) || ''
  if (!acceptCmd) acceptCmd = (plan && plan.acceptCommand) || ''
  if (plan && plan.overview) log('계획 개요: ' + plan.overview.slice(0, 240))
}
log('슬라이스 ' + slices.length + '개 / build=' + (buildCmd || '(미정)') + ' / test=' + (testCmd || '(미정)') + (acceptCmd ? ' / accept=' + acceptCmd : '') + (TRACER ? ' / tracer=on(레퍼런스 슬라이스 후 정지)' : ''))
log('tier 배치: ' + slices.map((s, i) => (i + 1) + '=' + tierOf(s.tier).key).join(' '))

const BUILD_HINT = (buildCmd || testCmd)
  ? '\n\n검증 명령 — build: ' + (buildCmd || '(없음)') + ' / test: ' + (testCmd || '(없음)') + ' . 자신이 만진 부분에 해당하는 테스트를 우선 돌려 green을 확인하라.'
  : '\n\n프로젝트의 빌드/테스트 명령을 직접 찾아 자신이 만진 부분을 검증하라.'

// ---------------------------------------------------------------------------
// Phase 2~4: 슬라이스별 (구현 -> tier별 적응 리뷰 -> 0건까지 리팩토링)
// ---------------------------------------------------------------------------
const sliceResults = []
for (let i = 0; i < slices.length; i++) {
  const slice = slices[i]
  let { key: tierKey, cfg } = tierOf(slice.tier)
  const tag = (i + 1) + '/' + slices.length + ' ' + (slice.title || ('slice-' + i)) + ' [' + tierKey + ']'
  const sliceSpec =
    '현재 슬라이스(' + tag + '):\n- 목표: ' + (slice.goal || '') +
    (slice.files ? '\n- 예상 파일: ' + (Array.isArray(slice.files) ? slice.files.join(', ') : slice.files) : '') +
    (slice.acceptance ? '\n- 완료 기준: ' + slice.acceptance : '') +
    '\n- 이미 끝난 슬라이스: ' + (sliceResults.length ? sliceResults.map((r) => r.title).join(', ') : '없음')

  // ---- 구현 ----
  phase('Build')
  await agent(
    BASE +
    '\n\n' + sliceSpec +
    '\n\n이 슬라이스를 구현하라. 기존 코드 스타일·관례를 그대로 따르고, 임시 우회/하드코딩이 아니라 제대로 된 구현을 하라. 이미 끝난 슬라이스의 코드를 망가뜨리지 말 것.' +
    BUILD_HINT +
    '\n\n구현 후 자신이 만진 부분의 컴파일·테스트가 green인지 확인하고, 무엇을 만들/고쳤는지 보고하라.',
    { label: 'build:' + (i + 1), phase: 'Build', effort: 'high', model: BUILD_MODEL }
  )

  // ---- 사전 에스컬레이션 판정: diff 위험 신호로 tier 상향 (light/medium만 대상) ----
  let escalated = false
  if (!FORCED_TIER && TIER_ORDER[tierKey] < TIER_ORDER.heavy) {
    const signal = await agent(
      BASE + '\n\n' + sliceSpec +
      '\n\n방금 이 슬라이스가 구현됐다. `git diff`(스테이징·워킹트리 포함)를 읽고 변경의 위험 신호만 집계하라(코드 리뷰가 아니라 신호 집계다).' +
      '\n- changedFileCount: 이 슬라이스가 변경/추가한 파일 수.' +
      '\n- touchesMigration: DB 마이그레이션 파일(db/migration 등 스키마 변경)을 추가·변경했으면 true.' +
      '\n- touchesInvariant: 도메인 불변식(aggregate의 init{}/require(...))·트랜잭션 경계·인증/인가/PII 처리를 신설·변경했으면 true.' +
      '\n reason에 근거를 한 문장으로. 신호만 반환하라(수정 금지).',
      { label: 'signal:' + (i + 1), phase: 'Review', model: 'sonnet', schema: DIFF_SIGNAL_SCHEMA }
    )
    const risky = signal && (signal.touchesMigration || signal.touchesInvariant || (signal.changedFileCount || 0) >= ESCALATE_FILES)
    if (risky) {
      escalated = true
      tierKey = 'heavy'
      cfg = TIER_CONFIG.heavy
      log(tag + ' — 사전 에스컬레이션 → heavy (' + (signal.reason || 'diff 위험 신호') + ')')
    }
  }

  // ---- tier별 적응 적대적 리뷰 -> 0건까지 리팩토링 ----
  // 바닥선: activeLenses는 최소 1개(correctness), rounds는 최소 1.
  const activeLenses = LENSES.slice(0, Math.max(1, cfg.lensCount))
  let maxRounds = Math.max(1, cfg.rounds)
  let round = 0
  let remaining = []
  while (round < maxRounds) {
    phase('Review')
    const reviewBase =
      BASE + '\n\n' + sliceSpec +
      '\n\n방금 이 슬라이스가 구현됐다. `git diff`와 실제 파일을 읽어 이 슬라이스의 변경을 적대적으로 검토하라(무관한 기존 실패·다른 작업 영역은 무시).'
    const claudeRaw = await parallel(activeLenses.map((l) => () =>
      agent(
        reviewBase + '\n\n리뷰 관점: ' + l.focus +
        '\n\n실제 결함만, 각 항목에 file·line(가능하면)·severity·구체적 수정안을 담아 보고하라. 확실하지 않으면 보고하지 말 것(노이즈보다 누락이 낫다). findings 스키마로 반환.',
        { label: 'review:' + (i + 1) + ':' + l.key, phase: 'Review', model: 'opus', schema: FINDINGS_SCHEMA }
      )
    ))
    const claudeIssues = claudeRaw.filter(Boolean).flatMap((r) => (r.issues || []))

    // heavy·max만 Codex 적대적 리뷰 추가(가장 비싼 단계). max는 뒤에서 완전성 크리틱까지 한 번 더 건다.
    let codexText = 'NO ISSUES'
    if (cfg.useCodex) {
      codexText = await agent(
        reviewBase +
        '\n\nCodex 런타임(codex exec / 공유 런타임)으로 이 슬라이스 변경을 적대적으로 리뷰하라. 실제 버그·계약 위반·보안/동시성/persistence 결함을 찾아라. 각 이슈를 "SEVERITY(critical|major|minor) | file:line | 제목 | 상세 | 수정안" 형식 한 줄로 출력하고, 없으면 "NO ISSUES"라고 답하라.',
        { label: 'review:' + (i + 1) + ':codex', phase: 'Review', agentType: 'codex:codex-rescue' }
      )
    }

    // 통합: 관점이 1개이고 Codex도 없으면(light 대부분) 통합 에이전트를 생략해 비용을 더 줄인다.
    let all
    if (activeLenses.length <= 1 && !cfg.useCodex) {
      all = claudeIssues
    } else {
      const consolidated = await agent(
        '여러 리뷰어가 같은 슬라이스에 대해 낸 findings를 하나로 통합하라. 동일 근본원인 중복 제거, 오탐·순수 스타일 nit 제외, 실제 결함만 남겨라. 프론트/외부 계약 위반·런타임 오류(500)·보안/PII·가드 실패를 부르는 관례 위반은 critical/major로, 작은 정확성 갭은 minor로 분류하라.\n\nCLAUDE findings(JSON):\n' + JSON.stringify(claudeIssues) + '\n\nCODEX findings(text):\n' + (codexText || 'NO ISSUES') + '\n\n통합 findings 스키마로 반환.',
        { label: 'review:' + (i + 1) + ':consolidate', phase: 'Review', model: 'opus', schema: FINDINGS_SCHEMA }
      )
      all = (consolidated && consolidated.issues) ? consolidated.issues : []
    }
    let toFix = all.filter((x) => x.severity === 'critical' || x.severity === 'major')
    log(tag + ' — round ' + round + ': ' + all.length + '건(중 critical/major ' + toFix.length + ')')

    // ---- 사후 에스컬레이션: 첫 리뷰에서 critical/major가 나오면 그 슬라이스를 heavy로 승격(heavy 미만만) ----
    if (round === 0 && !escalated && TIER_ORDER[tierKey] < TIER_ORDER.heavy && toFix.length > 0) {
      escalated = true
      tierKey = 'heavy'
      cfg = TIER_CONFIG.heavy
      maxRounds = Math.max(1, TIER_CONFIG.heavy.rounds)
      log(tag + ' — 사후 에스컬레이션 → heavy (첫 리뷰 critical/major ' + toFix.length + '건, 남은 라운드 풀 리뷰)')
      // activeLenses는 다음 while 반복에서 늘리기 위해 재바인딩이 필요하나,
      // 아래 refactor 후 round++로 다시 진입할 때 heavy 렌즈로 리뷰하도록 참조를 갱신한다.
      while (activeLenses.length < LENSES.length) activeLenses.push(LENSES[activeLenses.length])
    }

    // ---- max 전용 완전성 크리틱 게이트: 표준 4관점+Codex가 clean이어도, 리뷰어가 놓쳤을
    //      돈·보안 실패모드를 다른 종류의 리뷰어가 마지막으로 한 번 더 적대 탐색한다(recall 보강). ----
    if (toFix.length === 0 && cfg.critic) {
      const criticRaw = await agent(
        reviewBase +
        '\n\n표준 다관점 리뷰 + Codex가 이 슬라이스를 clean으로 판정했다. 너는 max-tier 완전성 크리틱이다(마지막 관문). 리뷰어들이 놓쳤을, 오류 시 실제 금전·법적 피해가 나는 결함만 적대적으로 찾아라 — 특히: 금액/반올림/통화 정밀도, 멱등성·중복 처리(이중 지급·이중 예약·재시도), 인가 우회·IDOR·범위 누락, 트랜잭션 경계·부분 커밋·보상(saga) 누락, 동시성 경쟁(@Version 우회·lost update), 외부 계약(응답 형태) 위반, 실패 시 정합성 붕괴. 정말 확신하는 critical/major만 보고하고, 없으면 빈 issues로 반환하라(억지로 만들지 말 것). findings 스키마로 반환.',
        { label: 'review:' + (i + 1) + ':critic:r' + round, phase: 'Review', effort: 'high', model: 'opus', schema: FINDINGS_SCHEMA }
      )
      const criticIssues = ((criticRaw && criticRaw.issues) || []).filter((x) => x.severity === 'critical' || x.severity === 'major')
      if (criticIssues.length) {
        log(tag + ' — round ' + round + ': 완전성 크리틱이 ' + criticIssues.length + '건 추가 발견 → refactor')
        toFix = criticIssues
      } else {
        log(tag + ' — round ' + round + ': 완전성 크리틱 게이트 통과(clean)')
      }
    }

    remaining = toFix
    if (toFix.length === 0) break

    phase('Refactor')
    await agent(
      BASE + '\n\n' + sliceSpec +
      '\n\n아래 컨펌된 이슈를 실제로 수정하라(억제·우회 금지). 기존 관례·문서 규약을 지키고, 다른 슬라이스/영역을 망가뜨리지 말 것.' + BUILD_HINT +
      '\n\n수정 후 자신이 만진 테스트를 다시 돌려 green을 확인하라.\n\n컨펌 이슈(JSON):\n' + JSON.stringify(toFix) +
      '\n\n무엇을 바꿨고 테스트 결과가 어떤지 보고하라.',
      { label: 'refactor:' + (i + 1) + ':r' + round, phase: 'Refactor', effort: 'high', model: BUILD_MODEL }
    )
    round++
  }

  // ---- 슬라이스 하드 게이트(sliceGate): 기계 검증이 green이 될 때까지 고친다. ----
  // 리뷰→리팩터 루프는 라운드 상한에서 결함을 안고 넘어갈 수 있다(사람식 판단).
  // 이 게이트는 exit code로 객관 판정되므로, 리뷰가 놓쳤어도 게이트가 실패로
  // 잡으면 반드시 수정하고 넘어간다 — "찾기"를 사람 리뷰가 아니라 기계에 맡긴다.
  // 게이트 명령은 args.sliceGate로 주입된다(프로젝트별; 이 스킬은 내용을 모른다).
  // 슬라이스 단독으로 통과 불가한 전체상태(end-state) 게이트라면 여기서 실패해도
  // 최종 단계가 다시 강제하므로, 상한 초과 시 경고만 남기고 넘어간다.
  if (SLICE_GATE) {
    let gatePassed = false
    for (let g = 0; g < SLICE_GATE_MAX; g++) {
      const gateCheck = await agent(
        BASE + '\n\n' + sliceSpec +
        '\n\n아래 기계 게이트 명령을 실행하고 결과만 정확히 보고하라(파일 수정 금지). 모든 명령이 exit 0이어야 passed=true다:\n' + SLICE_GATE +
        '\n\n이 슬라이스와 무관한, 명백히 다른 영역의 사전 존재 실패는 details에 분리하고 passed 판단에서 제외하라.\n\npassed·details·failing 스키마로 반환.',
        { label: 'gate:' + (i + 1) + ':' + g, phase: 'Review', model: 'sonnet', schema: BUILD_SCHEMA }
      )
      if (gateCheck && gateCheck.passed) { gatePassed = true; break }
      log(tag + ' — 기계 게이트 실패(시도 ' + g + ') → 수정')
      await agent(
        BASE + '\n\n' + sliceSpec +
        '\n\n기계 게이트가 실패했다. 아래 실패를 실제로 고쳐 green으로 만들어라(억제·우회·테스트 무력화 금지, 이 슬라이스 범위에 한함).' + BUILD_HINT +
        '\n\n게이트 명령:\n' + SLICE_GATE + '\n\n실패 상세:\n' + JSON.stringify(gateCheck) +
        '\n\n무엇을 고쳤는지 보고하라.',
        { label: 'gate-fix:' + (i + 1) + ':' + g, phase: 'Refactor', effort: 'high', model: BUILD_MODEL }
      )
    }
    if (!gatePassed) log(tag + ' — ⚠️ 기계 게이트를 ' + SLICE_GATE_MAX + '회 내 통과 못함(최종 단계에서 재강제)')
  }

  sliceResults.push({ title: slice.title || ('slice-' + (i + 1)), tier: tierKey, escalated, rounds: round, remaining })

  // ---- 레퍼런스(첫) 슬라이스 체크포인트: tracer 로 명시 opt-in 할 때만. ----
  // 주의: acceptCmd 단독으로는 이 체크포인트를 발동하지 않는다. acceptCmd 가
  // "전체 작업이 끝나야 통과하는 최종 상태(end-state) 게이트"인 경우(예: 구조/개수
  // 규칙, 전역 형상 검증), 첫 슬라이스만으로는 통과할 수 없어 무조건 오중단하기
  // 때문이다. accept 는 최종 게이트(Phase 5)에서만 강제한다. 첫 슬라이스에서
  // 방향을 사람이 확인하고 싶으면 tracer:true 를 명시한다(그 슬라이스가 "복제 가능한
  // 골든 수직 슬라이스"일 때 적합 — 수평 준비 슬라이스에는 부적합).
  if (i === 0 && slices.length > 1 && TRACER) {
    let refAccept = null
    if (acceptCmd) {
      refAccept = await agent(
        BASE + '\n\n첫(레퍼런스) 슬라이스가 끝났다. 아래 acceptance 명령을 실행해 이 슬라이스가 원하는 형상/계약인지 객관 검증하고 결과를 정확히 보고하라(파일 수정 금지).\n\nacceptance: ' + acceptCmd + '\n\npassed·details·failing을 스키마로 반환.',
        { label: 'accept:ref', phase: 'Review', model: 'sonnet', schema: BUILD_SCHEMA }
      )
      log('레퍼런스 슬라이스 acceptance(' + acceptCmd + '): ' + (refAccept && refAccept.passed ? 'PASS' : 'FAIL'))
    }
    log('트레이서 체크포인트: 레퍼런스 슬라이스 완료 — 방향 확인 후 tracer 없이 resumeFromRunId로 나머지를 이어가라.')
    return {
      tracer: true, checkpoint: 'reference-slice', referenceSlice: sliceResults[0], acceptance: refAccept,
      buildCommand: buildCmd, testCommand: testCmd, acceptCommand: acceptCmd,
      remainingSlices: slices.slice(1).map((s, k) => ({ n: k + 2, title: s.title, plannedTier: tierOf(s.tier).key })),
      message: '첫(레퍼런스) 슬라이스만 완료했다(tracer 모드). 이 슬라이스가 원하는 형상/방향인지 사람이 확인하라. 맞으면 같은 args에서 tracer를 빼고(false) resumeFromRunId를 붙여 재호출하면 레퍼런스는 캐시로 즉시 통과하고 나머지 슬라이스가 이어진다. 틀리면 브리프/acceptCommand/슬라이스 계획을 교정한 뒤 새로 시작하라.',
    }
  }
}

// ---------------------------------------------------------------------------
// Phase 5: Final — 전체 테스트·빌드 통과 보장(모든 tier 공통 바닥선)
// ---------------------------------------------------------------------------
phase('Final')
const finalCmds = '전체 테스트: ' + (testCmd || '(프로젝트에서 직접 찾아라)') + '\n전체 빌드: ' + (buildCmd || '(프로젝트에서 직접 찾아라)') + (acceptCmd ? '\n수락 검증(acceptance, 작업 의도/형상): ' + acceptCmd + ' — 이 명령도 반드시 통과(exit 0)해야 passed=true다.' : '')
let finalReport = null
let finalOk = false
for (let attempt = 0; attempt < 3; attempt++) {
  finalReport = await agent(
    BASE +
    '\n\n구현이 모두 끝났다. 아래 명령으로 전체 테스트와 빌드를 실행하고 결과를 정확히 보고하라(파일은 수정하지 말 것). 이 작업과 무관한, 명백히 다른 영역의 사전 존재 실패가 있으면 그 사실을 details에 분리해 적되 passed 판단에서 제외하라.\n\n' + finalCmds +
    '\n\npassed(이 작업 범위가 모두 통과했는가)·details·failing(실패 항목)을 스키마로 반환.',
    { label: 'final-check:' + attempt, phase: 'Final', model: 'sonnet', schema: BUILD_SCHEMA }
  )
  if (finalReport && finalReport.passed) { finalOk = true; break }
  log('최종 검증 실패(시도 ' + attempt + ') — 수정 시도')
  await agent(
    BASE +
    '\n\n전체 테스트/빌드가 실패했다. 아래 실패를 실제로 고쳐 green으로 만들어라(이 작업 범위에 한함; 무관한 다른 영역 사전 실패는 건드리지 말 것).' + BUILD_HINT +
    '\n\n실패 상세:\n' + JSON.stringify(finalReport) +
    '\n\n무엇을 고쳤는지 보고하라.',
    { label: 'final-fix:' + attempt, phase: 'Final', effort: 'high', model: BUILD_MODEL }
  )
}

// ---------------------------------------------------------------------------
// Phase 6: Integrate — 대상 브랜치와 시험 병합해 "통합 비용"을 가시화(integrateInto 지정 시만)
// ---------------------------------------------------------------------------
// 격리 워크트리의 근본 사각지대: 웨이브는 자기 base 위에서만 게이트를 통과시킨다.
// 그 사이 대상 통합 브랜치에 쌓인 동시 커밋이 이 웨이브가 삭제/이름변경한 공유
// 심볼(엔티티·타입·함수)을 소비하면, 격리 게이트는 전부 green이어도 병합하는
// 순간 컴파일이 깨진다. 웨이브가 아무리 오래 돌아도 격리 상태로는 이 비용을 볼 수
// 없다 — 오직 대상 브랜치와의 실제 병합만이 드러낸다. 이 프로브가 그 병합을 별도
// 스크래치 워크트리에서 미리 수행해, "지금 병합하면 무엇이 깨지는가"를 Final의
// 산출물로 만든다(현재 워킹트리·브랜치는 건드리지 않는다).
let integrationOk = null
let integrationReport = null
if (INTEGRATE_INTO) {
  phase('Integrate')
  integrationReport = await agent(
    BASE +
    '\n\n이 웨이브의 작업은 격리된 브랜치/워킹트리에서 끝났고 자체 게이트는 통과했다. 그러나 대상 통합 브랜치 `' + INTEGRATE_INTO + '`에는 그 사이 다른 작업의 커밋이 쌓여 있을 수 있고, 이 웨이브가 삭제·이름변경한 공유 심볼(엔티티/타입/함수)을 그쪽 새 코드가 소비하면 "병합하는 순간"에만 깨진다. 격리 게이트가 못 보는 그 통합 비용을 지금 가시화하라.' +
    '\n\n**절대 규칙: 현재 워킹트리·브랜치를 변경하지 마라.** 시험 병합은 반드시 별도 스크래치 워크트리에서만 한다.' +
    '\n\n절차:' +
    '\n1. 현재 브랜치명을 확인한다(`git rev-parse --abbrev-ref HEAD`). 미커밋 변경이 있으면 먼저 그 브랜치에 임시 커밋으로 고정한다(그래야 시험 병합이 현재 작업 전체를 반영한다).' +
    '\n2. 워킹트리를 건드리지 않고 충돌만 먼저 탐지한다: `git merge-tree --write-tree --name-only ' + INTEGRATE_INTO + ' <현재브랜치>` (git 2.38+). 충돌 파일 목록을 수집한다.' +
    '\n3. 컴파일/테스트 파괴까지 보려면 스크래치 워크트리에서 실제 시험 병합한다: `git worktree add <임시경로> ' + INTEGRATE_INTO + '` → 그 안에서 `git merge --no-ff --no-commit <현재브랜치>` → 충돌을 (가능한 범위에서) 해소하거나 그대로 두고 아래 명령으로 깨지는 심볼/파일을 열거한다: ' + (buildCmd || '(프로젝트 빌드/타입체크)') + (testCmd ? ' / ' + testCmd : '') + (acceptCmd ? ' / ' + acceptCmd : '') +
    '\n4. 끝나면 스크래치 워크트리를 반드시 제거한다(`git worktree remove --force <임시경로>`). 1에서 임시 커밋을 만들었다면 현재 브랜치는 그대로 둔다(내가 이어받는다).' +
    '\n\n판정: 대상 브랜치와 병합해도 (a) 충돌이 없고 (b) 병합 트리에서 빌드/테스트/accept가 통과하면 passed=true. 충돌이나 컴파일 파괴가 있으면 passed=false로 하고, details에 "충돌 파일 수 + 어떤 삭제/이름변경 심볼을 대상측 어느 파일이 소비해 깨지는지"를, failing에 깨진 항목을 담아라. passed=false는 실패가 아니라 "이 웨이브를 병합하려면 통합-이관 작업이 남았다"는 신호다 — 사람이 그 이관을 하도록 정확히 열거하는 게 목적이다.\n\npassed·details·failing 스키마로 반환.',
    { label: 'integrate-probe', phase: 'Integrate', effort: 'high', model: BUILD_MODEL, schema: BUILD_SCHEMA }
  )
  integrationOk = !!(integrationReport && integrationReport.passed)
  log('통합 프로브(' + INTEGRATE_INTO + '): ' + (integrationOk ? 'PASS — 지금 병합해도 안전' : 'FAIL — 통합 비용 있음(병합 전 이관 필요, details 참고)'))
}

return {
  task: TASK,
  slices: sliceResults,
  tierPlan: slices.map((s, i) => ({ n: i + 1, title: s.title, plannedTier: tierOf(s.tier).key })),
  buildCommand: buildCmd,
  testCommand: testCmd,
  acceptCommand: acceptCmd || undefined,
  finalPassed: finalOk,
  finalReport,
  outstandingIssues: sliceResults.flatMap((r) => r.remaining || []),
  // 격리 게이트(finalPassed)가 green이어도 integrationPassed=false면 "지금 병합하면 깨진다"는 뜻 —
  // integrationIssues가 남은 통합-이관 작업 목록이다. integrateInto 미지정 시 둘 다 null.
  integrationPassed: integrationOk,
  integrationIssues: integrationReport && integrationReport.passed === false ? (integrationReport.failing || [integrationReport.details]).filter(Boolean) : [],
}
