---
name: Flutter DDD Patterns
description: This skill should be used when creating "Freezed models", "Riverpod services", "API clients", "domain models", "AsyncNotifier", or working with Flutter DDD architecture. Provides patterns for Freezed 3.x, Riverpod 3.x, and API client integration following project conventions.
version: 0.2.0
---

# Flutter DDD Patterns

Provides comprehensive patterns for implementing Flutter Domain-Driven Design architecture using Freezed 3.x, Riverpod 3.x, and API client integration.

## Purpose

Standardize code generation for Flutter DDD projects:
- Freezed 3.x models with immutable data structures
- Riverpod 3.x AsyncNotifier services with proper error handling
- API client integration using Dio directly (no Repository pattern)
- Consistent file structure and naming conventions

## When to Use

Load this skill when:
- Creating Freezed models (`@freezed abstract class`)
- Implementing Riverpod AsyncNotifier services
- Integrating API clients with domain services
- Structuring domain layer code
- Working with `swagger_parser` generated API clients

## Architecture Overview

### Directory Structure

```
lib/apps/
├── domain/{domain}/
│   ├── models/
│   │   ├── {entity}_model.dart
│   │   └── {entity}_model.freezed.dart (generated)
│   ├── services/
│   │   ├── {domain}_service.dart
│   │   └── {domain}_service.g.dart (generated)
│   ├── pages/
│   │   └── {page}/
│   │       ├── {page}_page.dart
│   │       └── {page}_provider.dart
│   └── components/           # Domain-specific widgets
├── infra/
│   ├── common/client/dio_provider.dart
│   └── http/generated/              # swagger_parser output
│       ├── rest_client.dart
│       └── *.dart (models, requests, responses)
└── ui/
    └── router/
        ├── app_router.dart      # barrel export
        ├── client.dart          # RouterClient (const instances)
        ├── routes.dart          # GoRouter goRouterConfig
        └── domains/
            └── {domain}.dart    # Route classes
```

### Code Generation Workflow

1. Write Freezed models in `lib/apps/domain/{domain}/models/`
2. Write Riverpod services in `lib/apps/domain/{domain}/services/`
3. Run code generation:
   ```bash
   dart run swagger_parser  # If swagger/api_spec.json exists
   dart run build_runner build --delete-conflicting-outputs
   ```

## Freezed 3.x Model Pattern

### Basic Model Template

```dart
import 'package:freezed_annotation/freezed_annotation.dart';

part '{entity}_model.freezed.dart';
part '{entity}_model.g.dart';

@freezed
abstract class {Entity}Model with _${Entity}Model {
  const {Entity}Model._();

  const factory {Entity}Model({
    required String id,
    required String name,
    DateTime? createdAt,
  }) = _{Entity}Model;

  factory {Entity}Model.fromJson(Map<String, dynamic> json) =>
      _${Entity}ModelFromJson(json);
}
```

### Key Requirements

- **Package import**: `package:freezed_annotation/freezed_annotation.dart`
- **Part files**: Both `.freezed.dart` and `.g.dart`
- **Annotation**: `@freezed` (not `@Freezed()`)
- **Abstract class**: `abstract class` with mixin
- **Private constructor**: `const {Entity}Model._();`
- **Const factory**: `const factory {Entity}Model({...})`
- **fromJson**: Factory constructor for JSON deserialization

### Naming Conventions

- **File**: `{entity}_model.dart` (snake_case)
- **Class**: `{Entity}Model` (PascalCase + Model suffix)
- **Factory**: `_{Entity}Model` (underscore prefix)

### Common Patterns

**Optional fields:**
```dart
const factory UserModel({
  required String id,
  String? displayName,  // Nullable
  @Default('en') String language,  // Default value
}) = _UserModel;
```

**Custom methods:**
```dart
@freezed
abstract class UserModel with _$UserModel {
  const UserModel._();

  const factory UserModel({
    required String email,
  }) = _UserModel;

  // Custom getter
  bool get isVerified => email.contains('@verified.com');

  // Custom method
  String getDisplayName() => email.split('@').first;

  factory UserModel.fromJson(Map<String, dynamic> json) =>
      _$UserModelFromJson(json);
}
```

**Enums:**
```dart
enum SocialProvider {
  @JsonValue('google') google,
  @JsonValue('apple') apple,
}

const factory UserModel({
  required SocialProvider provider,
}) = _UserModel;
```

