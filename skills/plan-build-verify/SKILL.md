---
name: plan-build-verify
description: Use when implementing a non-trivial coding task end-to-end with built-in quality gates — plan the work into slices AND rate each slice's difficulty (tier), implement slice by slice, run difficulty-adaptive review (light=1 lens, medium=2 lenses, heavy=4 lenses + Codex) after each slice, auto-escalate a slice to full review when it turns out risky, refactor until zero critical/major issues, then guarantee the full test+build passes. Trigger for requests like "구현 계획부터 검증까지", "슬라이스별로 구현하고 적대적 리뷰", multi-step feature builds, migrations/refactors that need a verify-and-refactor loop, or whenever the user asks to build something with adversarial review + zero-issue refactoring before finishing.
---

# plan-build-verify (adaptive)

비자명한 코딩 작업을 **계획+난이도(tier) 판정 → 슬라이스별 구현 → tier에 맞춘 적응 리뷰(경량~풀) → 이슈 0건까지 리팩토링 → 최종 빌드/테스트 통과 보장**의 파이프라인으로 끝까지 수행하는 워크플로우 스킬이다.

이 스킬은 작업을 직접 손으로 하지 않고, 번들된 워크플로우 스크립트(`workflow.js`)를 **Workflow 도구**로 실행해 다중 에이전트로 오케스트레이션한다.

## 핵심: 적응형(adaptive) 리뷰 규모

모든 슬라이스에 똑같은 대규모 리뷰를 돌리면(선례 복제·시드에도 4관점+Codex 풀 리뷰) 과투자가 된다. 이 스킬은 **슬라이스 난이도(tier)에 맞춰 리뷰 규모를 자동 조절**한다:

| tier | Claude 관점 수 | Codex 적대 리뷰 | 리팩토링 라운드 | 대상 예시 |
|------|-----------|-----------|-----------|----------|
| **light** | 1 (정확성) | ✗ | 1 | 선례 복제, 시드/상수, 응답 DTO 필드 추가, 설정 변경 |
| **medium** | 2 (정확성·아키텍처) | ✗ | 2 | 표준 CRUD, 어댑터/포트 결선, 기존 패턴 신규 서비스 |
| **heavy** | 4 (전체) | ✓ | maxRounds(기본 4) | 도메인 불변식 신설/변경, DB 마이그레이션, 트랜잭션/동시성, 인증·인가·PII, 다중 컨텍스트 계약 변경 |

- **판정 주체**: Plan 단계가 슬라이스 분해와 **같은 호출**에서 각 슬라이스의 tier까지 매긴다(추가 비용 0). 애매하면 보수적으로 한 단계 높게 잡는다.
- **바닥선**: 모든 tier가 최소 1관점 리뷰 + 최종 전체 빌드/테스트 게이트를 통과한다(light라도 무검증은 없다).
- **사후 에스컬레이션(오판 안전장치)**: light/medium으로 판정됐어도 (a) 구현 후 `git diff`가 위험 신호(마이그레이션 파일·도메인 불변식/트랜잭션/인가 변경·변경 파일 다수)거나 (b) 첫 리뷰가 critical/major를 뱉으면, **그 슬라이스만 heavy로 자동 승격**해 남은 라운드를 풀 리뷰한다. tier를 낮게 잡아도 실제 위험하면 엔진이 스스로 리뷰를 키운다.

## 언제 쓰나

- 사용자가 "계획부터 검증까지", "슬라이스/업무 단위로 구현하고 적대적 리뷰", "0건까지 리팩토링", "최종 빌드/테스트 통과 보장"을 요청할 때
- 여러 파일·여러 단계에 걸친 기능 구현, 마이그레이션, 광범위 리팩토링처럼 품질 게이트가 필요한 작업
- 단순 1~2줄 수정·대화형 질문에는 쓰지 않는다(과하다)

## 전제

