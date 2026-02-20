# API Client Patterns

## Dio Direct Access (No Repository)

This project uses `dioProvider` directly in services and providers. No Repository or DataSource layer.

### Basic CRUD Pattern

```dart
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:app/apps/infra/common/client/dio_provider.dart';
import 'package:app/apps/domain/post/models/post_model.dart';

part 'post_provider.g.dart';

@riverpod
class PostList extends _$PostList {
  @override
  FutureOr<List<PostModel>> build() async {
    final dio = ref.watch(dioProvider);
    final response = await dio.get('/api/posts');
    return (response.data as List)
        .map((json) => PostModel.fromJson(json))
        .toList();
  }

  Future<void> create(PostModel post) async {
    final dio = ref.read(dioProvider);
    await dio.post('/api/posts', data: post.toJson());
    ref.invalidateSelf();
  }

  Future<void> update(String id, PostModel post) async {
    final dio = ref.read(dioProvider);
    await dio.put('/api/posts/$id', data: post.toJson());
    ref.invalidateSelf();
  }

  Future<void> delete(String id) async {
    final dio = ref.read(dioProvider);
    await dio.delete('/api/posts/$id');
    ref.invalidateSelf();
  }
}
```

### Error Handling

```dart
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
```

### File Upload

```dart
Future<String> uploadImage(File file) async {
  final dio = ref.read(dioProvider);
  final formData = FormData.fromMap({
    'file': await MultipartFile.fromFile(file.path),
  });
  final response = await dio.post('/api/upload', data: formData);
  return response.data['url'];
}
```

### Pagination

```dart
@riverpod
class PostList extends _$PostList {
  int _page = 1;
  bool _hasMore = true;

  @override
  FutureOr<List<PostModel>> build() async {
    _page = 1;
    _hasMore = true;
    return _fetchPage(1);
  }

  Future<List<PostModel>> _fetchPage(int page) async {
    final dio = ref.watch(dioProvider);
    final response = await dio.get('/api/posts', queryParameters: {
      'page': page,
      'limit': 20,
    });
    final items = (response.data['items'] as List)
        .map((json) => PostModel.fromJson(json))
        .toList();
    _hasMore = items.length == 20;
    return items;
  }

  Future<void> loadMore() async {
    if (!_hasMore) return;
    _page++;
    final newItems = await _fetchPage(_page);
    state = AsyncData([...state.value ?? [], ...newItems]);
  }
}
```

### Key Rules

1. **Always use absolute imports**: `package:app/apps/...`
2. **No Repository pattern**: Dio is called directly
3. **ref.watch for reads, ref.read for mutations**
4. **AsyncValue.guard for error handling**
5. **ref.invalidateSelf() to refresh data after mutations**
