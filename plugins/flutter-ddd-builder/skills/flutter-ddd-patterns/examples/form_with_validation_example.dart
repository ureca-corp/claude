// Example: Form with Validators + withLoaderOverlay
// Location: lib/apps/domain/post/pages/create/

import 'package:app/global/utils/validators.dart';
// import 'package:app/global/utils/with_loader_overlay.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

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

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    // withLoaderOverlay 사용 패턴:
    // await withLoaderOverlay(context, () async {
    //   await ref.read(postCreateProvider.notifier).create(model);
    // });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('게시글 작성')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // 제목 - Validators.compose로 복합 검증
            TextFormField(
              controller: _titleController,
              decoration: const InputDecoration(labelText: '제목'),
              validator: Validators.compose([
                Validators.required,
                Validators.minLength(2, fieldName: '제목'),
                Validators.maxLength(100, fieldName: '제목'),
              ]),
            ),
            const SizedBox(height: 16),

            // 내용
            TextFormField(
              controller: _contentController,
              decoration: const InputDecoration(labelText: '내용'),
              maxLines: 10,
              validator: Validators.compose([
                Validators.required,
                Validators.minLength(10, fieldName: '내용'),
              ]),
            ),
            const SizedBox(height: 24),

            // 생성 버튼
            FilledButton(
              onPressed: _submit,
              child: const Text('게시글 작성'),
            ),
          ],
        ),
      ),
    );
  }
}