- 대상이 git 저장소여야 한다(리뷰가 `git diff`를 사용한다).
- Codex 적대적 리뷰 레인을 쓰려면 `codex` CLI(또는 공유 런타임)가 사용 가능해야 한다. 없으면 Claude 관점만으로도 동작한다.
- 멀티 에이전트를 실행하므로 토큰을 많이 쓴다 — 사용자가 이 스킬/워크플로우를 명시적으로 요청했을 때만 실행한다.

## 실행 절차

1. **작업 파악.** 사용자 요청에서 다음을 모은다(부족하면 코드베이스를 빠르게 살펴 채우고, 정말 모호한 핵심만 한 번 되묻는다):
   - `task`: 무엇을 만들/고칠지 자기완결 설명(외부 계약·수락 기준 포함).
   - `repo`: 저장소 절대경로(기본: 현재 작업 디렉터리).
   - `build` / `test`: 전체 빌드·테스트 명령. 모르면 비워 둔다(Plan 단계가 빌드 설정을 보고 직접 찾는다).
   - `protect`: 다른 에이전트/작업이 동시에 건드리는 등 **절대 수정하면 안 되는** 경로 목록(있으면).
   - `context`: 외부 계약·정확한 시그니처 등 모든 에이전트에 공통 주입할 참고자료(있으면). 프론트 계약·API 스키마처럼 정확히 맞춰야 하는 게 있으면 여기에 충분히 담는다.
   - `slices`: 이미 분해가 끝났다면 슬라이스 배열(없으면 Plan 단계가 분해·tier 판정). 각 항목에 `tier`(`light`/`medium`/`heavy`)를 넣으면 그 값을 쓴다.
   - `lenses`: 커스텀 리뷰 관점(없으면 정확성·아키텍처·보안·테스트 4관점 기본). tier가 앞에서부터 필요한 개수만 쓴다(1관점은 항상 정확성).
   - `tier`: **전체 강제 tier**(`light`/`medium`/`heavy`). 지정하면 슬라이스별 판정·에스컬레이션을 무시하고 전 슬라이스에 이 tier를 적용한다(예: 단순 작업임을 확신할 때 `light`로 고정, 또는 무조건 풀 리뷰가 필요할 때 `heavy`).
   - `maxRounds`: **heavy tier의 리팩토링 라운드 상한**(기본 4). light=1·medium=2는 tier가 고정.
   - `escalateFiles`: 사후 에스컬레이션 변경파일 임계(기본 8). 이보다 많은 파일을 건드리면 heavy로 승격.
   - `accept` (또는 `acceptCommand`): **작업 "의도"를 객관 검증하는 실행 명령**(exit 0 = 통과). **아키텍처·언어·스택 무관** — 당신 프로젝트가 정의하는 어떤 검증이든 된다(구조/계층 규칙, 공개 API·응답 계약, 스키마/마이그레이션 정합, 성능·번들 예산, 접근성, 문서/네이밍 규약, 개수·경계 조건 등). 테스트만으로 못 잡는 "형상·계약"을 exit code로 판정한다. 지정하면 **최종 게이트에서 테스트·빌드와 함께 반드시 통과**해야 finalPassed=true다. **중요**: `accept`는 **최종(end-state) 게이트 전용**이다 — 첫 슬라이스 직후엔 실행하지 않는다. 전역 형상/개수 규칙 같은 최종 상태 체커는 초기 슬라이스만으로는 통과할 수 없어(오중단) 최종에만 강제한다. 첫 슬라이스에서 방향을 조기 확인하려면 `tracer`를 함께 켠다. 없으면 Plan이 "이 작업에 객관 acceptance가 필요한가"를 판단해 제안한다.
   - `integrateInto` (또는 `targetBranch`): 이 웨이브가 **나중에 병합될 대상 통합 브랜치**명. 지정하면 Final 뒤 **통합 프로브**가 대상 브랜치와의 시험 병합을 스크래치 워크트리에서 수행해, **격리 워크트리가 못 보는 통합 비용**(충돌 + 이 웨이브가 삭제·이름변경한 공유 심볼을 대상측 동시 커밋이 소비해 생기는 컴파일 파괴)을 `integrationPassed`/`integrationIssues`로 드러낸다. 여러 브랜치가 병렬로 도는 상황(웨이브가 격리 base 위에서만 돌아 대상 브랜치의 최신 변경을 못 보는 상황)에서 특히 켠다. **격리 게이트(finalPassed)가 green이어도 integrationPassed=false면 "지금 병합하면 깨진다"는 뜻** — 병합 전 이관 작업이 남았다는 신호다.
   - `tracer` (또는 `tracerFirst`): `true`면 **첫(레퍼런스) 슬라이스만 만들고 멈춘다**(있으면 그 시점에 `accept`도 한 번 돌려 결과를 함께 보고). 그 슬라이스가 원하는 형상/방향인지 사람이 확인한 뒤, `tracer`를 빼고 `resumeFromRunId`로 재호출하면 레퍼런스는 캐시로 즉시 통과하고 나머지가 이어진다. **"잘못된 방향으로 몇 시간" 대신 레퍼런스 1개로 조기에 방향을 확정**하는 안전장치. **첫 슬라이스가 "복제 가능한 골든 수직 슬라이스"일 때 적합**하다(수평 준비/정리 슬라이스가 첫 슬라이스면 부적합 — 그건 방향을 증명하지 못한다). 반복 패턴(팬아웃)·새 구조 목표일 때 특히 권장.

