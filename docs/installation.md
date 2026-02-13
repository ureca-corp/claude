# 설치 가이드

URECA Claude Plugins 마켓플레이스 설치 및 설정을 위한 상세 가이드입니다.

## 📋 목차

- [전제 조건](#전제-조건)
- [마켓플레이스 설치](#마켓플레이스-설치)
- [플러그인 설치](#플러그인-설치)
- [설정 확인](#설정-확인)
- [문제 해결](#문제-해결)

---

## 전제 조건

### Claude Code CLI 설치

Claude Code CLI가 설치되어 있어야 합니다.

**macOS / Linux**:
```bash
curl -fsSL https://code.claude.com/install.sh | sh
```

**Windows** (PowerShell):
```powershell
irm https://code.claude.com/install.ps1 | iex
```

### Git 설치 확인

마켓플레이스는 Git 기반으로 배포되므로 Git이 필요합니다:

```bash
git --version
```

Git이 설치되어 있지 않다면 [git-scm.com](https://git-scm.com/)에서 설치하세요.

### Claude Code 인증

Claude Code CLI에 로그인:

```bash
claude auth login
```

---

## 마켓플레이스 설치

### 방법 1: GitHub URL로 설치 (권장)

Claude Code를 실행하고 다음 명령어를 입력:

```bash
/plugin marketplace add https://github.com/ureca-corp/claude
```

**설명**:
- Claude Code가 저장소를 클론하여 로컬 캐시에 저장
- 자동으로 마켓플레이스 메타데이터 읽기
- 모든 플러그인 목록 표시

### 방법 2: 로컬 디렉토리로 설치 (개발자용)

저장소를 직접 클론한 경우:

```bash
# 1. 저장소 클론
git clone https://github.com/ureca-corp/claude.git
cd claude

# 2. Claude Code에서 로컬 경로로 추가
claude
/plugin marketplace add /path/to/claude
```

### 마켓플레이스 확인

설치된 마켓플레이스 목록 확인:

```bash
/plugin marketplace list
```

출력 예시:
```
Installed Marketplaces:
  - ureca-plugins (https://github.com/ureca-corp/claude)
    Description: 도메인 주도 설계 및 AI 기반 개발 도구 모음
    Plugins: 1
```

---

## 플러그인 설치

### domain-book-builder 설치

마켓플레이스에서 플러그인 설치:

```bash
/plugin install domain-book-builder@ureca-plugins
```

**구문 설명**:
- `domain-book-builder`: 플러그인 이름
- `@ureca-plugins`: 마켓플레이스 이름

### 설치 확인

설치된 플러그인 목록:

```bash
/plugin list
```

출력 예시:
```
Installed Plugins:
  - domain-book-builder v1.0.0
    Description: 기술 독립적 Domain Book 생성
    Source: ureca-plugins
    Components: 5 skills, 1 command, 5 agents
```

### 플러그인 업데이트

새 버전이 출시되면 업데이트:

```bash
/plugin update domain-book-builder
```

---

## 설정 확인

### 1. 플러그인 스킬 확인

Claude Code가 플러그인 스킬을 인식하는지 확인:

```bash
# Claude Code 세션에서 질문
"도메인 설계 문서를 만들고 싶어요"
```

Claude가 domain-book-builder 스킬을 자동으로 활용해야 합니다.

### 2. 명령어 확인

명령어 목록에서 플러그인 명령어 확인:

```bash
/help
```

`/domain-book-builder:start`가 표시되어야 합니다.

### 3. 명령어 실행 테스트

```bash
/domain-book-builder:start
```

Phase 1 Clarifier가 시작되어야 합니다.

---

## 고급 설정

### 플러그인 캐시 위치

플러그인은 다음 경로에 캐시됩니다:

**macOS / Linux**:
```
~/.claude/plugins/cache/
```

**Windows**:
```
%USERPROFILE%\.claude\plugins\cache\
```

### 수동 업데이트

마켓플레이스를 수동으로 업데이트하려면:

```bash
# 마켓플레이스 제거
/plugin marketplace remove ureca-plugins

# 다시 추가
/plugin marketplace add https://github.com/ureca-corp/claude
```

### 특정 버전 설치

플러그인의 특정 버전 설치 (향후 지원 예정):

```bash
/plugin install domain-book-builder@1.0.0
```

---

## 문제 해결

### 문제: "Marketplace not found"

**증상**:
```
Error: Marketplace 'ureca-plugins' not found
```

**해결**:
1. 마켓플레이스가 설치되었는지 확인:
   ```bash
   /plugin marketplace list
   ```

2. 설치되지 않았다면 다시 추가:
   ```bash
   /plugin marketplace add https://github.com/ureca-corp/claude
   ```

### 문제: "Plugin installation failed"

**증상**:
```
Error: Failed to install plugin 'domain-book-builder'
```

**해결**:
1. Git이 설치되어 있는지 확인:
   ```bash
   git --version
   ```

2. GitHub 저장소 접근 확인:
   ```bash
   git ls-remote https://github.com/ureca-corp/claude.git
   ```

3. 프록시 설정 확인 (필요시):
   ```bash
   git config --global http.proxy http://proxy.example.com:8080
   ```

### 문제: "Permission denied"

**증상**:
```
Error: Permission denied when accessing plugin cache
```

**해결**:
1. 캐시 디렉토리 권한 확인:
   ```bash
   ls -la ~/.claude/plugins/cache/
   ```

2. 권한 수정:
   ```bash
   chmod -R u+rw ~/.claude/plugins/cache/
   ```

### 문제: "Plugin command not found"

**증상**:
```
Error: Command '/domain-book-builder:start' not found
```

**해결**:
1. 플러그인이 정상 설치되었는지 확인:
   ```bash
   /plugin list
   ```

2. Claude Code 재시작:
   ```bash
   exit
   claude
   ```

3. 플러그인 재설치:
   ```bash
   /plugin uninstall domain-book-builder
   /plugin install domain-book-builder@ureca-plugins
   ```

### 문제: 프라이빗 저장소 인증

**증상**:
```
Error: Authentication required for https://github.com/private-repo/claude.git
```

**해결** (프라이빗 저장소인 경우):

1. GitHub Personal Access Token 생성:
   - GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - `repo` scope 선택
   - 토큰 생성 및 복사

2. 환경 변수 설정:
   ```bash
   # macOS / Linux
   export GITHUB_TOKEN=your_token_here

   # Windows (PowerShell)
   $env:GITHUB_TOKEN="your_token_here"
   ```

3. Claude Code 재시작 후 재시도

---

## 다음 단계

- [플러그인 개발 가이드](./plugin-development.md) - 자신만의 플러그인 만들기
- [문제 해결](./troubleshooting.md) - 일반적인 문제와 해결 방법
- [Domain Book Builder 사용법](../plugins/domain-book-builder/README.md) - 플러그인 상세 가이드

---

## 추가 도움말

- **이슈 제보**: [GitHub Issues](https://github.com/ureca-corp/claude/issues)
- **토론**: [GitHub Discussions](https://github.com/ureca-corp/claude/discussions)
- **공식 문서**: [Claude Code Docs](https://code.claude.com/docs)
