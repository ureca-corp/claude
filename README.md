# URECA Claude Plugins

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Claude Code](https://img.shields.io/badge/Claude%20Code-Compatible-purple.svg)

**도메인 주도 설계 및 AI 기반 개발 도구 모음**

[설치하기](#-설치-방법) · [플러그인 목록](#-플러그인) · [개발 가이드](#-개발-가이드) · [기여하기](./CONTRIBUTING.md)

</div>

---

## 📖 소개

URECA Claude Plugins는 제품 기획부터 개발까지 전 과정을 지원하는 **Claude Code 플러그인 마켓플레이스**입니다. 도메인 주도 설계(DDD) 철학을 기반으로 고품질 소프트웨어 개발을 돕습니다.

### 🎯 핵심 가치

- **기술 독립성**: 특정 기술 스택에 종속되지 않는 순수 도메인 설계
- **점진적 개선**: 단계별 승인 기반 워크플로우로 품질 보장
- **AI 협업**: Claude와 함께하는 효율적인 문서화 및 설계

---

## 🚀 설치 방법

### 전제 조건

- [Claude Code CLI](https://code.claude.com) 설치 완료
- Git 설치 완료

### 1단계: 마켓플레이스 추가

Claude Code에서 다음 명령어를 실행하세요:

```bash
/plugin marketplace add https://github.com/ureca-corp/claude
```

또는 로컬 개발 환경에서:

```bash
/plugin marketplace add /path/to/claude
```

### 2단계: 플러그인 설치

```bash
/plugin install domain-book-builder@ureca-plugins
```

### 3단계: 설치 확인

```bash
/plugin list
```

설치된 플러그인 목록에 `domain-book-builder`가 표시되면 성공입니다!

---

## 🔌 플러그인

### Domain Book Builder

<table>
<tr>
<td width="60%">

**기술 독립적 Domain Book 생성**

제품 기획 단계에서 기술 스택과 완전히 독립적인 순수 도메인 설계 문서를 생성합니다. 코드를 생성하지 않고, 대신 훌륭한 "기획서"를 작성합니다.

**설치:**
```bash
/plugin install domain-book-builder@ureca-plugins
```

**사용:**
```bash
/domain-book-builder:start
```

</td>
<td width="40%">

**✨ 특징**

✅ 기술 용어 0개
✅ 누구나 읽고 이해 가능
✅ 백엔드/플러터/웹 어디든 적용
✅ 5단계 점진적 워크플로우
✅ 도메인 의존성 자동 해결

**📂 출력**
```
ai-context/domain-books/{domain}/
├── README.md
├── features.md
├── domain-model.md
├── api-spec.md
└── business-rules.md
```

</td>
</tr>
</table>

[📚 상세 문서 보기](./plugins/domain-book-builder/README.md)

---

## 🛠️ 개발 가이드

### 로컬 테스트

플러그인을 개발하거나 수정할 때 `--plugin-dir` 플래그를 사용하여 로컬에서 테스트할 수 있습니다:

```bash
# 전체 마켓플레이스 로드
claude --plugin-dir .

# 특정 플러그인만 로드
claude --plugin-dir ./plugins/domain-book-builder
```

### 플러그인 검증

마켓플레이스 구조와 플러그인 무결성을 검증:

```bash
claude plugin validate .
```

특정 플러그인만 검증:

```bash
claude plugin validate plugins/domain-book-builder
```

### 새 플러그인 추가

1. **플러그인 디렉토리 생성**
   ```bash
   mkdir -p plugins/your-plugin/.claude-plugin
   ```

2. **플러그인 구조 설정**
   ```
   plugins/your-plugin/
   ├── .claude-plugin/
   │   └── plugin.json       # 플러그인 메타데이터
   ├── skills/               # 에이전트 스킬 (자동 호출)
   ├── commands/             # 사용자 명령어 (/plugin:command)
   ├── agents/               # 커스텀 에이전트
   ├── hooks/                # 이벤트 훅
   ├── README.md             # 플러그인 문서
   └── CHANGELOG.md          # 버전 변경 이력
   ```

3. **마켓플레이스에 등록**

   `.claude-plugin/marketplace.json`의 `plugins` 배열에 추가:
   ```json
   {
     "name": "your-plugin",
     "source": "./plugins/your-plugin",
     "description": "플러그인 설명",
     "version": "1.0.0",
     "author": {
       "name": "Your Name"
     },
     "category": "category-name"
   }
   ```

4. **검증 및 테스트**
   ```bash
   claude plugin validate .
   claude --plugin-dir ./plugins/your-plugin
   ```

---

## 📚 문서

### 사용자 문서
- [설치 가이드](./docs/installation.md) - 상세 설치 및 설정 방법
- [문제 해결](./docs/troubleshooting.md) - 일반적인 문제와 해결 방법

### 개발자 문서
- [플러그인 개발](./docs/plugin-development.md) - 플러그인 생성 가이드
- [기여 가이드](./CONTRIBUTING.md) - PR 제출 및 코드 스타일
- [변경 이력](./CHANGELOG.md) - 버전별 변경 사항

### 공식 레퍼런스
- [Claude Code 플러그인 가이드](https://code.claude.com/docs/en/plugins)
- [플러그인 마켓플레이스](https://code.claude.com/docs/en/plugin-marketplaces)
- [플러그인 레퍼런스](https://code.claude.com/docs/en/plugins-reference)

---

## 🤝 기여하기

플러그인 개발에 참여하고 싶으신가요? [CONTRIBUTING.md](./CONTRIBUTING.md)를 확인해주세요!

### 빠른 시작

1. Fork & Clone
   ```bash
   git clone https://github.com/your-username/claude.git
   cd claude
   ```

2. 로컬 테스트
   ```bash
   claude --plugin-dir .
   ```

3. 변경 후 검증
   ```bash
   ./scripts/validate-all.sh
   ```

4. PR 제출
   ```bash
   git push origin feature/your-feature
   # GitHub에서 Pull Request 생성
   ```

---

## 📊 프로젝트 구조

```
claude/
├── .github/
│   └── workflows/         # CI/CD 워크플로우
├── .claude-plugin/
│   └── marketplace.json   # 마켓플레이스 카탈로그
├── plugins/               # 플러그인 컬렉션
│   └── domain-book-builder/
├── docs/                  # 상세 문서
├── scripts/               # 유틸리티 스크립트
├── CHANGELOG.md           # 변경 이력
├── CLAUDE.md              # AI 에이전트 가이드
├── CONTRIBUTING.md        # 기여 가이드
├── LICENSE                # MIT 라이선스
└── README.md              # 이 파일
```

---

## 🔐 보안

보안 취약점을 발견하셨나요? [SECURITY.md](./SECURITY.md)를 참조하여 책임감 있게 보고해주세요.

---

## 📄 라이선스

이 프로젝트는 [MIT License](./LICENSE) 하에 배포됩니다.

```
MIT License

Copyright (c) 2026 URECA Team

자유롭게 사용, 수정, 배포 가능합니다.
```

---

## 🌟 Star History

이 프로젝트가 유용하다면 ⭐️을 눌러주세요!

---

## 📞 연락처

- **이슈 제보**: [GitHub Issues](https://github.com/ureca-corp/claude/issues)
- **토론**: [GitHub Discussions](https://github.com/ureca-corp/claude/discussions)
- **이메일**: support@ureca.team (플레이스홀더)

---

<div align="center">

**Made with ❤️ by URECA Team**

[GitHub](https://github.com/ureca-corp) · [Website](https://ureca.team)

</div>
