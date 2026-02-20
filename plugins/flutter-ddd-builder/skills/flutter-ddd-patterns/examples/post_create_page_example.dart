import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:app/apps/domain/post/models/post_create_model.dart';
import 'package:app/apps/domain/post/pages/create/post_create_provider.dart';

/// Example: ConsumerStatefulWidget with ref.listen for state-driven side effects.
///
/// Key patterns:
/// - ref.listen in build() for snackbar/navigation on state change
/// - _submit() only triggers action, does NOT read state manually after await
/// - ref.watch for loading state to disable UI
class PostCreatePage extends ConsumerStatefulWidget {
  const PostCreatePage({super.key});

  @override
  ConsumerState<PostCreatePage> createState() => _PostCreatePageState();
}

class _PostCreatePageState extends ConsumerState<PostCreatePage> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _contentController = TextEditingController();

  @override
  void dispose() {
    _titleController.dispose();
    _contentController.dispose();
    super.dispose();
  }

  /// Action method: trigger만 하고 state 읽기는 ref.listen에 위임
  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    final model = PostCreateModel(
      title: _titleController.text.trim(),
      content: _contentController.text.trim(),
    );

    // ✅ action만 호출. await 후 state를 수동으로 읽지 않음
    await ref.read(postCreateProvider.notifier).create(model);
  }

  @override
  Widget build(BuildContext context) {
    // ✅ ref.listen: 상태 변경에 따른 side effect (snackbar, navigation)
    ref.listen(postCreateProvider, (_, next) {
      next.whenOrNull(
        data: (post) {
          if (post != null) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('게시글이 생성되었습니다')),
            );
            Navigator.pop(context, true);
          }
        },
        error: (error, _) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('오류: $error')),
          );
        },
      );
    });

    // ✅ ref.watch: UI 렌더링용
    final createState = ref.watch(postCreateProvider);
    final isLoading = createState.isLoading;

    return Scaffold(
      appBar: AppBar(title: const Text('게시글 작성')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            TextFormField(
              controller: _titleController,
              decoration: const InputDecoration(labelText: '제목'),
              enabled: !isLoading,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _contentController,
              decoration: const InputDecoration(labelText: '내용'),
              maxLines: 10,
              enabled: !isLoading,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: isLoading ? null : _submit,
              child: isLoading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('게시글 작성'),
            ),
          ],
        ),
      ),
    );
  }
}
