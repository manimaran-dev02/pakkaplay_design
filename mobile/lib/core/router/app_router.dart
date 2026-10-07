import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/home/presentation/home_screen.dart';
import '../../shared/widgets/placeholder_screen.dart';

class _Tab {
  const _Tab(this.path, this.label, this.icon, this.builder);

  final String path;
  final String label;
  final IconData icon;
  final WidgetBuilder builder;
}

/// Provisional bottom navigation until docs/design/ defines the real structure.
final _tabs = <_Tab>[
  _Tab('/home', 'Home', Icons.home_outlined, (_) => const HomeScreen()),
  _Tab(
    '/matches',
    'Matches',
    Icons.sports_kabaddi_outlined,
    (_) => const PlaceholderScreen(title: 'Matches'),
  ),
  _Tab(
    '/feed',
    'Feed',
    Icons.dynamic_feed_outlined,
    (_) => const PlaceholderScreen(title: 'Feed'),
  ),
  _Tab(
    '/communities',
    'Communities',
    Icons.groups_outlined,
    (_) => const PlaceholderScreen(title: 'Communities'),
  ),
  _Tab(
    '/profile',
    'Profile',
    Icons.person_outline,
    (_) => const PlaceholderScreen(title: 'Profile'),
  ),
];

final appRouterProvider = Provider<GoRouter>((ref) {
  final router = GoRouter(
    initialLocation: '/home',
    routes: [
      StatefulShellRoute.indexedStack(
        builder: (context, state, shell) => _TabScaffold(shell: shell),
        branches: [
          for (final tab in _tabs)
            StatefulShellBranch(
              routes: [
                GoRoute(
                  path: tab.path,
                  builder: (context, _) => tab.builder(context),
                ),
              ],
            ),
        ],
      ),
    ],
  );
  ref.onDispose(router.dispose);
  return router;
});

class _TabScaffold extends StatelessWidget {
  const _TabScaffold({required this.shell});

  final StatefulNavigationShell shell;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: shell,
      bottomNavigationBar: NavigationBar(
        selectedIndex: shell.currentIndex,
        onDestinationSelected: (index) =>
            shell.goBranch(index, initialLocation: index == shell.currentIndex),
        destinations: [
          for (final tab in _tabs)
            NavigationDestination(icon: Icon(tab.icon), label: tab.label),
        ],
      ),
    );
  }
}
