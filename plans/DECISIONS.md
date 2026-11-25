# ADRs
- 001 Expo/RN/R3F native, not WebView: validate GL on device.
- 002 2.5D hybrid, procedural track: shared geometry and physics.
- 003 Fixed-step fictional rule engine: deterministic replay.
- 004 Motion roll + touch fallback, portrait calibration.
- 005 Expo Router/Zustand/RHF/Zod, offline AsyncStorage.
- 006 Android first, no backend/ads/accounts.
- 007 MVP 3 levels, expansion 12; no injury simulation.
Risk: peer version mismatch (CI), sensor sign/latency, motion discomfort, FPS/memory, geometry-vs-curvature, progression corruption, branch/loop scope. Device matrix and playtest required before release.
Implementation deviations: result overlay rather than route, gate markers rather than branch, L11 no loop, L10 slope, incomplete original assets; see docs/IMPLEMENTATION.md.
