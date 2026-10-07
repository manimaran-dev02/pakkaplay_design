import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:pakka_play/app.dart';
import 'package:pakka_play/features/home/data/system_repository.dart';

void main() {
  Widget app(BackendStatus status) => ProviderScope(
    overrides: [backendStatusProvider.overrideWith((ref) async => status)],
    child: const PakkaPlayApp(),
  );

  testWidgets('home shows backend online', (tester) async {
    await tester.pumpWidget(app(BackendStatus.up));
    await tester.pumpAndSettle();

    expect(find.text('Pakka Play'), findsOneWidget);
    expect(find.text('online'), findsOneWidget);
  });

  testWidgets('home shows backend unreachable', (tester) async {
    await tester.pumpWidget(app(BackendStatus.down));
    await tester.pumpAndSettle();

    expect(find.text('unreachable'), findsOneWidget);
  });

  testWidgets('bottom navigation switches tabs', (tester) async {
    await tester.pumpWidget(app(BackendStatus.up));
    await tester.pumpAndSettle();

    await tester.tap(find.text('Feed'));
    await tester.pumpAndSettle();

    expect(find.widgetWithText(AppBar, 'Feed'), findsOneWidget);
    expect(find.text('Coming soon'), findsOneWidget);
  });
}
