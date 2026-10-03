# Prism Path repository import

Prepared October 3, 2026.

## Browser source

- Source: **Prism Path — Improvements Preview**, saved version **36**.
- Exact source commit: `bd89d7271857835b9e286940d799fb74fddf806f`.
- Recovered history: **42 commits**, including the original browser game.
- Original browser version 4: `26a4ed22348a6526d38bc108e481d1c4d56b8f6f`.
- Original root commit: `523053fcd8fb5b68ca13b2242846e1078ba60c0c`.
- [Commit index](source-history.json) records each original hash, author timestamp and subject.

The browser files and package lock were recovered from the project's source repository. Gameplay and application behavior were not changed during this import. Repository documentation, historical design references, the earlier downloadable build, and the separate native package were added alongside them.

The GitHub repository is initialized with the latest prepared files as a snapshot. Its new import commits do not recreate the 42 original source commits. The complete recovered Git history, including the native/documentation preparation commit, is retained in the separate `prism-path-repository.zip` backup. Source hashes in the commit index refer to that recovered history.

## Additional recovered work

| Original item | Repository location | Treatment |
| --- | --- | --- |
| `prism-path-playgrounds-v1.zip` | `native/playgrounds/` | All package files, resources, setup notes and reference tests extracted without source edits |
| `prism-path-improvements-build-1.zip` | `archives/prism-path-improvements-build-1.zip` | Original ZIP retained byte for byte; earlier browser snapshot |
| `Prism Path: Soft Ribbon vs Particle Stream.png` | `docs/design/light-beam-options.png` | Original image bytes; filename normalized |
| `Prism Path light-routing comparison.png` | `docs/design/light-routing-comparison.png` | Original image bytes; filename normalized |

Original archive SHA-256 checksums:

```text
ee5cab4afcb02023e7d50becb1b5b339b53327a0e15377df124781f53997f7bc  prism-path-playgrounds-v1.zip
d6973eb8b3a48d53aa0a22346b2c428449971efd527ab9c859a7cffee834b9c6  prism-path-improvements-build-1.zip
```

## Verification

Verified with Node.js 24.19.0 and pnpm 11.25.0:

- Frozen-lockfile dependency installation passed.
- `node --experimental-strip-types --test scripts/*.test.ts`: all 12 test files passed.
- `pnpm exec tsc --noEmit`: passed.
- `pnpm build`: passed.
- Browser puzzle data contains 90 campaign entries and 365 daily entries.
- Native archive paths were checked before extraction; all extracted file bytes were preserved.

## Scope limits

No Swift/Xcode compilation, physical-device QA, real sign-in-provider activation, real purchase testing or live-site deployment was performed. The existing native setup notes reference `prism-path-ios-source-v3.zip`; that original Xcode archive was not found among the available saved files. The included Playgrounds package derives from that archive, but does not replace its Xcode project or prove native parity with browser version 36.

Runtime secrets, player database contents and local browser progress are not source files and are not part of this repository import. The existing `.openai/hosting.json` identifies the original hosted project; repository import alone does not trigger a deployment.
