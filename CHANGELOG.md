# Changelog

All notable changes to URECA Claude Plugins marketplace will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- GitHub Actions CI/CD workflows
- Comprehensive documentation structure
- Local validation scripts

## [1.0.0] - 2026-02-13

### 🎉 Initial Release

First public release of URECA Claude Plugins marketplace.

### Added

#### Marketplace
- Initial marketplace structure with `.claude-plugin/marketplace.json`
- MIT License
- Comprehensive README with installation guide
- CLAUDE.md for AI agent guidance
- CONTRIBUTING.md for contributor guidelines
- Professional .gitignore configuration

#### Plugins
- **domain-book-builder v1.0.0** - 기술 독립적 Domain Book 생성 플러그인
  - 5-phase sequential workflow with approval gates
  - Incremental documentation updates
  - Domain dependency resolution via topological sort
  - Complete Korean documentation

#### Infrastructure
- GitHub repository setup at `ureca-corp/claude`
- Automated validation workflows
- Local development environment support

### Documentation
- Installation guide with step-by-step instructions
- Plugin development guide
- Troubleshooting documentation
- Contributing guidelines

---

## Plugin-Specific Changes

### domain-book-builder

#### [1.0.0] - 2026-02-13

**Initial Release**

##### Features
- **Phase 1: Clarifier** - 요구사항 명확화 에이전트
  - Batch-based Q&A (최대 4개씩)
  - 점진적 SESSION.md 업데이트
  - 모호함 완전 제거

- **Phase 2: Interviewer** - 도메인 인터뷰 에이전트
  - 도메인별 상세 인터뷰
  - SESSION.md 지속적 업데이트

- **Phase 3: Domain Modeler** - 유비쿼터스 언어 명세
  - 서술형 도메인 모델 생성
  - "A는 B를 할 수 있다" 형식
  - 기술 독립적 언어 사용

- **Phase 4: API Designer** - API 상세 설계
  - Request/Response 명세
  - 수도코드 기반 복잡한 로직 표현
  - 기술 스택 독립적 설계

- **Phase 5: Book Writer** - Domain Book 자동 생성
  - 병렬 처리 지원
  - Topological Sort 기반 의존성 해결
  - 5개 핵심 문서 생성
    - README.md - 도메인 목차
    - features.md - 기능 정의
    - domain-model.md - 유비쿼터스 언어
    - api-spec.md - API 명세
    - business-rules.md - 비즈니스 규칙

##### Skills
- `1-clarify` - Phase 1 실행 스킬
- `2-interview-domain` - Phase 2 실행 스킬
- `3-model-domain` - Phase 3 실행 스킬
- `4-design-api` - Phase 4 실행 스킬
- `5-write-book` - Phase 5 실행 스킬

##### Commands
- `/domain-book-builder:start` - 워크플로우 시작 명령어

##### Documentation
- Comprehensive README with workflow explanation
- CLAUDE.md with development guidelines
- Template files for each phase
- Example outputs

---

## Version Guidelines

### Marketplace Versioning

The marketplace version (`1.0.0`) represents the overall marketplace structure:

- **Major (1.x.x)**: Breaking changes to marketplace structure or plugin discovery mechanism
- **Minor (x.1.x)**: New plugins added, non-breaking marketplace improvements
- **Patch (x.x.1)**: Documentation updates, bug fixes in marketplace configuration

### Plugin Versioning

Each plugin maintains its own version independently:

- **Major**: Breaking changes to plugin API or workflow
- **Minor**: New features, new phases, backward-compatible changes
- **Patch**: Bug fixes, documentation updates, template improvements

---

## Migration Guide

### From Pre-1.0 (Internal) to 1.0.0

If you used internal versions before the public release:

1. **Update marketplace reference**:
   ```bash
   /plugin marketplace remove ureca-plugins
   /plugin marketplace add https://github.com/ureca-corp/claude
   ```

2. **Reinstall plugins**:
   ```bash
   /plugin uninstall domain-book-builder
   /plugin install domain-book-builder@ureca-plugins
   ```

3. **No breaking changes** - Existing Domain Books remain compatible

---

## Deprecation Policy

We follow semantic versioning strictly:

- **Deprecation Notice**: Minimum 1 minor version before removal
- **Breaking Changes**: Only in major versions
- **Security Fixes**: Immediate patches regardless of version

---

## Links

- [Repository](https://github.com/ureca-corp/claude)
- [Issues](https://github.com/ureca-corp/claude/issues)
- [Discussions](https://github.com/ureca-corp/claude/discussions)

---

[Unreleased]: https://github.com/ureca-corp/claude/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/ureca-corp/claude/releases/tag/v1.0.0
