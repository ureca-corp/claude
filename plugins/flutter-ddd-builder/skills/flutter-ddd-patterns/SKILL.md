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

### Auth State Management

- [ ] `authProvider` 로그인 실패 시 `AsyncData(unauthenticated())` 복귀 (절대 `AsyncError` 아님)
- [ ] 에러 전파: `Error.throwWithStackTrace(e, st)` (`rethrow` 대신 — 상태 설정 후 전파)
- [ ] `emailLoginProvider`가 에러 메시지 담당 (역할 분리)
- [ ] Login UI: `ref.listen(authProvider)` → 성공 네비게이션, `ref.listen(emailLoginProvider)` → 에러 표시
- [ ] 에러 메시지: `AppException` → `ExceptionHandler.getUserMessage()`, 그 외 → generic 메시지
- [ ] Router redirect: `authValue == null` → 미인증 취급 (defense-in-depth)

### Auth Interceptor

- [ ] Retry Dio에 `ResponseInterceptor` + `ErrorInterceptor` 포함
- [ ] `AuthInterceptor`는 retry Dio에서 제외 (무한루프 방지)
- [ ] 로그인 시 `refreshToken` 저장 확인

### Pagination
- [ ] `PaginatedResponse<T>` model in `lib/global/types/paginated_response.dart`
- [ ] `PaginationMeta` with offset/pageSize/totalItemCount/isFirst/isLast
- [ ] Provider uses `_page` counter + `_hasMore` flag
- [ ] `loadMore()` appends to existing list
- [ ] UI uses `NotificationListener<ScrollNotification>` or `ScrollController`

### AsyncValueWidget
- [ ] Use `AsyncValueWidget` instead of `.when(data:, error:, loading:)` inline
- [ ] Located at `lib/apps/ui/common/async_value_widget.dart`
- [ ] Supports `emptyCheck` and `emptyMessage` for empty states
- [ ] Custom `loading` and `error` builders optional

### Form Validation
- [ ] Use `Validators` from `lib/global/utils/validators.dart`
- [ ] `Validators.compose([...])` for multiple rules
- [ ] Available: `required`, `email`, `minLength`, `maxLength`, `phone`, `password`

### Loading Overlay
- [ ] `withLoaderOverlay(context, () async { ... })` for button actions
- [ ] Requires `LoaderOverlay` widget in tree (wrap Scaffold or MaterialApp)
- [ ] Auto-hides on success or error

### Theme (Dual Mode)
- [ ] `AppTheme.fromTokens()` — Figma token-based (AppColors → ColorScheme)
- [ ] `AppTheme.fromSeed(seedColor: Colors.blue)` — Material 3 auto-generated
- [ ] Both modes: `Theme.of(context).colorScheme.primary` works identically
- [ ] `AppSpacing`, `AppRadius` usable in both modes

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
- **[Anti-Patterns](references/anti-patterns.md)** — 10가지 금지 패턴 + Auth Interceptor 올바른 패턴

## Working Examples

- **[user_model_example.dart](examples/user_model_example.dart)** — Freezed model with custom methods
- **[auth_service_example.dart](examples/auth_service_example.dart)** — Riverpod AsyncNotifier service
- **[post_create_page_example.dart](examples/post_create_page_example.dart)** — ref.listen UI 상태 처리
- **[paginated_list_example.dart](examples/paginated_list_example.dart)** — Pagination Provider + infinite scroll UI
- **[form_with_validation_example.dart](examples/form_with_validation_example.dart)** — Validators + withLoaderOverlay