## Riverpod 3.x AsyncNotifier Pattern

### Basic Service Template

```dart
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:app/apps/domain/{domain}/models/{entity}_model.dart';
import 'package:app/apps/infra/common/client/dio_provider.dart';

part '{domain}_service.g.dart';

@riverpod
class {Domain}Service extends _${Domain}Service {
  Future<{Entity}Model> get{Entity}(String id) async {
    final dio = ref.watch(dioProvider);
    return await AsyncValue.guard(() async {
      final response = await dio.get('/api/{entities}/$id');
      return {Entity}Model.fromJson(response.data);
    }).then((value) => value.requireValue);
  }

  Future<void> create{Entity}({Entity}Model model) async {
    final dio = ref.read(dioProvider);
    await AsyncValue.guard(() async {
      await dio.post('/api/{entities}', data: model.toJson());
    });
  }
}
```

### Key Requirements

- **Annotation**: `@riverpod` (lowercase)
- **Extends**: `_${Domain}Service` (generated base class)
- **Client access**: Via `ref.watch(dioProvider)` or `ref.read(dioProvider)`
- **Error handling**: `AsyncValue.guard` pattern
- **Return types**: Use `Future<T>` for async operations
- **No Repository pattern**: Dio is called directly from providers/services

### AsyncValue.guard Pattern

**For operations returning data:**
```dart
Future<UserModel> getUser(String id) async {
  final dio = ref.watch(dioProvider);
  return await AsyncValue.guard(() async {
    final response = await dio.get('/api/users/$id');
    return UserModel.fromJson(response.data);
  }).then((value) => value.requireValue);
}
```

**For void operations:**
```dart
Future<void> deleteUser(String id) async {
  final dio = ref.read(dioProvider);
  await AsyncValue.guard(() async {
    await dio.delete('/api/users/$id');
  });
}
```

**With error transformation:**
```dart
Future<List<PostModel>> getPosts() async {
  final dio = ref.watch(dioProvider);
  return await AsyncValue.guard(() async {
    final response = await dio.get('/api/posts');
    return (response.data as List)
        .map((json) => PostModel.fromJson(json))
        .toList();
  }).then((asyncValue) {
    return asyncValue.when(
      data: (data) => data,
      error: (error, stack) {
        throw Exception('Failed to load posts: $error');
      },
      loading: () => throw Exception('Should not be loading'),
    );
  });
}
```

### Naming Conventions

- **File**: `{domain}_service.dart` (snake_case)
- **Class**: `{Domain}Service` (PascalCase + Service suffix)
- **Methods**: CRUD operations start with `get`, `create`, `update`, `delete`

## API Client Integration

### Using Dio Directly (No Repository Pattern)

The project uses `dioProvider` for all API calls. Providers call Dio directly without a Repository layer.

**Configuration (`swagger_parser.yaml`):**
```yaml
swagger_parser:
  schema_path: swagger/api_spec.json
  output_directory: lib/apps/infra/http/generated
  use_freezed3: true
  client_postfix: Client
  root_client: true
  root_client_name: RestClient
```

**Generated structure:**
```
lib/apps/infra/http/generated/
├── rest_client.dart          # Main client
├── auth/
│   ├── login_request_model.dart
│   └── login_response_model.dart
└── ...
```

### Accessing Dio in Services

**Standard pattern:**
```dart
@riverpod
class AuthService extends _$AuthService {
  Future<UserModel> login(String email, String password) async {
    final dio = ref.read(dioProvider);
    return await AsyncValue.guard(() async {
      final response = await dio.post('/api/auth/login', data: {
        'email': email,
        'password': password,
      });
      return UserModel.fromJson(response.data);
    }).then((value) => value.requireValue);
  }
}
```

## Router Pattern

### Route Class Pattern

Each domain has route classes in `lib/apps/ui/router/domains/{domain}.dart`:

```dart
import 'package:flutter/widgets.dart';
import 'package:go_router/go_router.dart';

class LoginRoute {
  const LoginRoute();

  static const path = '/login';
  static const name = 'login';

  void go(BuildContext context) => context.go(path);
}

class PostDetailRoute {
  const PostDetailRoute();

  static const path = '/posts/:id';
  static const name = 'post-detail';

  void go(BuildContext context, {required String id}) =>
      context.go('/posts/$id');

  Future<T?> push<T>(BuildContext context, {required String id}) =>
      context.push<T>('/posts/$id');
}
```

