---
name: Flutter DDD Patterns
description: This skill should be used when creating "Freezed models", "Riverpod services", "API clients", "domain models", "AsyncNotifier", or working with Flutter DDD architecture. Provides patterns for Freezed 3.x, Riverpod 3.x, and API client integration following project conventions.
version: 0.3.0
---

# Flutter DDD Patterns

## Architecture Overview

```
lib/apps/
├── domain/{domain}/
│   ├── models/         # {entity}_model.dart (Freezed 3.x)
│   ├── services/       # {domain}_service.dart (Riverpod 3.x AsyncNotifier)
│   ├── pages/{page}/
│   │   ├── {page}_page.dart
│   │   └── providers/  # {feature}_provider.dart
│   └── components/
├── infra/              # Dio client, interceptors, exception
├── application/        # Cross-feature (storage, auth)
├── ui/                 # theme, router, common components
├── generated/api/      # swagger_parser output (수동 편집 금지)
└── global/             # constants, utils, hooks, types
```

**Core Rules**:
- No Repository/DataSource — Provider → Dio 직접 호출
- No DTO/Entity 분리 — 모든 모델은 `_model.dart` + `Model` suffix
- Freezed 3.x `@freezed abstract class` + `const factory`
- Riverpod 3.x `@riverpod` + `Ref` (not `FooRef`)
- Always `package:app/...` imports (no relative)

## Quick Reference Checklists

### Freezed Model

- [ ] `@freezed` annotation
- [ ] `abstract class {Entity}Model with _${Entity}Model`
- [ ] `const {Entity}Model._();` (custom methods가 있을 때)
- [ ] `const factory` constructor (const 필수)
- [ ] `fromJson` factory
- [ ] Part files: `.freezed.dart` + `.g.dart`
- [ ] 파일명 `{entity}_model.dart`, **절대 `_dto.dart` 아님**

### Riverpod Provider/Service

- [ ] `@riverpod` annotation (lowercase)
- [ ] Class: `extends _${Name}` | Function: `Ref ref` parameter
- [ ] `build()` 안에서만 `ref.watch` — helper/action 메서드에서는 `ref.read`
- [ ] `AsyncValue.guard` for error handling
- [ ] UI 상태 반응은 Page의 `build()`에서 `ref.listen` 사용

### Router (go_router)

- [ ] 정적 경로(`/posts/new`)를 동적 경로(`/posts/:id`) 앞에 등록
- [ ] Route class: `static const path`, `static const name`, `go()`, `push()`
- [ ] RouterClient: `abstract final class` with const instances

### Auth Interceptor

- [ ] Retry Dio에 `ResponseInterceptor` + `ErrorInterceptor` 포함
- [ ] `AuthInterceptor`는 retry Dio에서 제외 (무한루프 방지)
- [ ] 로그인 시 `refreshToken` 저장 확인

## Naming Conventions

| Type | File | Class |
|------|------|-------|
| Model | `{entity}_model.dart` | `{Entity}Model` |
| Service | `{domain}_service.dart` | `{Domain}Service` |
| Provider | `{feature}_provider.dart` | `{Feature}Provider` |
| Page | `{page}_page.dart` | `{Page}Page` |
| Route | `domains/{domain}.dart` | `{Page}Route` |

## Import Order

```dart
import 'dart:async';                                   // 1. Dart
import 'package:freezed_annotation/freezed_annotation.dart'; // 2. Package
import 'package:app/apps/domain/.../model.dart';       // 3. Project (absolute)
part 'file.g.dart';                                    // 4. Part
```

## Code Generation

```bash
dart run swagger_parser                                    # API clients
dart run build_runner build --delete-conflicting-outputs   # Freezed + Riverpod
```

## Detailed References

- **[Freezed 3.x Guide](references/freezed-3x-guide.md)** — Union types, nested models, enums, custom JSON, testing
- **[Riverpod 3.x Guide](references/riverpod-3x-guide.md)** — AsyncNotifier, provider types, family, ref.watch vs ref.read
- **[API Client Patterns](references/api-client-patterns.md)** — CRUD, pagination, file upload, error handling
- **[Anti-Patterns](references/anti-patterns.md)** — 7가지 금지 패턴 + Auth Interceptor 올바른 패턴

## Working Examples

- **[user_model_example.dart](examples/user_model_example.dart)** — Freezed model with custom methods
- **[auth_service_example.dart](examples/auth_service_example.dart)** — Riverpod AsyncNotifier service
- **[post_create_page_example.dart](examples/post_create_page_example.dart)** — ref.listen UI 상태 처리
