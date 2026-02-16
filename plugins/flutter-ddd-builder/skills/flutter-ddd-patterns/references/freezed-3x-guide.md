# Freezed 3.x Comprehensive Guide

Detailed patterns and advanced techniques for Freezed 3.x models in Flutter DDD architecture.

## Advanced Model Patterns

### Union Types (Sealed Classes)

```dart
@freezed
sealed class AuthState with _$AuthState {
  const factory AuthState.initial() = AuthStateInitial;
  const factory AuthState.loading() = AuthStateLoading;
  const factory AuthState.authenticated(UserModel user) = AuthStateAuthenticated;
  const factory AuthState.unauthenticated() = AuthStateUnauthenticated;
  const factory AuthState.error(String message) = AuthStateError;
}

// Usage with pattern matching
Widget build(BuildContext context, WidgetRef ref) {
  final authState = ref.watch(authServiceProvider);

  return authState.when(
    initial: () => CircularProgressIndicator(),
    loading: () => CircularProgressIndicator(),
    authenticated: (user) => Text('Hello, ${user.name}'),
    unauthenticated: () => LoginButton(),
    error: (message) => Text('Error: $message'),
  );
}
```

### Complex Nested Models

```dart
@freezed
class AddressModel with _$AddressModel {
  const factory AddressModel({
    required String street,
    required String city,
    required String country,
  }) = _AddressModel;

  factory AddressModel.fromJson(Map<String, dynamic> json) =>
      _$AddressModelFromJson(json);
}

@freezed
class UserModel with _$UserModel {
  const factory UserModel({
    required String id,
    required String name,
    required AddressModel address,  // Nested model
    required List<String> tags,     // List
    required Map<String, dynamic> metadata,  // Map
  }) = _UserModel;

  factory UserModel.fromJson(Map<String, dynamic> json) =>
      _$UserModelFromJson(json);
}
```

### Custom JSON Serialization

```dart
@freezed
class TimestampModel with _$TimestampModel {
  const factory TimestampModel({
    required String id,
    @JsonKey(name: 'created_at', fromJson: _dateTimeFromTimestamp, toJson: _dateTimeToTimestamp)
    required DateTime createdAt,
    @JsonKey(includeIfNull: false) String? optionalField,
  }) = _TimestampModel;

  factory TimestampModel.fromJson(Map<String, dynamic> json) =>
      _$TimestampModelFromJson(json);
}

DateTime _dateTimeFromTimestamp(int timestamp) =>
    DateTime.fromMillisecondsSinceEpoch(timestamp * 1000);

int _dateTimeToTimestamp(DateTime dateTime) =>
    dateTime.millisecondsSinceEpoch ~/ 1000;
```

### Generic Models

```dart
@Freezed(genericArgumentFactories: true)
class Result<T> with _$Result<T> {
  const factory Result.success(T data) = Success<T>;
  const factory Result.failure(String error) = Failure<T>;

  factory Result.fromJson(
    Map<String, dynamic> json,
    T Function(Object?) fromJsonT,
  ) => _$ResultFromJson(json, fromJsonT);
}

// Usage
Result<UserModel> userResult = Result.success(UserModel(...));
userResult.when(
  success: (user) => print(user.name),
  failure: (error) => print(error),
);
```

## Custom Methods and Getters

### Computed Properties

```dart
@freezed
class UserModel with _$UserModel {
  const UserModel._();  // Required for custom methods

  const factory UserModel({
    required String firstName,
    required String lastName,
    required String email,
    DateTime? lastLoginAt,
  }) = _UserModel;

  // Computed getter
  String get fullName => '$firstName $lastName';

  // Computed getter with logic
  bool get isActive => lastLoginAt != null &&
      DateTime.now().difference(lastLoginAt!).inDays < 30;

  // Custom method
  String getInitials() {
    return '${firstName[0]}${lastName[0]}'.toUpperCase();
  }

  factory UserModel.fromJson(Map<String, dynamic> json) =>
      _$UserModelFromJson(json);
}
```

### Validation Methods

