# docs/design/

This folder is the **primary source of truth for UI/UX** of the Pro Kabaddi Sports Platform.

## Status: PENDING IMPORT

The Claude Design project (`Kabaddi Vision Mobile.dc.html` + `support.js`,
project `6f50d191-e3da-411d-95a7-ae05563dc48c`) has **not** been imported yet.
The design-sync tool requires a `/design-login` authorization that cannot be
granted from a headless cloud session.

To import, do one of the following:

1. In Claude Design, use **"Send to Claude Code Web"** on the project — this
   seeds the files into the workspace; then move them under `docs/design/`.
2. Run `/design-login` once from an interactive Claude Code session, then
   re-run the import.
3. Export the files manually and commit them here.

## Expected contents after import

| File | Purpose |
|------|---------|
| `Kabaddi Vision Mobile.dc.html` | Source design (mobile screens) |
| `support.js` | Design runtime / shared helpers imported by the design |
| `design-system.md` | Extracted tokens: colors, typography, spacing, radii, elevation, components (to be written after import) |
| `screens.md` | Screen inventory + navigation map (to be written after import) |
| `flows.md` | User flows per role (to be written after import) |

`design-system.md`, `screens.md` and `flows.md` will be derived from the
imported design files, not invented.
