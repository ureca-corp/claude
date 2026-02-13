# 문제 해결 가이드

URECA Claude Plugins 사용 중 발생할 수 있는 일반적인 문제와 해결 방법을 안내합니다.

## 📋 목차

- [설치 문제](#설치-문제)
- [플러그인 로딩 문제](#플러그인-로딩-문제)
- [명령어 실행 문제](#명령어-실행-문제)
- [성능 문제](#성능-문제)
- [개발 관련 문제](#개발-관련-문제)
- [GitHub Actions 문제](#github-actions-문제)

---

## 설치 문제

### 마켓플레이스 추가 실패

**증상**:
```
Error: Failed to add marketplace 'https://github.com/ureca-corp/claude'
```

**원인**:
1. Git이 설치되지 않음
2. GitHub 저장소 접근 불가
3. 네트워크 문제

**해결**:

1. Git 설치 확인:
   ```bash
   git --version
   ```

2. 저장소 접근 테스트:
   ```bash
   git ls-remote https://github.com/ureca-corp/claude.git
   ```

3. 프록시 설정 (필요시):
   ```bash
   git config --global http.proxy http://proxy.example.com:8080
   git config --global https.proxy https://proxy.example.com:8080
   ```

4. SSH 대신 HTTPS 사용:
   ```bash
   git config --global url."https://".insteadOf git://
   ```

### 플러그인 설치 실패

**증상**:
```
Error: Plugin 'domain-book-builder' not found in marketplace 'ureca-plugins'
```

**원인**:
1. 마켓플레이스가 제대로 추가되지 않음
2. 플러그인 이름 오타
3. 마켓플레이스 캐시가 오래됨

**해결**:

1. 마켓플레이스 목록 확인:
   ```bash
   /plugin marketplace list
   ```

2. 마켓플레이스 새로고침:
   ```bash
   /plugin marketplace remove ureca-plugins
   /plugin marketplace add https://github.com/ureca-corp/claude
   ```

3. 플러그인 이름 정확히 확인:
   ```bash
   /plugin search domain
   ```

### 권한 오류

**증상**:
```
Error: Permission denied when writing to ~/.claude/plugins/cache/
```

**원인**:
- 캐시 디렉토리 권한 부족

**해결**:

```bash
# macOS / Linux
chmod -R u+rw ~/.claude/plugins/cache/

# 또는 소유권 변경
sudo chown -R $USER:$USER ~/.claude/
```

---

## 플러그인 로딩 문제

### 플러그인이 로드되지 않음

**증상**:
- `/plugin list`에 플러그인이 표시되지만 스킬/명령어가 작동 안 함

**원인**:
1. 플러그인 구조 오류
2. plugin.json 문법 오류
3. 필수 파일 누락

**해결**:

1. 플러그인 구조 검증:
   ```bash
   claude plugin validate plugins/domain-book-builder
   ```

2. plugin.json 문법 확인:
   ```bash
   jq empty plugins/domain-book-builder/.claude-plugin/plugin.json
   ```

3. 필수 파일 확인:
   ```bash
   ls -la plugins/domain-book-builder/.claude-plugin/plugin.json
   ls -la plugins/domain-book-builder/README.md
   ```

### 스킬이 트리거되지 않음

**증상**:
- 플러그인은 설치되었지만 관련 질문에 스킬이 활성화되지 않음

**원인**:
1. SKILL.md의 `description`이 불명확
2. Trigger phrase가 약함
3. 스킬 frontmatter 오류

**해결**:

1. SKILL.md frontmatter 확인:
   ```markdown
   ---
   name: skill-name
   description: Use this skill when the user wants to [specific trigger]
   ---
   ```

2. Description 강화:
   ```markdown
   # 약한 예
   description: Helps with domain modeling

   # 강한 예
   description: >
     Use this skill when the user wants to create domain-driven design documents,
     model business domains, or generate domain books.
   ```

3. Claude Code 재시작:
   ```bash
   exit
   claude
   ```

### 에이전트가 실행되지 않음

**증상**:
- 에이전트가 명시적 조건에도 트리거되지 않음

**원인**:
1. `whenToUse` 조건이 불명확
2. `examples`가 부족하거나 모호
3. Agent frontmatter 오류

**해결**:

1. Agent frontmatter 확인:
   ```markdown
   ---
   identifier: agent-name
   whenToUse: Very specific condition here
   examples:
     - context: "Concrete scenario"
       user: "User input example"
       assistant: "Agent invocation example"
       commentary: "Why this triggers the agent"
   ---
   ```

2. Examples 추가 (최소 2-3개):
   ```yaml
   examples:
     - context: "User asks to validate plugin"
       user: "Check if my plugin is valid"
       assistant: "I'll use the plugin-validator agent"
       commentary: "Plugin validation is agent's specialty"
   ```

---

## 명령어 실행 문제

### 명령어를 찾을 수 없음

**증상**:
```
Error: Command '/domain-book-builder:start' not found
```

**원인**:
1. 플러그인이 제대로 설치되지 않음
2. 명령어 이름 오타
3. 명령어 디렉토리 구조 오류

**해결**:

1. 설치 확인:
   ```bash
   /plugin list
   ```

2. 명령어 목록 확인:
   ```bash
   /help
   ```

3. 명령어 구조 확인:
   ```bash
   # 올바른 구조
   plugins/your-plugin/commands/start/SKILL.md
   ```

4. 플러그인 재설치:
   ```bash
   /plugin uninstall domain-book-builder
   /plugin install domain-book-builder@ureca-plugins
   ```

### 명령어 실행 중 오류

**증상**:
```
Error during command execution: [error message]
```

**원인**:
1. SKILL.md의 `allowed-tools`에 필요한 도구 누락
2. 명령어 로직 오류

**해결**:

1. allowed-tools 확인:
   ```markdown
   ---
   allowed-tools:
     - Read
     - Write
     - Bash
     - Grep
   ---
   ```

2. 필요한 모든 도구 추가

3. Debug 모드로 실행:
   ```bash
   claude --debug
   /your-plugin:command
   ```

---

## 성능 문제

### Claude Code 느림

**증상**:
- 플러그인 로딩이 느림
- 명령어 실행이 오래 걸림

**원인**:
1. 너무 많은 플러그인 설치
2. 큰 템플릿 파일
3. 비효율적인 스킬 구조

**해결**:

1. 불필요한 플러그인 제거:
   ```bash
   /plugin list
   /plugin uninstall unused-plugin
   ```

2. 템플릿 파일 최적화:
   - 큰 파일은 여러 개로 분할
   - Progressive disclosure 원칙 적용

3. 스킬 lean body 유지:
   - 1,500-2,000 단어 이내
   - 상세 내용은 `references/`로 분리

### 메모리 부족

**증상**:
```
Error: Out of memory
```

**원인**:
- 너무 많은 에이전트 동시 실행
- 큰 파일 처리

**해결**:

1. 에이전트 모델 변경:
   ```yaml
   # opus 대신 sonnet 사용
   model: sonnet
   ```

2. 배치 처리:
   - 큰 작업을 작은 단위로 분할
   - 점진적 업데이트 패턴 사용

---

## 개발 관련 문제

### 로컬 테스트 실패

**증상**:
```bash
claude --plugin-dir ./plugins/your-plugin
# Error: Plugin validation failed
```

**원인**:
1. plugin.json 필수 필드 누락
2. 디렉토리 구조 오류
3. Frontmatter 문법 오류

**해결**:

1. 필수 필드 확인:
   ```json
   {
     "name": "required",
     "description": "required",
     "version": "required",
     "author": { "name": "required" }
   }
   ```

2. 구조 검증:
   ```bash
   tree plugins/your-plugin
   ```

3. Frontmatter 문법:
   ```markdown
   ---
   name: value
   description: >
     Multi-line value
   ---
   ```

### JSON 문법 오류

**증상**:
```
Error: Invalid JSON in plugin.json
```

**원인**:
- 후행 쉼표
- 따옴표 누락
- 주석 포함

**해결**:

1. JSON 검증:
   ```bash
   jq empty plugin.json
   ```

2. 일반적인 실수:
   ```json
   // ❌ 나쁜 예
   {
     "name": "plugin",
     "version": "1.0.0",  // 후행 쉼표
   }

   // ✅ 좋은 예
   {
     "name": "plugin",
     "version": "1.0.0"
   }
   ```

### Git 충돌

**증상**:
```
CONFLICT (content): Merge conflict in .claude-plugin/marketplace.json
```

**원인**:
- 동시에 여러 플러그인 추가
- marketplace.json 동시 수정

**해결**:

1. Upstream 최신 상태로 업데이트:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. 충돌 해결:
   ```bash
   # marketplace.json 수동 병합
   vim .claude-plugin/marketplace.json

   # 병합 완료
   git add .claude-plugin/marketplace.json
   git rebase --continue
   ```

---

## GitHub Actions 문제

### CI 검증 실패

**증상**:
```
❌ Validation failed: Missing 'name' field in plugin.json
```

**원인**:
1. plugin.json 필수 필드 누락
2. JSON 문법 오류
3. Frontmatter 오류

**해결**:

1. 로컬에서 먼저 검증:
   ```bash
   claude plugin validate plugins/your-plugin
   ```

2. CI 로그 확인:
   - GitHub Actions 탭에서 실패 로그 확인
   - 정확한 오류 메시지 파악

3. 수정 후 재푸시:
   ```bash
   git add .
   git commit --amend
   git push -f origin your-branch
   ```

### 링크 체크 실패

**증상**:
```
❌ Broken internal links found: README.md -> ./missing-file.md
```

**원인**:
- 존재하지 않는 파일 링크
- 상대 경로 오류

**해결**:

1. 링크 확인:
   ```bash
   grep -r "\[.*\](\./" plugins/your-plugin/
   ```

2. 파일 존재 확인:
   ```bash
   ls plugins/your-plugin/missing-file.md
   ```

3. 링크 수정 또는 파일 생성

### 릴리스 실패

**증상**:
```
Error: No CHANGELOG entry found for version 1.0.0
```

**원인**:
- CHANGELOG.md에 버전 항목 누락

**해결**:

1. CHANGELOG.md에 버전 추가:
   ```markdown
   ## [1.0.0] - 2026-02-13

   ### Added
   - Initial release
   ```

2. 태그 재생성:
   ```bash
   git tag -d v1.0.0
   git push origin :refs/tags/v1.0.0
   git tag v1.0.0
   git push origin v1.0.0
   ```

---

## 고급 문제 해결

### 디버그 모드

자세한 로그 출력:

```bash
claude --debug
```

### 캐시 초기화

플러그인 캐시 완전 삭제:

```bash
# macOS / Linux
rm -rf ~/.claude/plugins/cache/

# Windows
rmdir /s %USERPROFILE%\.claude\plugins\cache\
```

### 플러그인 로그 확인

```bash
# macOS / Linux
tail -f ~/.claude/logs/plugins.log

# Windows
Get-Content $env:USERPROFILE\.claude\logs\plugins.log -Wait
```

---

## 여전히 문제가 해결되지 않나요?

### 1. 이슈 제보

[GitHub Issues](https://github.com/ureca-corp/claude/issues)에서 이슈 생성:

**템플릿**:
```markdown
**문제 설명**
[명확한 설명]

**재현 방법**
1. [단계 1]
2. [단계 2]
3. [단계 3]

**예상 동작**
[무엇을 기대했는지]

**실제 동작**
[실제로 무슨 일이 일어났는지]

**환경**
- OS: [macOS / Linux / Windows]
- Claude Code 버전: [버전]
- 플러그인 버전: [버전]

**추가 정보**
[스크린샷, 로그 등]
```

### 2. 토론 참여

[GitHub Discussions](https://github.com/ureca-corp/claude/discussions)에서 질문:
- 사용법 질문
- 기능 제안
- 커뮤니티 도움

### 3. 문서 확인

- [설치 가이드](./installation.md)
- [플러그인 개발](./plugin-development.md)
- [기여 가이드](../CONTRIBUTING.md)
- [공식 문서](https://code.claude.com/docs/en/plugins)

---

## 빠른 참조

### 자주 사용하는 명령어

```bash
# 마켓플레이스 관리
/plugin marketplace add <url>
/plugin marketplace list
/plugin marketplace remove <name>

# 플러그인 관리
/plugin install <name>@<marketplace>
/plugin list
/plugin uninstall <name>
/plugin update <name>

# 검증
claude plugin validate .
claude plugin validate plugins/<name>

# 테스트
claude --plugin-dir .
claude --plugin-dir ./plugins/<name>
claude --debug
```

### 체크리스트

설치 문제 해결:
- [ ] Git 설치 확인
- [ ] 네트워크 연결 확인
- [ ] 저장소 접근 권한 확인
- [ ] 캐시 디렉토리 권한 확인

플러그인 개발 문제 해결:
- [ ] plugin.json 검증
- [ ] 디렉토리 구조 확인
- [ ] Frontmatter 문법 확인
- [ ] 로컬 테스트 수행
- [ ] CI 검증 통과