### RouterClient Pattern

`lib/apps/ui/router/client.dart`:
```dart
import 'package:app/apps/ui/router/domains/auth.dart';
import 'package:app/apps/ui/router/domains/post.dart';

abstract final class RouterClient {
  static const splash = SplashRoute();
  static const login = LoginRoute();
  static const postList = PostListRoute();
  static const postDetail = PostDetailRoute();
}
```

### Navigation Usage

```dart
// Navigate using RouterClient
RouterClient.login.go(context);
RouterClient.postDetail.push(context, id: postId);
```

## UI Design Principles

### MUI Component Based Minimalism
- Use Material 3 built-in components first: `FilledButton`, `OutlinedButton`, `Card`, `ListTile`, `AppBar`, etc.
- Minimize custom widgets — leverage Material Design components
- Text-first design, icons only when functional

### Lucide Icons
- Use `LucideIcons.*` from `package:lucide_icons` instead of `Icons.*`
- Exception: Material-specific icons that don't exist in Lucide

### Theme Tokens
- Colors: `Theme.of(context).colorScheme`
- Typography: `Theme.of(context).textTheme`
- No hardcoded color or text style values

## File Structure Best Practices

### Domain Organization

```
lib/apps/domain/auth/
├── models/
│   ├── user_model.dart
│   ├── user_model.freezed.dart
│   ├── user_model.g.dart
│   ├── auth_state_model.dart
│   └── ...
├── services/
│   ├── auth_service.dart
│   └── auth_service.g.dart
├── pages/
│   └── login/
│       ├── login_page.dart
│       └── login_provider.dart
└── components/
    └── auth_guard.dart  # Shared domain components
```

### Naming Rules

- **Models**: `{entity}_model.dart` - always end with `_model`
- **Services**: `{domain}_service.dart` - always end with `_service`
- **Pages**: `{page}_page.dart` - always end with `_page`
- **Components**: `{name}_component.dart` or descriptive name
- **Classes**: PascalCase with suffix (UserModel, AuthService)

### Import Organization

```dart
// 1. Dart imports
import 'dart:async';

// 2. Package imports
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

// 3. Project imports (absolute paths only)
import 'package:app/apps/domain/{domain}/models/{entity}_model.dart';
import 'package:app/apps/infra/common/client/dio_provider.dart';

// 4. Part files
part 'auth_service.g.dart';
```

## Common Patterns Reference

For detailed patterns and advanced techniques:
- **`references/freezed-3x-guide.md`** - Comprehensive Freezed 3.x patterns
- **`references/riverpod-3x-guide.md`** - Advanced Riverpod patterns
- **`references/api-client-patterns.md`** - API integration best practices

For working code examples:
- **`examples/user_model_example.dart`** - Complete Freezed model
- **`examples/auth_service_example.dart`** - Complete Riverpod service

## Quick Reference

### Model Checklist
- [ ] `@freezed` annotation
- [ ] `abstract class {Entity}Model with _${Entity}Model`
- [ ] `const {Entity}Model._();` private constructor
- [ ] `const factory` constructor
- [ ] `fromJson` factory
- [ ] Part files: `.freezed.dart` and `.g.dart`

### Service Checklist
- [ ] `@riverpod` annotation
- [ ] `extends _${Domain}Service`
- [ ] Dio via `ref.watch(dioProvider)` or `ref.read(dioProvider)`
- [ ] `AsyncValue.guard` for error handling
- [ ] Part file: `.g.dart`
- [ ] Absolute imports: `package:app/...`

### Code Generation
```bash
# Generate all (models + services + API clients)
dart run swagger_parser && dart run build_runner build --delete-conflicting-outputs

# Or step by step:
dart run swagger_parser  # API clients from swagger/api_spec.json
dart run build_runner build --delete-conflicting-outputs  # Freezed + Riverpod
```

## Troubleshooting

**Missing generated files:**
- Run `dart run build_runner build --delete-conflicting-outputs`
- Check part directive matches filename

**API client not found:**
- Ensure `swagger/api_spec.json` exists
- Run `dart run swagger_parser`
- Check `lib/apps/infra/http/generated/rest_client.dart`

**AsyncValue errors:**
- Use `AsyncValue.guard` for all async operations
- Use `.requireValue` to extract data from successful AsyncValue
- Handle errors with `.when()` pattern

Follow these patterns for consistent, maintainable Flutter DDD architecture.
