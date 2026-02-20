# Theme Dual Mode

## 선택 기준

| 조건 | 사용 모드 | 호출 |
|------|----------|------|
| 피그마 디자인 + 토큰 JSON | Token 모드 | `AppTheme.fromTokens()` |
| 기획만 있음 / Domain Book 시작 | Seed 모드 | `AppTheme.fromSeed(seedColor: Colors.blue)` |

## main.dart 설정

```dart
// Seed 모드 (기본)
theme: AppTheme.fromSeed(seedColor: Colors.blue),
darkTheme: AppTheme.fromSeed(seedColor: Colors.blue, brightness: Brightness.dark),

// Token 모드
theme: AppTheme.fromTokens(),
darkTheme: AppTheme.fromTokens(brightness: Brightness.dark),
```

## 토큰 직접 사용

AppSpacing, AppRadius는 테마 모드와 무관하게 직접 사용:
```dart
Padding(padding: EdgeInsets.all(AppSpacing.spacing4)) // 16.0
Container(decoration: BoxDecoration(borderRadius: AppRadius.radiusMd)) // 8.0
```

## Theme 간접 사용 (양쪽 모드 호환)

```dart
final cs = Theme.of(context).colorScheme;
final tt = Theme.of(context).textTheme;

Text('Title', style: tt.headlineSmall);
Icon(Icons.home, color: cs.primary);
Container(color: cs.surface);
```
