import 'package:flutter/material.dart';

/// Provisional theme. Colors, typography and spacing are replaced with the tokens from
/// docs/design/design-system.md once the design is imported (Phase 0.5).
class AppTheme {
  const AppTheme._();

  static const _seed = Color(0xFFE65100);

  static ThemeData light() => ThemeData(
    colorScheme: ColorScheme.fromSeed(seedColor: _seed),
    useMaterial3: true,
  );

  static ThemeData dark() => ThemeData(
    colorScheme: ColorScheme.fromSeed(
      seedColor: _seed,
      brightness: Brightness.dark,
    ),
    useMaterial3: true,
  );
}