2. **이미 일부 구현돼 있으면** 그 사실과 남은 범위를 `task`/`context`에 적어 워크플로우가 이어받게 한다(같은 워킹트리에서 동작하므로 미커밋 변경도 본다).

3. **웨이브에 실제 업무 이름을 붙여 실행.** 워크플로우 이름은 `plan-build-verify`가 아니라 **그 웨이브가 실제로 하는 업무**여야 한다 — `/workflows` 목록·완료 통지·진행보고에서 그 이름으로 식별된다. `workflow.js`를 직접 `scriptPath`로 쓰면 전부 `plan-build-verify`로만 보이므로, 먼저 헬퍼로 이름을 박은 **런 스크립트**를 만든다(동작은 workflow.js와 100% 동일, meta 이름만 치환):

   ```bash
   node <이 스킬 디렉터리>/scripts/make-run.mjs "<업무 타이틀>" "<한 줄 설명>"
   # → 생성된 런 스크립트 경로를 stdout으로 출력. 이 경로를 아래 scriptPath로 쓴다.
   # 여러 웨이브를 병렬로 띄우면 웨이브마다 서로 다른 업무명으로 각각 만든다.
   ```

   그다음 모은 값을 `args`로 넘겨 Workflow 도구를 호출한다:

   ```
   Workflow({
     scriptPath: "<make-run.mjs가 출력한 런 스크립트 경로>",  // workflow.js를 직접 쓰지 말 것(이름이 plan-build-verify로만 보인다)
     args: {
       task: "...",
       repo: "/abs/path",          // 선택
       build: "./gradlew build",   // 선택
       test:  "./gradlew test",    // 선택
       protect: ["path/to/leave/alone/**"], // 선택
       context: "외부 계약/시그니처 ...",   // 선택
       maxRounds: 4,               // 선택(heavy tier 리팩토링 라운드 상한, 기본 4)
       tier: "light",              // 선택(전체 강제 tier; 없으면 Plan이 슬라이스별로 판정)
       accept: "node scripts/verify-structure.mjs", // 선택(의도/형상을 exit 0/1로 검증; Final·레퍼런스 게이트)
       tracer: true               // 선택(첫 슬라이스만 만들고 정지 → 방향 확인 후 tracer 빼고 resume)
     }
   })
   ```

   대개 `tier`는 넘기지 않는다 — Plan이 슬라이스별로 알아서 판정하고 위험한 슬라이스는 자동 승격하는 게 이 스킬의 핵심이다. 작업 전체가 확실히 단순(선례 복제·시드류)임을 알 때만 `tier: "light"`로 고정해 비용을 아끼고, 반대로 무조건 풀 리뷰가 필요하면 `tier: "heavy"`로 고정한다.

   `<이 스킬 디렉터리>`는 이 SKILL.md가 로드될 때 함께 주어지는 base directory다(예: `~/.claude/skills/plan-build-verify`). `make-run.mjs`·`workflow.js`가 그 경로에 있다. resume(`resumeFromRunId`)할 때도 **같은 런 스크립트 경로**를 `scriptPath`로 쓴다(동일 세션 한정이라 런 스크립트가 tmp에 남아 있다).

