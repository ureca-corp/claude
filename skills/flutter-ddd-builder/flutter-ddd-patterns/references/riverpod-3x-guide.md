# Riverpod 3.x Guide

## AsyncNotifier Pattern

### Basic AsyncNotifier

```dart
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:app/apps/infra/common/client/dio_provider.dart';

part '{domain}_service.g.dart';

@riverpod
class PostService extends _$PostService {
  @override
  FutureOr<List<PostModel>> build() async {
    final dio = ref.read(dioProvider);
    final response = await dio.get('/api/posts');
    return (response.data as List)
        .map((json) => PostModel.fromJson(json))
        .toList();
  }

  Future<void> createPost(PostModel post) async {
    final dio = ref.read(dioProvider);
    await dio.post('/api/posts', data: post.toJson());
    ref.invalidateSelf();
  }
}
```

### Key Rules

- Use `@riverpod` (lowercase) annotation
- Class extends `_$ClassName` (generated)
- Use `ref.read(dioProvider)` in helper/action methods (build 밖)
- `ref.watch` only directly in `build()` body (reactive rebuild 필요 시)
- Wrap with `AsyncValue.guard` for error handling
- Call `ref.invalidateSelf()` to refresh after mutations

### Provider Types

```dart
// Simple provider (functional)
@riverpod
String greeting(Ref ref) => 'Hello';

// Async provider with parameter
@riverpod
Future<PostModel> postDetail(Ref ref, String id) async {
  final dio = ref.read(dioProvider);
  final response = await dio.get('/api/posts/$id');
  return PostModel.fromJson(response.data);
}

// AsyncNotifier (class-based, stateful)
@riverpod
class AuthService extends _$AuthService {
  @override
  FutureOr<UserModel?> build() => null;

  Future<void> login(String email, String password) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final dio = ref.read(dioProvider);
      final response = await dio.post('/api/auth/login', data: {
        'email': email,
        'password': password,
      });
      return UserModel.fromJson(response.data);
    });
  }
}
```

### Error Handling with AsyncValue

```dart
// In UI
final postAsync = ref.watch(postServiceProvider);
postAsync.when(
  data: (posts) => ListView(...),
  loading: () => CircularProgressIndicator(),
  error: (error, stack) => Text('Error: $error'),
);

// In service (helper method → ref.read)
Future<UserModel> getUser(String id) async {
  final dio = ref.read(dioProvider);
  return await AsyncValue.guard(() async {
    final response = await dio.get('/api/users/$id');
    return UserModel.fromJson(response.data);
  }).then((value) => value.requireValue);
}
```

### ref.watch vs ref.read

| Method | Use When | Reactivity |
|--------|----------|------------|
| `ref.watch` | Directly in `build()` body only | Rebuilds on change |
| `ref.read` | Helper methods, action methods, callbacks | No rebuild (one-time) |

### Family Providers (Parameters)

```dart
@riverpod
Future<PostModel> postById(Ref ref, String id) async {
  final dio = ref.read(dioProvider);
  final response = await dio.get('/api/posts/$id');
  return PostModel.fromJson(response.data);
}

// Usage
final post = ref.watch(postByIdProvider(postId));
```

### Auth State Management Pattern

`authProvider`는 인증 "상태"만 표현. 로그인 실패 시 `AsyncError`가 아닌 `unauthenticated`로 복귀.

```dart
/// authProvider — 인증 상태 provider (source of truth)
@riverpod
class Auth extends _$Auth {
  @override
  Future<AuthStateModel> build() async => _checkAuth();

  Future<void> login({required String email, required String password}) async {
    state = const AsyncData(AuthStateModel.loading());
    try {
      // ... API 호출, 토큰 저장 ...
      state = AsyncData(AuthStateModel.authenticated(
        accessToken: token, user: user,
      ));
    } catch (e, st) {
      // ✅ 실패 → unauthenticated 복귀 (AsyncError 아님)
      state = const AsyncData(AuthStateModel.unauthenticated());
      Error.throwWithStackTrace(e, st); // 호출자에 에러 전파
    }
  }
}

/// emailLoginProvider — 로그인 폼 상태 (에러 메시지 담당)
@riverpod
class EmailLogin extends _$EmailLogin {
  @override
  FutureOr<void> build() {}

  Future<void> login({required String email, required String password}) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      await ref.read(authProvider.notifier).login(email: email, password: password);
    });
  }
}
```

**UI에서의 사용**:
```dart
// 에러 표시 — emailLoginProvider 감시
ref.listen(emailLoginProvider, (prev, next) {
  if (next.hasError && !next.isLoading) {
    final error = next.error;
    final message = error is AppException
        ? ExceptionHandler.getUserMessage(error)
        : '로그인에 실패했습니다. 다시 시도해주세요.';
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }
});

// 성공 네비게이션 — authProvider 감시
ref.listen(authProvider, (prev, next) {
  final isAuthenticated =
      next.value?.mapOrNull(authenticated: (_) => true) ?? false;
  if (isAuthenticated && context.mounted) {
    RouterClient.home.go(context);
  }
});
```

### AsyncValueWidget Pattern

**Prefer `AsyncValueWidget` over inline `.when()`:**

```dart
// Avoid
postState.when(
  data: (posts) => ListView(...),
  loading: () => CircularProgressIndicator(),
  error: (e, st) => Text('Error: $e'),
);

// Prefer
AsyncValueWidget(
  value: postState,
  emptyCheck: (posts) => posts.isEmpty,
  emptyMessage: '게시글이 없습니다',
  data: (posts) => ListView(...),
);
```

Benefits:
- Consistent error/loading/empty handling across all pages
- Built-in `ErrorState` and `EmptyState` widgets
- Optional custom `loading` and `error` builders
- Located at `lib/apps/ui/common/async_value_widget.dart`

### Pagination Provider Pattern

See [Pagination Patterns](pagination-patterns.md) for complete PaginatedResponse + infinite scroll patterns.
