# plan-build-verify (adaptive) — 설치

difficulty-adaptive 다중 에이전트 구현 워크플로우 스킬이다. 슬라이스별 난이도(tier)를
판정해 리뷰 규모를 자동 조절하고(light=1관점 ~ heavy=4관점+Codex), 위험한 슬라이스는
자동으로 풀 리뷰로 승격하며, 모든 tier가 최종 빌드/테스트 게이트를 통과한다.

## 구성
- `SKILL.md`   — 스킬 정의(트리거·사용법·tier 표·에스컬레이션 규칙)
- `workflow.js` — Workflow 도구로 실행하는 오케스트레이션 스크립트(자기완결, 외부 경로 의존 없음)

## 설치

### 방법 1: npx skills (권장)

[`npx skills`](https://github.com/vercel-labs/skills)로 이 레포에서 바로 설치한다. `claude` 레포는 여러 스킬이 들어갈 모노레포이므로
`--skill` 플래그로 이 스킬만 지정한다:

    # user scope(내 모든 프로젝트, 전역)
    npx skills add ureca-corp/claude --skill plan-build-verify -g

    # 또는 project scope(현재 레포에만)
    npx skills add ureca-corp/claude --skill plan-build-verify

    # 또는 서브디렉토리 전체 URL로 직접 지정
    npx skills add https://github.com/ureca-corp/claude/tree/main/skills/plan-build-verify

### 방법 2: 수동 복사

Claude Code(또는 호환 하네스)의 스킬 디렉터리에 이 폴더째 둔다:

    # user scope(내 모든 프로젝트)
    cp -R plan-build-verify ~/.claude/skills/

    # 또는 project scope(레포 공유)
    cp -R plan-build-verify <repo>/.claude/skills/

설치 후 `plan-build-verify` 스킬로 노출된다. `SKILL.md`의 "실행 절차"대로 Workflow 도구가
`workflow.js`를 `scriptPath`로 실행한다.

## 요구
- 대상이 git 저장소(리뷰가 git diff 사용).
- heavy tier의 Codex 적대 리뷰를 쓰려면 codex CLI(또는 공유 런타임). 없어도 Claude 관점만으로 동작.
