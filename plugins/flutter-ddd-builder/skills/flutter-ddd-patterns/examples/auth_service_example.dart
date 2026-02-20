import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:app/apps/domain/auth/models/user_model.dart';
import 'package:app/apps/domain/auth/models/auth_state_model.dart';
import 'package:app/apps/application/storage/storage_provider.dart';
import 'package:app/apps/infra/common/client/dio_provider.dart';
import 'package:app/global/constants/app_constants.dart';

part 'auth_service_example.g.dart';

/// Example: Auth Provider — 인증 상태 관리 (Riverpod 3.x)
///
/// Key patterns:
/// - authProvider는 인증 "상태"만 표현 (절대 AsyncError 아님)
/// - 로그인 실패 시 unauthenticated로 복귀 + Error.throwWithStackTrace로 에러 전파
/// - emailLoginProvider가 에러 메시지 담당 (역할 분리)
@riverpod
class Auth extends _$Auth {
  @override
  Future<AuthStateModel> build() async => _checkAuth();

  Future<AuthStateModel> _checkAuth() async {
    final secureStorage = ref.read(secureStorageProvider);
    final accessToken = await secureStorage.read(AppConstants.keyAccessToken);
    if (accessToken == null || accessToken.isEmpty) {
      return const AuthStateModel.unauthenticated();
    }
    try {
      final dio = ref.read(dioProvider);
      final response = await dio.get('/api/v1/auth/profile');
      final user = UserModel.fromJson(response.data as Map<String, dynamic>);
      return AuthStateModel.authenticated(accessToken: accessToken, user: user);
    } catch (e) {
      await secureStorage.deleteAll();
      return const AuthStateModel.unauthenticated();
    }
  }

  /// 로그인 — 실패 시 unauthenticated 복귀
  Future<void> login({required String email, required String password}) async {
    state = const AsyncData(AuthStateModel.loading());
    try {
      final dio = ref.read(dioProvider);
      final response = await dio.post('/api/v1/auth/login', data: {
        'email': email,
        'password': password,
      });
      final loginData = response.data as Map<String, dynamic>;
      final secureStorage = ref.read(secureStorageProvider);
      await secureStorage.write(AppConstants.keyAccessToken, loginData['access_token']);
      state = AsyncData(AuthStateModel.authenticated(
        accessToken: loginData['access_token'],
        user: UserModel.fromJson(loginData['user']),
      ));
    } catch (e, st) {
      // ✅ 실패 → unauthenticated 복귀 (절대 AsyncError 아님)
      // 에러는 emailLoginProvider가 AsyncValue.guard()로 캡처하여 UI에 표시
      state = const AsyncData(AuthStateModel.unauthenticated());
      Error.throwWithStackTrace(e, st);
    }
  }

  Future<void> logout() async {
    final secureStorage = ref.read(secureStorageProvider);
    await secureStorage.deleteAll();
    state = const AsyncData(AuthStateModel.unauthenticated());
  }
}

/// emailLoginProvider — 로그인 폼 상태 (에러 메시지 담당)
///
/// authProvider에 위임하되, AsyncValue.guard로 에러를 캡처하여
/// UI의 ref.listen에서 에러 메시지를 표시할 수 있게 함
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