```dart
@freezed
class EmailModel with _$EmailModel {
  const EmailModel._();

  const factory EmailModel({
    required String value,
  }) = _EmailModel;

  bool get isValid {
    final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
    return emailRegex.hasMatch(value);
  }

  String? validate() {
    if (value.isEmpty) return 'Email cannot be empty';
    if (!isValid) return 'Invalid email format';
    return null;
  }

  factory EmailModel.fromJson(Map<String, dynamic> json) =>
      _$EmailModelFromJson(json);
}
```

## Collection Handling

### Lists

```dart
@freezed
class PostListModel with _$PostListModel {
  const PostListModel._();

  const factory PostListModel({
    @Default([]) List<PostModel> posts,
    required int totalCount,
  }) = _PostListModel;

  // Computed properties on lists
  int get count => posts.length;
  bool get isEmpty => posts.isEmpty;
  bool get hasMore => count < totalCount;

  // Filter methods
  List<PostModel> getPublished() =>
      posts.where((post) => post.isPublished).toList();

  PostModel? findById(String id) =>
      posts.firstWhereOrNull((post) => post.id == id);

  factory PostListModel.fromJson(Map<String, dynamic> json) =>
      _$PostListModelFromJson(json);
}
```

### Deep Copying with Modifications

```dart
// Using copyWith for updates
UserModel updatedUser = user.copyWith(
  firstName: 'NewName',
  lastLoginAt: DateTime.now(),
);

// Updating nested models
UserModel updatedAddress = user.copyWith(
  address: user.address.copyWith(
    city: 'New City',
  ),
);

// Updating list items
PostListModel updatedList = postList.copyWith(
  posts: postList.posts.map((post) {
    if (post.id == targetId) {
      return post.copyWith(isPublished: true);
    }
    return post;
  }).toList(),
);
```

## Enum Handling

### Basic Enums with JSON Values

```dart
enum UserRole {
  @JsonValue('admin') admin,
  @JsonValue('user') user,
  @JsonValue('guest') guest,
}

@freezed
class UserModel with _$UserModel {
  const factory UserModel({
    required String id,
    @Default(UserRole.guest) UserRole role,
  }) = _UserModel;

  factory UserModel.fromJson(Map<String, dynamic> json) =>
      _$UserModelFromJson(json);
}
```

### Enhanced Enums (Dart 2.17+)

```dart
enum SocialProvider {
  google('google', 'Google'),
  apple('apple', 'Apple'),
  facebook('facebook', 'Facebook');

  const SocialProvider(this.value, this.displayName);
  final String value;
  final String displayName;

  static SocialProvider fromString(String value) {
    return values.firstWhere((e) => e.value == value);
  }
}

@freezed
class LoginMethodModel with _$LoginMethodModel {
  const factory LoginMethodModel({
    required SocialProvider provider,
    required String token,
  }) = _LoginMethodModel;

  factory LoginMethodModel.fromJson(Map<String, dynamic> json) =>
      _$LoginMethodModelFromJson(json);
}
```

## Error Handling and Validation

### Result Type Pattern

```dart
@freezed
class ValidationResult<T> with _$ValidationResult<T> {
  const factory ValidationResult.valid(T value) = ValidationValid<T>;
  const factory ValidationResult.invalid(List<String> errors) = ValidationInvalid<T>;
}

@freezed
class UserFormModel with _$UserFormModel {
  const UserFormModel._();

  const factory UserFormModel({
    required String email,
    required String password,
    required String confirmPassword,
  }) = _UserFormModel;

  ValidationResult<UserFormModel> validate() {
    final errors = <String>[];

    if (email.isEmpty) errors.add('Email is required');
    if (!email.contains('@')) errors.add('Invalid email format');
    if (password.length < 8) errors.add('Password must be at least 8 characters');
    if (password != confirmPassword) errors.add('Passwords do not match');

    return errors.isEmpty
        ? ValidationResult.valid(this)
        : ValidationResult.invalid(errors);
  }

  factory UserFormModel.fromJson(Map<String, dynamic> json) =>
      _$UserFormModelFromJson(json);
}
```

## Migration from Other Serialization Libraries

### From json_serializable