4. 워크플로우는 백그라운드로 돌고 완료 시 통지된다. `/workflows`로 진행을 볼 수 있다.

5. **완료 후 본 세션에서 마무리한다(중요):** 워크플로우 에이전트는 로컬에서 앱을 띄워 end-to-end로 확인하기 어렵다. 따라서 워크플로우가 끝나면 메인 세션에서:
   - 반환된 `finalPassed`/`outstandingIssues`/`finalReport`를 확인한다. **⚠️ `outstandingIssues`는 각 슬라이스가 자기 리뷰 마지막 라운드에 남긴 `remaining`의 합이라, 뒤 슬라이스가 같은 파일을 다시 고쳐 이미 해결된 이슈도 "미해결"로 남을 수 있다(스테일 스냅샷). 병합 전 반드시 최종 코드에서 실재 여부를 확인하라 — 리포트만 보고 판단하지 말 것**(실측: payment 웨이브가 머니세이프티 major 3건을 outstandingIssues로 보고했으나 최종 코드에선 뒤 슬라이스가 전부 고치고 테스트로 잠근 상태였다). **`integrateInto`를 켰다면 `integrationPassed`/`integrationIssues`가 진짜 "병합 가능" 신호다** — `finalPassed:true`(격리 게이트 통과)라도 `integrationPassed:false`면 아직 병합하면 안 되고, `integrationIssues`가 대상 브랜치로 이관해야 할 목록이다("커널이 다 지어졌다 ≠ 병합 가능하다").
   - 가능하면 **실제로 기동·호출(curl 등)해 라이브로 수락 기준을 직접 검증**한다(워크플로우가 못 하는 부분).
   - 남은 이슈가 있거나 라이브 검증이 실패하면, 같은 스크립트로 `resumeFromRunId`를 써 이어 돌리거나 직접 마저 고친다.
   - 커밋은 사용자가 요청할 때만 한다.

## 백그라운드 웨이브 자동 관제 (웨이브를 백그라운드로 띄웠다면 필수)

워크플로우는 백그라운드로 돌고 완료 시 통지된다(절차 4). **백그라운드로 띄운 웨이브가 하나라도 있으면, 사용자가 따로 시키지 않아도** 아래 관제를 스스로 세팅한다 — 특히 다중 병렬·장기 실행 웨이브에서 필수다. 이건 "물어보면 한다"가 아니라 **기본 동작**이다.

