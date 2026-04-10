<!-- AUTO-GENERATED FILE: DO NOT EDIT DIRECTLY -->
<!-- Source: docs/engine/01-scaffold-plan.md -->

# Engine Scaffold Plan (Compact Context)

> Auto-generated from the canonical source file. Edit the source markdown, then regenerate compact docs.

## Quick Map
- Expo SDK Version
- Project Initialization
- Dependency List
  - Core Dependencies
  - Ad SDK
  - Dev Dependencies (Included with Template)
- Full Install Commands (in order)
- TypeScript Configuration (tsconfig.json)
- Folder Structure
  - Folder Purposes
- ESLint Configuration
- Build Verification
- What's NOT in This Scaffold

## Key Points
### Expo SDK Version
- `create-expo-app@latest --template default` produces an SDK 54 project (`expo@~54.0.33`)
- Ships with React Native 0.81.5, React 19.1, and the New Architecture enabled by default
- Default template includes TypeScript, expo-router v6, and file-based routing out of the box
- Full community support and compatible dependency ecosystem

### Project Initialization
- Uses the `default` template which includes TypeScript and expo-router (SDK 55+)
- Initialized in the current directory (`.`) to preserve existing `.git`, `.claude`, and `docs` folders
- Expo Router is included with the default template — no separate install needed

### Dependency List
- (No concise bullet/summary found; use grep in source file for details.)

### Core Dependencies
- (No concise bullet/summary found; use grep in source file for details.)

### Ad SDK
- **Note**: `react-native-google-mobile-ads` requires native configuration (AdMob App ID in `app.json` config plugin) and a development build via EAS. We install the package now so it is in the dependency tree, but defer AdMob configuration to the ad integration task. If installation fails in this environment, we note the failure and continue.

### Dev Dependencies (Included with Template)
- (No concise bullet/summary found; use grep in source file for details.)

### Full Install Commands (in order)
- npx create-expo-app@latest . --template default

### TypeScript Configuration (tsconfig.json)
- `strict: true` — enables all strict type checks (noImplicitAny, strictNullChecks, etc.)
- `noUncheckedIndexedAccess` — forces undefined checks on array/object index access
- `noImplicitReturns` — all code paths in a function must return a value
- `noFallthroughCasesInSwitch` — prevents accidental switch fallthrough

### Folder Structure
- src/

### Folder Purposes
- (No concise bullet/summary found; use grep in source file for details.)

### ESLint Configuration
- Use Expo's default ESLint configuration which comes preconfigured with the template:

### Build Verification
- After scaffold is complete, verify with:

### What's NOT in This Scaffold
- AdMob native configuration (requires AdMob account + EAS build setup)
- App icons, splash screens, app.json branding
- Environment variables / `.env` setup
- EAS build configuration (`eas.json`)
