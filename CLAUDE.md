# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

**URECA Claude Plugins**는 도메인 주도 설계 및 AI 기반 개발을 지원하는 Claude Code 플러그인 마켓플레이스입니다.

### 마켓플레이스 구조

```
claude/
├── .claude-plugin/
│   └── marketplace.json     # 마켓플레이스 카탈로그
├── plugins/                 # 플러그인 모음
│   └── domain-book-builder/ # Domain Book Builder 플러그인
│       ├── .claude-plugin/
│       │   └── plugin.json
│       ├── agents/          # 5개 Phase 에이전트 프롬프트
│       ├── skills/          # 각 Phase 실행 스킬
│       └── README.md
├── README.md                # 마켓플레이스 안내
└── CLAUDE.md               # 이 파일
```

## 주요 명령어

### 마켓플레이스 검증

플러그인 구조와 marketplace.json 유효성 검사:

```bash
claude plugin validate .
```

또는 Claude Code 내부에서:

```
/plugin validate .
```

### 로컬 테스트

전체 마켓플레이스 테스트:

```bash
claude --plugin-dir .
```

특정 플러그인만 테스트:

```bash
claude --plugin-dir ./plugins/domain-book-builder
```

### Git 워크플로우

마켓플레이스는 Git 기반으로 배포되므로 표준 Git 워크플로우 사용:

```bash
# 변경사항 확인
git status

# 플러그인 추가/수정 후 커밋
git add .
git commit -m "feat: 새 플러그인 추가"

# 원격 저장소에 푸시
git push origin main
```

## 플러그인 개발 가이드

### 새 플러그인 추가

1. **플러그인 디렉토리 생성**:
   ```bash
   mkdir -p plugins/your-plugin/.claude-plugin
   ```

2. **plugin.json 생성**:
   ```json
   {
     "name": "your-plugin",
     "description": "플러그인 설명",
     "version": "1.0.0",
     "author": {
       "name": "Your Name"
     }
   }
   ```

3. **플러그인 컴포넌트 추가**:
   - `skills/` - 에이전트가 자동으로 사용하는 스킬
   - `commands/` - 사용자가 직접 호출하는 명령어
   - `agents/` - 커스텀 서브에이전트
   - `hooks/` - 이벤트 핸들러

4. **marketplace.json에 등록**:
   `.claude-plugin/marketplace.json`의 `plugins` 배열에 추가

5. **검증 및 테스트**:
   ```bash
   claude plugin validate .
   claude --plugin-dir ./plugins/your-plugin
   ```

### 플러그인 구조 규칙

**중요**: `commands/`, `agents/`, `skills/`, `hooks/` 디렉토리는 플러그인 루트에 위치해야 합니다. `.claude-plugin/` 디렉토리 안에 넣으면 안 됩니다.

```
plugins/your-plugin/
├── .claude-plugin/
│   └── plugin.json          # 여기에만 메타데이터
├── commands/                # ✅ 플러그인 루트
├── skills/                  # ✅ 플러그인 루트
├── agents/                  # ✅ 플러그인 루트
└── hooks/                   # ✅ 플러그인 루트
```

### Skills vs Commands

- **Skills** (`skills/` 디렉토리):
  - 에이전트가 작업 컨텍스트에 따라 자동으로 사용
  - `SKILL.md` 파일 형식
  - frontmatter에 `name`, `description` 필수

- **Commands** (`commands/` 디렉토리):
  - 사용자가 `/plugin-name:command` 형식으로 직접 호출
  - 디렉토리 이름이 명령어 이름
  - `SKILL.md` 파일로 정의

### 버전 관리

Semantic Versioning 사용:
- `1.0.0` - 초기 릴리스
- `1.0.1` - 버그 수정
- `1.1.0` - 새 기능 추가 (하위 호환)
- `2.0.0` - Breaking changes

## 배포

### GitHub 퍼블리시

1. GitHub에 저장소 생성 및 푸시
2. 사용자는 다음과 같이 설치:
   ```
   /plugin marketplace add username/repository-name
   /plugin install plugin-name@marketplace-name
   ```

### 프라이빗 저장소

프라이빗 저장소도 지원됩니다:
- 수동 설치/업데이트: Git credential helper 사용
- 자동 업데이트: 환경 변수 설정 필요 (`GITHUB_TOKEN`, `GH_TOKEN` 등)

## 현재 플러그인

### Domain Book Builder

위치: `plugins/domain-book-builder/`

**개요**: 기술 독립적 도메인 설계 문서 생성

**주요 특징**:
- 5단계 순차 워크플로우 (Phase 1-4: 승인 필요, Phase 5: 자동)
- 점진적 문서 업데이트 (배치 단위 질문-답변-업데이트)
- 도메인 의존성 자동 해결 (Topological Sort)

**출력**:
```
ai-context/domain-books/{domain}/
├── README.md
├── features.md
├── domain-model.md
├── api-spec.md
└── business-rules.md
```

상세 문서: `plugins/domain-book-builder/CLAUDE.md` 참조

## 주의사항

### Plugin.json vs Marketplace.json

- **plugin.json**: 각 플러그인의 메타데이터
- **marketplace.json**: 마켓플레이스 카탈로그 (플러그인 목록)

둘 다 필요하며, marketplace.json의 플러그인 항목은 plugin.json의 내용과 병합됩니다.

### 상대 경로 제약

marketplace.json에서 `"source": "./plugins/plugin-name"` 형식의 상대 경로는:
- ✅ Git 기반 마켓플레이스에서 작동
- ❌ URL 기반 마켓플레이스에서 작동 안 함

URL 배포 시 GitHub/npm/git URL 소스 사용 필요.

### 파일 복사 동작

플러그인 설치 시 파일이 캐시 디렉토리로 복사됩니다:
- 플러그인 디렉토리 외부 파일 참조 (`../shared`) 불가
- 심볼릭 링크는 복사 중 따라감
- 공유 파일은 플러그인 디렉토리 내부에 배치 권장

## 검증 및 디버깅

### 검증 명령어

```bash
# 마켓플레이스 검증
claude plugin validate .

# 특정 플러그인 검증
claude plugin validate plugins/domain-book-builder
```

### 일반적인 오류

| 오류 | 원인 | 해결 방법 |
|------|------|----------|
| `marketplace.json not found` | 파일 누락 | `.claude-plugin/marketplace.json` 생성 |
| `Invalid JSON syntax` | JSON 문법 오류 | 쉼표, 따옴표 확인 |
| `Duplicate plugin name` | 플러그인 이름 중복 | 고유한 이름 사용 |
| `Path traversal not allowed` | `..` 경로 사용 | 상대 경로만 사용 |

## 참고 문서

- [Claude Code Plugins](https://code.claude.com/docs/en/plugins)
- [Plugin Marketplaces](https://code.claude.com/docs/en/plugin-marketplaces)
- [Plugins Reference](https://code.claude.com/docs/en/plugins-reference)