1. **주기 관제 틱 예약(기본 ~30분) — `CronCreate`를 쓴다.** 웨이브를 띄운 직후 `CronCreate({cron:'13,43 * * * *', prompt:'[관제 틱] …아래 점검 절차 + 웨이브별 워크트리·저널경로·run ID를 자기완결로…'})`로 반복 틱을 건다. **왜 sleep 백그라운드 잡이 아니라 Cron인가**(실측 교훈): (a) 스케줄러가 자동 반복 → 매 틱 손으로 재무장할 필요가 없어 "한 번 깜빡하면 관제가 조용히 끊기는" 사고가 사라진다(sleep 방식의 진짜 약점은 이 수동 재무장이었다), (b) 프롬프트를 **같은 세션**에 되큐잉해 컨텍스트가 유지되고, 잘못된 pkill 자기종료·프로세스 사멸에도 스케줄이 안 끊긴다. **오프분(`:13/:43` 등, `:00/:30` 회피)** 을 골라 함대 몰림을 막는다. `ScheduleWakeup`은 토픽 전환 시 유실될 수 있어 쓰지 않는다. **정직한 한계**: 이 Cron은 session-only(디스크 영속 아님)라 세션이 죽으면 함께 사라지고 **7일 후 자동 만료** — 새 세션을 열면 관제 크론을 다시 걸어야 한다. prompt는 컨텍스트가 요약돼도 동작하도록 자기완결로 쓴다. 매 틱마다:
   - **리크 청소(장기 다중웨이브 필수)**: 헬퍼 프로세스가 누적돼 load·swap을 잠식한다(실측: chrome-devtools-mcp watchdog 202개가 "swap 97% 병목"의 진범이었고, codex omo도 수백 개 누적). codex omo(`sisyphuslabs/omo/[0-9]`)와 watchdog(`telemetry/watchdog/main.js`)를 각각 `ps aux | grep '패턴' | grep -v grep | awk '{print $2}' | xargs -r kill -9`로 정리한다 — **`pkill -f '패턴'`은 자기 명령줄이 패턴을 포함해 부모 sh까지 죽여 자폭(exit 144)하니 금지**. 30분 청소로 충분(저빈도 leak).
   - **상세 진행보고**: 각 웨이브의 워크트리 `git diff --stat` + 워크플로우 transcript `journal.jsonl`(최근 리뷰 findings·started/result 이벤트)로 실제 진행 단계를 수집해, 사람이 읽을 보고를 쓴다.
   - **stuck/bottleneck 점검**: 같은 슬라이스에서 라운드 소진, 같은 에러 반복, 오래 진전 없는 에이전트, 리뷰 레인 반복 타임아웃 등을 찾아 명시한다. **단발 지연은 stuck이 아니다** — 반복·정체만 flag한다. **stuck 판정은 저널 정지가 아니라 최근 `agent-*.jsonl` 갱신시각으로 한다**: 저널은 슬라이스/라운드 경계에서만 기록돼, 긴 build/review/plan 에이전트 안에서는 30분+ 저널 정지가 정상이다(에이전트 로그가 몇 분 내 갱신 중이면 살아있는 것).
   - **리소스 기반 병렬 확장**: CPU load·메모리(vm_stat)·swap을 함께 재고, **여유가 있고 지금 도는 웨이브와 파일이 겹치지 않는** 백로그가 있으면 병렬 웨이브를 추가한다. 자원이 남아도 **충돌 경계**(겹치는 도메인)가 상한이면 그 웨이브 병합 후로 미룬다.
   - **태스크 관리 도구 갱신**: 이 프로젝트가 태스크 관리에 쓰는 도구(이슈 트래커 등)가 있으면 거기에 진행 상황을 반영한다(없으면 채팅 보고만).
2. **완료 통지 시 마무리(절차 5)를 자동 수행**: `finalPassed`/`integrationPassed`/`outstandingIssues` 확인 → 최종 코드에서 실재 이슈 검증(스테일 스냅샷 주의) → 병합 결과 트리에서 게이트(`accept`/전체 테스트·빌드) 재확인 → 통합 브랜치 병합 → 태스크 관리 도구에 완료 반영(커밋 해시 포함) → 워크트리 정리.
3. **모든 웨이브·페이즈가 끝나면 `CronDelete`로 관제 크론을 삭제**한다 — 더는 틱을 돌리지 않는다. 끝나지 않았는데 스스로 멈추지 않는다.

**트리거(관측 조건)**: "백그라운드로 실행 중인 웨이브가 하나라도 있다" → 이 관제 크론을 건다. 모든 웨이브가 첫 tick 전에 끝나면 1번은 건너뛰고 2·3번만 한다. 주기(기본 30분)·보고 항목은 사용자가 다르게 요청하면 그 값을 따른다.

## 워크플로우가 하는 일(`workflow.js`)

