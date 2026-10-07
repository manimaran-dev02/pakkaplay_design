import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/system_repository.dart';

/// Phase 1 home: confirms the app can reach the backend.
class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final status = ref.watch(backendStatusProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Pakka Play')),
      body: RefreshIndicator(
        onRefresh: () => ref.refresh(backendStatusProvider.future),
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            ListTile(
              title: const Text('Backend'),
              trailing: status.when(
                data: (s) =>
                    Text(s == BackendStatus.up ? 'online' : 'unreachable'),
                loading: () => const SizedBox.square(
                  dimension: 20,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
                error: (_, _) => const Text('unreachable'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