**Before:**
```dart
@JsonSerializable()
class UserModel {
  final String id;
  final String name;

  UserModel({required this.id, required this.name});

  factory UserModel.fromJson(Map<String, dynamic> json) =>
      _$UserModelFromJson(json);

  Map<String, dynamic> toJson() => _$UserModelToJson(this);
}
```

**After (Freezed):**
```dart
@freezed
class UserModel with _$UserModel {
  const factory UserModel({
    required String id,
    required String name,
  }) = _UserModel;

  factory UserModel.fromJson(Map<String, dynamic> json) =>
      _$UserModelFromJson(json);
}
```

**Benefits:**
- Immutability by default
- `copyWith` automatically generated
- `==` and `hashCode` automatically implemented
- `toString` automatically generated
- Union types support

## Performance Considerations

### When to Use Freezed

**✅ Good for:**
- Domain models (entities, value objects)
- API request/response models
- State models (UI state, app state)
- Configuration models

**❌ Avoid for:**
- Very large lists (use built_collection instead)
- Real-time streaming data (use plain classes)
- Performance-critical hot paths (benchmark first)

### Optimization Tips

```dart
// ✅ Use const constructors when possible
const user = UserModel(id: '1', name: 'John');

// ✅ Use @Default for common values
@freezed
class ConfigModel with _$ConfigModel {
  const factory ConfigModel({
    @Default(true) bool isEnabled,
    @Default('en') String locale,
  }) = _ConfigModel;
}

// ❌ Avoid deep nesting (>3 levels)
// ❌ Avoid large lists in models (use pagination)
```

## Testing Freezed Models

```dart
void main() {
  group('UserModel', () {
    test('creates model with required fields', () {
      const user = UserModel(id: '1', name: 'John');
      expect(user.id, '1');
      expect(user.name, 'John');
    });

    test('copyWith updates fields', () {
      const user = UserModel(id: '1', name: 'John');
      final updated = user.copyWith(name: 'Jane');
      expect(updated.name, 'Jane');
      expect(updated.id, '1');  // Unchanged
    });

    test('equality works correctly', () {
      const user1 = UserModel(id: '1', name: 'John');
      const user2 = UserModel(id: '1', name: 'John');
      expect(user1, user2);
    });

    test('fromJson deserializes correctly', () {
      final json = {'id': '1', 'name': 'John'};
      final user = UserModel.fromJson(json);
      expect(user.id, '1');
      expect(user.name, 'John');
    });

    test('toJson serializes correctly', () {
      const user = UserModel(id: '1', name: 'John');
      final json = user.toJson();
      expect(json, {'id': '1', 'name': 'John'});
    });
  });
}
```

## Common Issues and Solutions

### Issue: Part file not generated

**Solution:**
```bash
# Delete old generated files
find . -name "*.g.dart" -delete
find . -name "*.freezed.dart" -delete

# Regenerate
dart run build_runner build --delete-conflicting-outputs
```

### Issue: JSON serialization not working

**Checklist:**
- [ ] Both part directives present (`.freezed.dart` and `.g.dart`)
- [ ] `fromJson` factory defined
- [ ] Nested models have `fromJson` too
- [ ] Enums use `@JsonValue` annotations
- [ ] Custom converters implemented for non-standard types

### Issue: copyWith not available

**Solution:** Ensure private constructor exists:
```dart
@freezed
class UserModel with _$UserModel {
  const UserModel._();  // ← This is required for custom methods

  const factory UserModel({...}) = _UserModel;
}
```

## Best Practices Summary

1. **Always use const constructors** when possible
2. **Add private constructor** `const Model._();` for custom methods
3. **Use @Default** for optional fields with common values
4. **Prefer union types** for state management
5. **Keep models focused** (single responsibility)
6. **Test serialization** round-trips (JSON → Model → JSON)
7. **Document custom methods** and computed properties
8. **Use validation methods** for business logic
9. **Avoid deep nesting** (>3 levels)
10. **Regenerate after changes** with `build_runner`

Follow these patterns for robust, maintainable Freezed 3.x models in Flutter DDD architecture.