- **Plan**: 저장소를 탐색해 작업을 응집된 슬라이스(보통 2~6개)로 분해하고, **각 슬라이스의 tier(light/medium/heavy)를 판정**하며 빌드/테스트 명령을 확정한다.
- **Build**: 슬라이스를 의존 순서대로 **순차** 구현한다(뒤 슬라이스가 앞에 의존할 수 있으므로 병렬 아님).
- **사전 에스컬레이션 체크**: light/medium 슬라이스는 구현 직후 `git diff` 위험 신호(마이그레이션·불변식/트랜잭션/인가 변경·변경 파일 수)를 집계해, 위험하면 그 슬라이스를 heavy로 올린다.
- **Review(적응·병렬)**: 슬라이스의 tier에 맞춰 Claude 관점 리뷰어(1~4개)를 병렬 실행하고, heavy면 Codex(`codex:codex-rescue`)도 함께 돌린다. 관점이 2개 이상이거나 Codex가 있으면 한 에이전트가 결과를 중복제거·심각도 분류로 통합한다(light 단일 관점은 통합 단계도 생략해 비용을 더 줄인다).
- **Refactor**: 통합된 critical/major 이슈가 0건이 될 때까지(그 tier의 라운드 상한까지) 수정→재리뷰 루프를 돈다. **첫 리뷰에서 critical/major가 나오면 그 슬라이스를 heavy로 사후 승격**해 남은 라운드를 풀 리뷰한다.
- **Final(공통 바닥선)**: tier와 무관하게 전체 테스트·빌드를 실행해 통과를 보장한다(실패하면 수정 재시도, 무관한 사전 실패는 분리 보고).
- **Integrate(통합 프로브, `integrateInto` 지정 시만)**: 대상 통합 브랜치와 **시험 병합을 별도 스크래치 워크트리에서** 수행해(현재 워킹트리는 불변), 병합 충돌 + 병합 트리에서의 빌드/테스트 파괴를 집계한다. **격리 워크트리의 근본 사각지대를 닫는 단계** — 웨이브는 자기 base 위에서만 게이트를 통과시키므로, 그 사이 대상 브랜치에 쌓인 동시 커밋이 이 웨이브가 지운/이름바꾼 공유 심볼을 소비하면 격리 게이트는 전부 green이어도 병합 순간 깨진다. 웨이브가 아무리 오래 돌아도 격리 상태로는 이 비용을 못 본다. `integrationPassed=false`는 실패가 아니라 "병합 전 통합-이관이 남았다"는 가시화다.

- **방향 가드레일(범용)**: `accept`가 있으면 Final 게이트가 테스트·빌드에 더해 **acceptance 명령까지 통과**해야 finalPassed=true다(최종 상태 전용 — 초기 슬라이스에서 돌리지 않는다). `tracer:true`면 레퍼런스 슬라이스만 만들고 **`tracer:true` 체크포인트를 반환**하며 멈춘다(있으면 그 시점에 accept도 한 번 돌려 참고 보고) — 사람이 방향을 확인한 뒤 `tracer` 없이 `resumeFromRunId`로 이어간다. **원칙**: 전역 형상/개수처럼 "끝나야 통과하는" 검증은 `accept`(최종 게이트)로, "첫 골든 수직 슬라이스로 방향을 조기 확정"은 `tracer`로 — 둘을 혼동하지 말 것.

반환값: `{ task, slices[](각 항목에 tier·escalated·rounds·remaining), tierPlan[], buildCommand, testCommand, acceptCommand, finalPassed, finalReport, outstandingIssues, integrationPassed, integrationIssues }`(`integrationPassed`/`integrationIssues`는 `integrateInto` 지정 시에만 채워지고 아니면 null/빈배열). tracer 조기 중단 시엔 `{ tracer:true, checkpoint, referenceSlice, acceptance, remainingSlices, message }`.

## 주의

- 슬라이스 구현·리팩토링은 같은 워킹트리를 **순차**로 쓴다(동시에 같은 파일을 쓰지 않게). 리뷰만 병렬이다.
- 다른 에이전트가 같은 트리를 동시에 작업 중이면 반드시 `protect`로 그 경로를 보호한다.
- 프로젝트 고유 규약(예: 한글 KDoc 가드, 패키지 구조 가드, 마이그레이션 네이밍)은 `context`에 적어 두면 각 에이전트가 지킨다.
- 무관한 사전 실패(다른 작업 영역)는 `protect`/`context`로 명시해 "통과 보장" 판정에서 제외시킨다.
