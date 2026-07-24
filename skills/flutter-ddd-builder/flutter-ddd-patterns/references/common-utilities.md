# Common Utilities

## Validators (`lib/global/utils/validators.dart`)

```dart
TextFormField(
  validator: Validators.required,
)

TextFormField(
  validator: Validators.compose([
    Validators.required,
    Validators.minLength(2, fieldName: '제목'),
    Validators.maxLength(100, fieldName: '제목'),
  ]),
)
```

Available: `required`, `email`, `minLength(n)`, `maxLength(n)`, `phone`, `password`, `compose([...])`

## withLoaderOverlay (`lib/global/utils/with_loader_overlay.dart`)

Prerequisite: Wrap with `LoaderOverlay` widget
```dart
// In widget tree
LoaderOverlay(child: Scaffold(...))

// In button handler
onPressed: () async {
  await withLoaderOverlay(context, () async {
    await ref.read(provider.notifier).create(model);
  });
}
```

## ImageCompressor (`lib/global/utils/image_compressor.dart`)

```dart
final compressed = await ImageCompressor.compress(imageBytes, quality: 80);
final small = await ImageCompressor.compressToTargetSize(
  imageBytes: imageBytes,
  targetSizeInBytes: 1024 * 1024,
);
```

## Extensions

### Collection (`lib/global/utils/extensions/collection_ext.dart`)
```dart
final (even, odd) = numbers.partition((n) => n.isEven);
final chunks = items.chunked(3);
```

### DateTime (`lib/global/utils/extensions/date_ext.dart`)
```dart
date.isToday;
date.isSameDay(other);
date.isBetween(start, end);
date.dateOnly; // strips time
```

## Input Formatters (`lib/global/formatters/input_formatters.dart`)

```dart
TextFormField(
  inputFormatters: [AppInputFormatters.phoneWithDash],
)
```

Available: `phoneWithDash`, `businessNumber`, `birthDate`

## DomainExceptionMatcher (`lib/apps/infra/exception/exception_handler.dart`)

```dart
class PostNotFoundMatcher implements DomainExceptionMatcher {
  @override
  bool matches(int? statusCode, String? errorCode) =>
      statusCode == 404 && errorCode == 'POST_NOT_FOUND';
  @override
  AppException toException() =>
      const AppException.business(message: '게시글을 찾을 수 없습니다', code: 'POST_NOT_FOUND');
}

// Usage
ExceptionHandler.handleWithDomainExceptions(error, matchers: [PostNotFoundMatcher()]);
```
