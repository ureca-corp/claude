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
