# Pakka Play — mobile (Flutter)

Players, fans and team managers app. See the root `DEVELOPMENT.md` for setup.

```bash
flutter pub get
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:8080   # Android emulator → host
flutter analyze && flutter test
```

Structure: `lib/core` (config, network, auth, router, theme), `lib/shared/widgets`,
`lib/features/<feature>/{data,domain,presentation}`.
