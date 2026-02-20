# Pagination Patterns

## PaginatedResponse Model

Location: `lib/global/types/paginated_response.dart`

```dart
@freezed
abstract class PaginationMeta with _$PaginationMeta {
  const factory PaginationMeta({
    required int offset,
    required int pageSize,
    required int pageNumber,
    required int itemCount,
    required int totalItemCount,
    required int totalPageCount,
    required bool isFirst,
    required bool isLast,
  }) = _PaginationMeta;
  factory PaginationMeta.fromJson(Map<String, dynamic> json) => _$PaginationMetaFromJson(json);
}

@Freezed(genericArgumentFactories: true)
abstract class PaginatedResponse<T> with _$PaginatedResponse<T> {
  const factory PaginatedResponse({
    required PaginationMeta meta,
    required List<T> items,
  }) = _PaginatedResponse<T>;
  factory PaginatedResponse.fromJson(Map<String, dynamic> json, T Function(Object?) fromJsonT) => _$PaginatedResponseFromJson(json, fromJsonT);
}
```

## Provider Pattern (Infinite Scroll)

```dart
@riverpod
class PostList extends _$PostList {
  int _page = 1;
  bool _hasMore = true;
  PaginationMeta? _meta;

  @override
  Future<List<PostModel>> build() async {
    _page = 1;
    _hasMore = true;
    return _fetchPage(1);
  }

  Future<List<PostModel>> _fetchPage(int page) async {
    final dio = ref.read(dioProvider);
    final response = await dio.get('/api/posts', queryParameters: {
      'page': page,
      'limit': 20,
    });
    final paginated = PaginatedResponse<PostModel>.fromJson(
      response.data as Map<String, dynamic>,
      (json) => PostModel.fromJson(json as Map<String, dynamic>),
    );
    _meta = paginated.meta;
    _hasMore = !paginated.meta.isLast;
    return paginated.items;
  }

  bool get hasMore => _hasMore;

  Future<void> loadMore() async {
    if (!_hasMore || state.isLoading) return;
    _page++;
    final newItems = await _fetchPage(_page);
    state = AsyncData([...state.value ?? [], ...newItems]);
  }

  Future<void> refresh() async {
    _page = 1;
    _hasMore = true;
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => _fetchPage(1));
  }
}
```

## UI Pattern (ScrollController)

```dart
class PostListPage extends ConsumerStatefulWidget {
  @override
  ConsumerState<PostListPage> createState() => _PostListPageState();
}

class _PostListPageState extends ConsumerState<PostListPage> {
  final _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      ref.read(postListProvider.notifier).loadMore();
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final postListState = ref.watch(postListProvider);

    return Scaffold(
      body: AsyncValueWidget(
        value: postListState,
        emptyCheck: (posts) => posts.isEmpty,
        data: (posts) => ListView.builder(
          controller: _scrollController,
          itemCount: posts.length + 1, // +1 for loading indicator
          itemBuilder: (context, index) {
            if (index == posts.length) {
              return ref.read(postListProvider.notifier).hasMore
                  ? const Center(child: CircularProgressIndicator())
                  : const SizedBox.shrink();
            }
            return PostListItem(post: posts[index]);
          },
        ),
      ),
    );
  }
}
```
