import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:app/apps/domain/auth/models/user_model.dart';
import 'package:app/apps/infra/common/client/dio_provider.dart';

part 'auth_service_example.g.dart';

/// Example Riverpod 3.x AsyncNotifier service following Flutter DDD conventions
/// - Uses dioProvider directly (no Repository pattern)
/// - Absolute imports only (package:app/...)
/// - AsyncValue.guard for error handling
@riverpod
class AuthService extends _$AuthService {
  @override
  FutureOr<UserModel?> build() => null;

  /// Login with email and password
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

  /// Logout current user
  Future<void> logout() async {
    final dio = ref.read(dioProvider);
    await AsyncValue.guard(() async {
      await dio.post('/api/auth/logout');
    });
    state = const AsyncData(null);
  }

  /// Get current user profile
  Future<UserModel> getCurrentUser() async {
    final dio = ref.watch(dioProvider);
    return await AsyncValue.guard(() async {
      final response = await dio.get('/api/auth/me');
      return UserModel.fromJson(response.data);
    }).then((value) => value.requireValue);
  }
}
