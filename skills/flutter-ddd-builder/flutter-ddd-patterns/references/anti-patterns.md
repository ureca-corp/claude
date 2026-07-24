# Anti-Patterns (절대 금지)

코드 리뷰에서 반복 발견되는 실수 모음. 이 패턴이 보이면 즉시 수정.

## 1. ref.watch in non-build methods

```dart
// ❌ WRONG
Future<List<Post>> _fetchPosts() async {
  final dio = ref.watch(dioProvider); // build() 밖에서 watch 금지
}

// ✅ CORRECT
Future<List<Post>> _fetchPosts() async {
  final dio = ref.read(dioProvider);
}
```

**이유**: `ref.watch`는 `build()` 스코프에서만 의존성 추적이 유효. helper에서 호출하면 stale dependency, rebuild 누락.

## 2. Bare Dio().fetch() in interceptor retry

```dart
// ❌ WRONG: 인터셉터 없는 bare Dio
final response = await Dio().fetch(options);

// ✅ CORRECT: ResponseInterceptor + ErrorInterceptor 포함
final retryDio = Dio()
  ..interceptors.addAll([
    ResponseInterceptor(),
    ErrorInterceptor(),
  ]);
final response = await retryDio.fetch(options);
```

**이유**: bare `Dio()`는 ResponseInterceptor가 없어 envelope `{status, message, data}`가 미추출됨.

## 3. Dto suffix in model naming

```dart
// ❌ WRONG
class PostCreateDto { ... }  // post_create_dto.dart

// ✅ CORRECT
class PostCreateModel { ... }  // post_create_model.dart
```

**이유**: 프로젝트 규칙 "No DTO/Entity 분리". 모든 모델은 `_model.dart` + `Model` suffix.

## 4. Missing const on Freezed factory

```dart
// ❌ WRONG
factory PostModel({required String id}) = _PostModel;

// ✅ CORRECT
const factory PostModel({required String id}) = _PostModel;
```

## 5. FooRef in provider signature (Riverpod 3.x)

```dart
// ❌ WRONG: Riverpod 2.x 패턴
@riverpod
MyClient myApi(MyApiRef ref) { ... }

// ✅ CORRECT: Riverpod 3.x
@riverpod
MyClient myApi(Ref ref) { ... }
```

## 6. Post-await manual state read in UI

```dart
// ❌ WRONG: await 후 수동 state 읽기 (race condition)
await ref.read(provider.notifier).create(dto);
final state = ref.read(provider);
state.when(...);

// ✅ CORRECT: ref.listen in build()
@override
Widget build(BuildContext context) {
  ref.listen(postCreateProvider, (_, next) {
    next.whenOrNull(
      data: (post) { if (post != null) Navigator.pop(context, true); },
      error: (error, _) { ScaffoldMessenger.of(context).showSnackBar(...); },
    );
  });
}
```

→ 전체 예제는 [post_create_page_example.dart](../examples/post_create_page_example.dart) 참조.

## 7. Route path collision with :id

```dart
// ❌ WRONG: "create"가 :id로 매칭될 위험
static const path = '/posts/create';
static const detailPath = '/posts/:id';

// ✅ CORRECT: 명확히 구분되는 경로명
static const path = '/posts/new';
static const detailPath = '/posts/:id';
```

## 8. Auth Provider를 AsyncError로 두는 실수

```dart
// ❌ WRONG: 로그인 실패 시 authProvider가 AsyncError로 남음
// → router redirect에서 authState.value == null → 인증 가드 비활성화
Future<void> login(...) async {
  try { ... } catch (e, st) {
    state = AsyncError<AuthStateModel>(e, st); // 상태 의미 모호
    rethrow;
  }
}

// ✅ CORRECT: 실패 시 unauthenticated로 복귀 + 에러는 호출자에 전파
Future<void> login(...) async {
  try { ... } catch (e, st) {
    state = const AsyncData(AuthStateModel.unauthenticated());
    Error.throwWithStackTrace(e, st); // rethrow 대신 스택 보존
  }
}
```

**이유**: `authProvider`는 "인증 상태"를 표현. `AsyncError`는 유효한 인증 상태가 아님. 에러 메시지는 `emailLoginProvider`가 담당 (역할 분리).

## 9. Router redirect에서 null auth value 무시

```dart
// ❌ WRONG: null이면 리다이렉트 안 함 → AsyncError 시 보호 라우트 우회 가능
if (authValue == null) return null;

// ✅ CORRECT: null이면 미인증 취급 (AsyncLoading 중에만 예외)
if (authState.isLoading && authValue == null) return null;
if (authValue == null) {
  return _authPaths.contains(currentPath) ? null : LoginRoute.path;
}
```

**이유**: defense-in-depth. `authProvider`가 예기치 않은 상태여도 보호 라우트 접근 차단.

## 10. 로그인 에러를 raw toString으로 표시

```dart
// ❌ WRONG: 사용자에게 DioException 원문 노출
SnackBar(content: Text('${next.error}'));

// ✅ CORRECT: AppException이면 사용자 친화적 메시지, 아니면 generic
final error = next.error;
final message = error is AppException
    ? ExceptionHandler.getUserMessage(error)
    : '로그인에 실패했습니다. 다시 시도해주세요.';
SnackBar(content: Text(message));
```

## Auth Interceptor — Token Refresh Retry

```dart
class AuthInterceptor extends Interceptor {
  @override
  Future<void> onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      final refreshed = await _refreshToken();
      if (refreshed) {
        // AuthInterceptor 제외, 나머지 인터셉터 포함 (루프 방지)
        final retryDio = Dio()
          ..interceptors.addAll([ResponseInterceptor(), ErrorInterceptor()]);
        final response = await retryDio.fetch(err.requestOptions);
        handler.resolve(response);
        return;
      }
      await _secureStorage.deleteAll(); // 로그아웃
    }
    handler.next(err);
  }
}
```

### Login 시 Token 저장 체크리스트

- [ ] `accessToken` 저장
- [ ] `refreshToken` 저장 (API에 필드가 있는 경우)
- [ ] `userId` 저장
- [ ] refresh token이 없으면 AuthInterceptor._refreshToken()이 항상 실패함을 인지
