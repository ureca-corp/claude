#!/usr/bin/env bash
# 플러그인 내부 스킬 중 "독립적으로 설치해 쓸 수 있는" 것들을
# 최상위 skills/<plugin>/<skill>/ 카탈로그로 동기화한다.
#
# npx skills(https://github.com/vercel-labs/skills)는 심볼릭 링크를 따라가지 않고
# 실제 파일만 스캔하므로, 여기서는 심볼릭 링크가 아니라 실제 복사를 수행한다.
# plugins/<plugin>/skills/<skill>/ 이 원본(source of truth)이며, 이 스크립트가
# 만드는 skills/<plugin>/<skill>/ 은 파생 산출물이다.
#
# 플러그인 안의 스킬을 추가/수정/삭제했다면 이 스크립트를 다시 실행해
# 카탈로그를 원본과 맞춰야 한다.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

# "plugin/skill" 형식. 아래 목록에 있는 것만 skills/ 카탈로그에 노출된다.
# (도메인 파이프라인의 내부 서브스텝처럼 SESSION.md 등 공유 상태에 의존해
#  단독 설치로는 의미가 없는 스킬은 의도적으로 제외한다 — 해당 플러그인을
#  통째로 설치(/plugin install)해야 한다.)
STANDALONE_SKILLS=(
  "figma2shadcn2next/implement-figma-shadcn-next16"
  "flutter-ddd-builder/flutter-ddd-patterns"
  "flutter-ddd-builder/git-worktree-management"
  "flutter-ddd-builder/team-collaboration-patterns"
  "git-split-pr/git-split-pr"
  "project-docs-setup/project-docs-setup"
  "python-fastapi-programmer/ddd-class-diagram"
  "python-fastapi-programmer/fastapi-architecture"
  "python-fastapi-programmer/fastapi-postgis"
  "python-fastapi-programmer/fastapi-security"
  "python-fastapi-programmer/git-worktree-parallel"
  "python-fastapi-programmer/guard"
)

echo "스킬 카탈로그 동기화 시작..."

for entry in "${STANDALONE_SKILLS[@]}"; do
  plugin="${entry%%/*}"
  skill="${entry#*/}"
  src="plugins/$plugin/skills/$skill"
  dest="skills/$plugin/$skill"

  if [ ! -d "$src" ]; then
    echo "❌ 원본 없음: $src (STANDALONE_SKILLS 목록을 확인하세요)"
    exit 1
  fi

  rm -rf "$dest"
  mkdir -p "$(dirname "$dest")"
  cp -R "$src" "$dest"
  echo "✅ $src → $dest"
done

echo ""
echo "동기화 완료. plan-build-verify는 plugins/ 소속이 아니라 skills/ 최상위가"
echo "원본이므로 이 스크립트가 건드리지 않는다."
