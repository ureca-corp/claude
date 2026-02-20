# Flutter DDD Builder

> Domain Book 기반 Flutter DDD 아키텍처 코드 자동 생성 플러그인

## 📖 Overview

`flutter-ddd-builder`는 [domain-book-builder](https://github.com/your-org/domain-book-builder)가 생성한 도메인 문서를 실제 Flutter DDD 코드로 변환하는 플러그인입니다. 에이전트 팀 기반 병렬 처리로 빠르게 구현하고, 실시간 품질 검증으로 안정성을 보장합니다.

## ✨ Features

- **🔄 도메인 → 코드 자동 변환**: Domain Book을 읽고 Freezed 모델, Riverpod 서비스, API 클라이언트 자동 생성
- **🎨 화면 기획 자동 생성**: PRD 기반 ASCII art 화면 기획 후 UI 코드 생성
- **👥 팀 기반 병렬 처리**: Git worktree + 에이전트 팀으로 여러 도메인/화면 동시 구현
- **✅ 실시간 품질 검증**: 파일 작성 후 즉시 `flutter analyze`, 통합 전 `flutter build` 검증
- **🔗 기존 인프라 활용**: `swagger_parser` + Freezed 3.x + Riverpod 3.x

## 🚀 Installation

### Claude Code 플러그인으로 설치

```bash
# 플러그인 디렉토리에 클론 (이미 설치됨)
cd ~/.claude/plugins/
git clone https://github.com/your-org/flutter-ddd-builder.git
```

### 프로젝트에서 활성화

```bash
# 플러그인이 자동으로 로드됩니다
cc  # Claude Code 실행
```

## 📋 Prerequisites

### 필수 사항

1. **Flutter SDK** (^3.11.0-296.4.beta 이상)
2. **Domain Book 문서**: `ai-context/domain-book/` 디렉토리에 도메인별 문서
   ```
   ai-context/domain-book/
   ├── auth/
   │   ├── README.md
   │   ├── features.md
   │   ├── business-rules.md
   │   ├── domain-model.md
   │   └── api-spec.md
   └── post/
       └── ...
   ```
3. **PRD 문서**: `ai-context/PRD.md` (UI 생성 시 필요)
4. **Git 저장소**: 프로젝트가 git으로 관리되어야 함

### 선택 사항

- `swagger_parser.yaml` 설정 (OpenAPI 기반 API 클라이언트 생성 시)
- `specs/openapi.json` (API 스펙이 있는 경우)

## 🎯 Usage

### `/logic` - 비즈니스 로직 레이어 생성

Domain Book을 읽고 도메인 레이어를 자동 생성합니다.

```bash
# 기본 경로 사용 (ai-context/domain-book/)
/logic

# 커스텀 경로 지정
/logic --domain-book-path custom-path/domains/
```

**생성되는 코드:**
- `lib/apps/domain/{domain}/models/*.dart` - Freezed 3.x 모델
- `lib/apps/domain/{domain}/services/*.dart` - Riverpod 3.x AsyncNotifier 서비스
- `lib/apps/ui/router/domains/{domain}.dart` - GoRouter 라우트 정의
- `lib/apps/infra/http/generated/` - API 클라이언트 (swagger_parser 사용 시)

**워크플로우:**
1. Domain Book 읽기 (도메인 개수 파악)
2. 에이전트 팀 생성 + Git worktree 분리
3. `swagger_parser` + `build_runner` 실행 (팀 리더)
4. 도메인별 teammate가 병렬로 구현
5. 파일 작성 시마다 `flutter analyze` 자동 실행 (PostToolUse Hook)
6. 통합 전 `flutter build appbundle` + `flutter build ios` 검증
7. Main 브랜치로 merge + worktree 정리

### `/ui` - UI 레이어 생성

PRD와 Domain Book API 명세를 읽고 화면을 자동 생성합니다.

```bash
# 기본 경로 사용 (ai-context/PRD.md)
/ui

# 커스텀 경로 지정
/ui --prd-path custom-path/requirements.md
```

**생성되는 코드:**
- `lib/apps/ui/pages/{depth1}/{depth2}/page.dart` - ConsumerStatefulWidget 페이지
- `lib/apps/ui/pages/{depth1}/{depth2}/components/*.dart` - 페이지 전용 컴포넌트
- `lib/apps/ui/common/components/*.dart` - 전역 공유 컴포넌트
- `lib/apps/ui/router/routes.dart` - GoRouter 라우트 등록

**워크플로우:**
1. PRD + Domain Book API 읽기
2. ASCII art 화면 기획 생성 → 터미널 출력 + `ai-context/screen-plan.md` 저장
3. 사용자 승인 (수정 요청 가능)
4. 에이전트 팀 생성 + Git worktree 분리
5. 화면별 teammate가 병렬로 구현
6. 파일 작성 시마다 `flutter analyze` 자동 실행
7. 통합 전 빌드 검증
8. Main 브랜치로 merge + worktree 정리

## ⚙️ Configuration

`.claude/flutter-ddd-builder.local.md` 파일로 설정을 커스터마이즈할 수 있습니다.

```markdown
# Flutter DDD Builder Settings

## 경로 설정
- domain_book_path: ai-context/domain-book/
- prd_path: ai-context/PRD.md
- screen_plan_path: ai-context/screen-plan.md

## Git 설정
- worktree_enabled: true
- branch_prefix: feature/
- merge_strategy: merge  # merge|squash|rebase

## 코드 생성
- use_swagger_parser: true
- freezed_version: 3.x
- riverpod_version: 3.x

## 품질 검증
- analyze_on_write: true
- analyze_ignore_warnings: false
- build_verification: true
- max_analyze_retries: 3
- analyze_scope: lib+test  # lib|lib+test
```

**설정 파일 생성:**
```bash
mkdir -p .claude
cat > .claude/flutter-ddd-builder.local.md << 'EOF'
# Flutter DDD Builder Settings
(위 내용 복사)
EOF
```

## 🔄 Workflow

### 전체 프로세스

```
1. Domain Book 작성 (domain-book-builder 사용)
   ↓
2. /logic 실행 → 비즈니스 로직 레이어 생성
   ↓
3. PRD 작성
   ↓
4. /ui 실행 → UI 레이어 생성
   ↓
5. 완성! 🎉
```

### 팀 기반 병렬 처리

```
Orchestrator (팀 리더)
  ├─ teammate 1: auth 도메인 구현
  ├─ teammate 2: post 도메인 구현
  └─ teammate 3: chat 도메인 구현

각 teammate는 독립적인 git worktree에서 작업
→ 충돌 없이 병렬 작업
→ Main에서 통합
```

### 품질 검증 흐름

```
파일 작성
  ↓
PostToolUse Hook 트리거
  ↓
flutter analyze 자동 실행
  ↓
오류 있음? → 수정 후 재분석 (최대 3회)
  ↓
오류 없음 → 다음 파일 작성
  ↓
모든 teammate 완료
  ↓
flutter build appbundle
flutter build ios
  ↓
빌드 성공? → Merge
빌드 실패? → 수정 후 재빌드
```

## 🛠️ Troubleshooting

### "Domain Book을 찾을 수 없습니다"

**원인**: `ai-context/domain-book/` 디렉토리가 없거나 비어있음

**해결**:
```bash
# 디렉토리 생성
mkdir -p ai-context/domain-book/auth

# domain-book-builder로 문서 생성
/domain-book-builder:1-clarify
```

### "Analyze 오류가 반복됩니다"

**원인**: 3회 재시도 후에도 오류가 해결되지 않음

**해결**:
1. `flutter pub get` 실행하여 의존성 확인
2. `.claude/flutter-ddd-builder.local.md`에서 `max_analyze_retries: 5`로 증가
3. 수동으로 오류 확인: `flutter analyze`

### "Worktree 병합 충돌"

**원인**: 여러 도메인이 같은 파일 수정

**해결**:
- Orchestrator가 자동으로 충돌 해결 시도
- 실패 시 사용자에게 충돌 파일 표시
- 수동 해결 후 계속 진행

### "빌드 오류 발생"

**원인**: Analyze는 통과했지만 플랫폼 네이티브 코드 오류

**해결**:
1. Orchestrator가 오류 파일 식별
2. 해당 teammate에게 재할당 (아직 활성 상태면)
3. 또는 orchestrator가 직접 수정
4. 재빌드 후 확인

## 📚 Learn More

- [Flutter DDD 아키텍처 가이드](./skills/flutter-ddd-patterns/SKILL.md)
- [Git Worktree 관리 패턴](./skills/git-worktree-management/SKILL.md)
- [팀 협업 패턴](./skills/team-collaboration-patterns/SKILL.md)
- [Domain Book Builder](https://github.com/your-org/domain-book-builder)

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Issues and Pull Requests are welcome!

---

**Made with ❤️ for Flutter DDD developers**
