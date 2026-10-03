# Rewarded Journey development build

Branch: `development/rewarded-journey`.
Baseline preview: version 34, source `22a27b6aff5e95e4090624cd6501e1999ca53382`.
Rollback tag: `checkpoint/before-rewarded-journey`.

## Scope

- One completion summary brings together points, Pulse and move-target rewards. The target flourish starts after the path connects; Stardust waits until that flourish ends. A new star then receives a trail of light. Next puzzle is immediately available and remains reachable while reading results. Motion preferences bypass staged reveals.
- Completing a constellation highlights the newly revealed panorama region and pulls back to the connected picture. Opening the sky from the result selects the current constellation.
- Fifteen authored opening puzzles teach straight connections, corners, detours, larger boards and required fixed tiles. Each has a named intention and a verified minimum move target. Puzzles 1–6 use 3×3 boards, then 4×4 boards introduce more room. Locked tiles still begin at 11; that first fixed-tile puzzle takes three turns.
- Previous opening definitions remain available for restoring unfinished saves and verifying older queued or guest completions. Earned scores, stars and wallet history remain intact. Each puzzle retains its reward identity, preventing fresh first-clear currency from replaying a revised board.

## Verification

The automated suite covers all 455 puzzle solutions, first-15 minimum move targets via an independent exhaustive route search, saved-run compatibility, old reward history validation, score calculations and reward deduplication. TypeScript and the production build are checked before publication.

For the first pass above, browser visual QA, listening tests and iPhone/iPad device testing were not performed. Native projects are unchanged.

## Second pass: gentle variety and clearer goals (September 13, 2026)

Baseline: preview version 35, `a49a4cb5b0917e51ec09484281647c94764f6bb4`.
Rollback tag: `checkpoint/before-gentle-variety`.

- Three Relax choices: Small paths (3×3), Flowing paths (4×4), Open exploration (5×5). Larger exploration boards need only four route repairs. The choice applies to the next board; old saves and the current unfinished path are preserved. Help, undo and skipping remain unlimited, with no score, timer or currency incentives.
- Required connections appear together above the Journey board. Tapping a marker highlights and brings its tile into view. Activated receivers keep their diamond/A/V symbol, fixed tiles receive a checkmark, and missing objectives remain highlighted when the exit is lit. Counts, symbols and written states carry meaning independently of color.
- All nine constellation groups now have a clear focus in the journey map, with finale guidance on each tenth puzzle. These describe existing mechanics; only the first fifteen puzzles are hand-authored. Authoring and tuning the remaining 75 is still a future content pass.
- Relax piano, strings and chimes now share a two-minute composition with three related phrases, rather than a forty-second repetition. The latest tile, completion and next-puzzle sound files are byte-for-byte unchanged. Journey music and celebration arrangements are unchanged in this pass.
- Every Stardust unlock shows earned progress, remaining currency, ownership and a preview, including for guests. Pending local currency contributes to visible progress but cannot be spent until credited. Palette previews do not grant access. Account streak wording welcomes returning players without changing reward calculations.
- The existing banner position and frequency rules remain in place. Native purchases, ads and third-party provider configuration require their existing external setup.
- The preview development script now invokes Vite with the supported host settings, resolving the older Vinext CLI startup mismatch.

Verification: 47 automated checks, TypeScript and production build. Desktop browser interaction/visual checks cover Relax style selection, a 25-tile board, assisted completion, reload restoration, guest unlock previews and required-tile highlighting. Browser QA uses a separate local environment without the live player database, so authenticated synchronization was not tested end to end. No listening test or physical-device test is claimed. See `PLAYTEST.md` for the remaining device work.
