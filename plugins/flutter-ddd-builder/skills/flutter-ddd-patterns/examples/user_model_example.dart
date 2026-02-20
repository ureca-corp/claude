import 'package:freezed_annotation/freezed_annotation.dart';

part 'user_model_example.freezed.dart';
part 'user_model_example.g.dart';

/// Example Freezed 3.x model following Flutter DDD conventions
@freezed
abstract class UserModel with _$UserModel {
  const UserModel._();

  const factory UserModel({
    required String id,
    required String email,
    String? displayName,
    String? profileImageUrl,
    @Default('en') String preferredLanguage,
    @JsonKey(name: 'created_at') DateTime? createdAt,
  }) = _UserModel;

  // Custom getters
  String get name => displayName ?? email.split('@').first;
  bool get hasProfileImage => profileImageUrl != null;

  // Custom methods
  String getInitials() {
    final parts = name.split(' ');
    if (parts.length > 1) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return name.substring(0, 1).toUpperCase();
  }

  factory UserModel.fromJson(Map<String, dynamic> json) =>
      _$UserModelFromJson(json);
}
