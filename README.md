# Bloomlings

A React Native / Expo idle game about growing creatures across biomes. Tap, collect, evolve, and rebirth your way through a garden of Bloomlings.

## Tech stack

- **Expo SDK 54** with Expo Router (file-based routing)
- **React Native 0.81** / React 19
- **Zustand** for state (sliced store + selectors)
- **react-native-mmkv** for saves
- **react-native-reanimated** for animations
- **react-native-google-mobile-ads** for monetization
- **TypeScript** (strict)

## Getting started

```bash
npm install
npm start          # Expo dev server
```

Platform-specific entry points:

```bash
npm run android
npm run ios
npm run web
npm run lint
```

## Project structure

```
app/            Expo Router screens (tabs, layouts)
src/            Engine, state, services, types
components/     Shared UI components
constants/      Theme, colors, layout constants
hooks/          Reusable React hooks
assets/         Fonts, images
docs/           Canonical design & engineering docs
docs/compact/   Auto-generated low-token companions (see below)
scripts/        Repo utility scripts
```

## Documentation

Design, economy, content, engine, and UI specs live under `docs/`, alongside `docs/roadmap.md` and `docs/status.md`. Every canonical doc has a token-light companion under `docs/compact/`, mirroring the source tree 1:1. The compact files are the default context for agents, PR reviews, and any other low-token workflow.

### Compact docs workflow

1. **Read `docs/compact/**` first.** Each compact file starts with a `<!-- Source: docs/... -->` header pointing to its canonical source.
2. **Need more detail?** Jump to the source file named in that header and grep for the section you need.
3. **Edit canonical docs only** — never hand-edit files in `docs/compact/`. They carry an `<!-- AUTO-GENERATED FILE: DO NOT EDIT DIRECTLY -->` banner for a reason.
4. **Regenerate after editing** a canonical doc:

   ```bash
   npm run docs:compact
   # equivalent to: python3 docs/build_compact_docs.py
   ```

The generator lives at `docs/build_compact_docs.py`. It walks `docs/content/`, `docs/design/`, `docs/economy/`, `docs/engine/`, `docs/ui/`, plus `docs/roadmap.md` and `docs/status.md`, and writes a compact version of each one into `docs/compact/`. See [`docs/compact/README.md`](docs/compact/README.md) for the full source → compact file map.

## Status

- Current progress: [`docs/status.md`](docs/status.md)
- Phase breakdown: [`docs/roadmap.md`](docs/roadmap.md)
