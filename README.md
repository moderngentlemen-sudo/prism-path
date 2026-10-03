# Prism Path

A light-routing puzzle game with Journey and Relax modes, constellation progression, original audio, and browser and Swift Playgrounds editions.

## Project contents

| Location | Contents |
| --- | --- |
| `app/`, `lib/`, `public/` | Latest browser implementation: improvements version 36 |
| `lib/content/puzzles.json` | 90 campaign puzzles and 365 daily puzzles |
| `scripts/` | Existing gameplay, progression, account, reward and audio checks; content tools |
| `db/` | Player-storage schema and Cloudflare D1 connection |
| `native/playgrounds/` | Preserved Swift Playgrounds v1 source, resources and reference tests |
| `docs/design/` | Earlier light-beam design comparisons |
| `docs/source-history.json` | Index of the 42 recovered browser-source commits |
| `archives/` | Original downloadable improvements build 1, retained as a historical snapshot |

The browser source includes animated energy paths, receivers and prisms, resumable puzzles, Journey rewards and Stardust, player/leaderboard APIs, and a separate Relax experience with instrument choices. Account providers require their own runtime configuration. Browser advertisements and monetary purchases remain demonstrations; the native package has separate StoreKit and test-ad integration.

## Run the browser project

Use Node.js 24 and pnpm. This import was checked with Node.js 24.19.0 and pnpm 11.25.0. Keep the supplied lockfile.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open the local address printed by Vite. The full application uses server routes and a Cloudflare D1 binding; it is not a single HTML file that can be opened directly. Player storage and real sign-in depend on the configured runtime. See [SIGNIN_SETUP.md](SIGNIN_SETUP.md) for provider requirements.

## Verify and build

```sh
node --experimental-strip-types --test scripts/*.test.ts
pnpm exec tsc --noEmit
pnpm build
```

All 12 existing test files, TypeScript checking and the production build passed when this repository was assembled on October 3, 2026. These checks do not substitute for device or real-provider testing. See [PLAYTEST.md](PLAYTEST.md).

## Swift Playgrounds edition

Open `native/playgrounds/PrismPath.swiftpm` in Apple's Swift Playgrounds, following [the preserved setup notes](native/playgrounds/START-HERE.md).

This is an earlier native edition. It has not been updated with every later browser improvement, and it was not compiled or device-tested during this import. The separate original Xcode archive referenced by those notes was not available in the retrieved project files.

## History and provenance

The imported browser baseline is commit `bd89d7271857835b9e286940d799fb74fddf806f`, improvements version 36. The recovered source history includes the original browser version 4 at `26a4ed22348a6526d38bc108e481d1c4d56b8f6f`.

GitHub starts with a snapshot import of the prepared project. The original 42 source commits are indexed in `docs/source-history.json`; their complete Git objects and history are preserved separately in the `prism-path-repository.zip` backup prepared for the owner. Original hashes in the index are source-provenance identifiers, not commits in GitHub's snapshot history.

See [docs/IMPORT.md](docs/IMPORT.md) for the exact sources and preserved archive fingerprints. Earlier development notes describe earlier snapshots; this README identifies the assembled repository's current contents.

Creating this repository does not publish a new game version or activate payments, advertisements, provider accounts or Apple distribution. Existing third-party license notices are retained. No new open-source license is assigned by this import.
