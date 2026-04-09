# Figma Project Configuration
# 이 파일을 프로젝트의 `.claude/figma-project.local.md`로 복사하여 사용하세요.
# .gitignore에 `.claude/figma-project.local.md`를 추가하는 것을 권장합니다.
# 이 파일은 figma2shadcn2next 플러그인의 SessionStart hook이 자동으로 주입합니다.

## Figma File

- **File Key**: `YourFigmaFileKeyHere`
- **Team Library Name**: `Ureca Shadcn` (기본값 — 다른 경우 수정)
- **Default Node**: (선택사항) 자주 작업하는 기본 노드 ID

## Variable Collection Names

다음 컬렉션 이름이 이 프로젝트의 Figma 라이브러리와 다를 경우 수정하세요:

- **Usage collection**: `usage` (기본값)
- **Semantic collection**: `semantic` (기본값)
- **Primitive collection**: `primitive` (기본값)

## Light/Dark Mode Strategy

이 프로젝트에서 Light/Dark 모드를 어떻게 구현하는지 지정하세요:

- **Strategy**: `css-variables` | `tailwind-dark-variant` (하나 선택)
  - `css-variables`: shadcn/ui 기본 방식 — `bg-background` 같은 usage alias 직접 사용
  - `tailwind-dark-variant`: Tailwind `dark:` 접두사 사용 — `bg-neutral-950 dark:bg-neutral-50`

## CSS Variables File

CSS 변수 파일 경로 (css-variables 전략 사용 시):

- **globals.css path**: `src/app/globals.css` (기본값)

## shadcn/ui Configuration

- **components.json path**: `components.json` (기본값)
- **UI components path**: `src/components/ui/`
- **Utils path**: `src/lib/utils.ts`
- **Default style**: `new-york` | `default` (하나 선택)

## Component Output Directory

생성된 컴포넌트 파일의 기본 저장 위치:

- **Output dir**: `src/components/` (기본값)

## Custom Token Overrides

특정 Figma token의 Tailwind 매핑을 프로젝트 규칙에 맞게 재정의할 경우 사용:

```
# 예시:
# border-input → border-gray-200 (프로젝트 커스텀 색상)
# radius-md → rounded-lg (radius scale 재정의)
```

## Notes

이 프로젝트의 Figma → 코드 변환 시 알아야 할 사항:

- (예: 특정 컴포넌트는 shadcn이 아닌 커스텀 구현 사용)
- (예: 특정 토큰은 CSS variable 대신 inline style 사용)
- (예: 팀 라이브러리 업데이트 예정이므로 특정 컴포넌트 구현 보류)
