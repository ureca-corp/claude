// Example: Paginated List with Infinite Scroll
// Location: lib/apps/domain/post/pages/list/

import 'package:app/apps/domain/post/models/post_model.dart';
import 'package:app/apps/domain/post/pages/list/components/post_list_item.dart';
import 'package:app/apps/ui/common/async_value_widget.dart';
import 'package:app/global/types/paginated_response.dart';
import 'package:app/apps/infra/common/client/dio_provider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

// --- Provider ---
// @riverpod
class PostList {
  int _page = 1;
  bool _hasMore = true;

  // @override
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
    _hasMore = !paginated.meta.isLast;
    return paginated.items;
  }

  bool get hasMore => _hasMore;

  Future<void> loadMore() async {
    if (!_hasMore) return;
    _page++;
    final newItems = await _fetchPage(_page);
    // state = AsyncData([...state.value ?? [], ...newItems]);
  }
}

// --- Page ---
class PostListPage extends ConsumerStatefulWidget {
  const PostListPage({super.key});

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
      // ref.read(postListProvider.notifier).loadMore();
    }
  }

  @override
  Widget build(BuildContext context) {
    // final postListState = ref.watch(postListProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('게시글 목록')),
      body: const Center(child: Text('See pagination-patterns.md for full example')),
    );
  }
}
