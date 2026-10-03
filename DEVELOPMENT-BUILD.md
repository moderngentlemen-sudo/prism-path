# Prism Path — improvements build 1

Branch: development/improvements. Baseline: 26a4ed22348a6526d38bc108e481d1c4d56b8f6f.

This is a browser development build. The published site, main branch, original Xcode archive and Swift Playgrounds edition remain unchanged. It is not a compiled iOS app.

## Implemented

- Wider board-first layout, simplified header, settings dialog, controls immediately below the board; ad demonstrations below play controls.
- Existing animated light propagation retained, stronger receiver arrivals, explicit P·A/P·V prism labels, receiver shapes and keyboard arrow navigation.
- Nine named constellation clusters used for selecting all 90 campaign levels, with available/current/completed states and original gating.
- UTC daily completion calendar, previous-month navigation, persistent completion records, and no punitive streak mechanics.
- Interactive practice connection for fixed tiles, split beams, color prisms and paired prisms; first-encounter prompt and replay control.
- Contextual hints prioritize the live frontier, explain dark/wrong-color receivers or closed entrances, and stop on any solved board, including alternate solutions.
- Versioned board snapshots preserve rotations, moves, hints, undo history and elapsed bonus time. Campaign and daily runs are independent. Returning from daily retains chapter context. Incompatible or malformed snapshots are rejected. Session-only preview entitlements are not treated as permanent purchases.
- Remembered music volume, Calm mode, haptics and selected audio; paid audio choices require their session preview entitlement. Restart confirmation protects unfinished boards.
- Opening campaign puzzles 4–15 adjusted to reduce repetitive turning and soften the introduction of locked tiles.

## Opening puzzle review

The baseline par increased from 9 on puzzle 5 to 18 on puzzle 6, then reached 22 on puzzle 9. The new par values for puzzles 4–15 are 3,4,4,5,5,6,6,3,4,5,6,7. Puzzle 11 deliberately reduces repair load while introducing a fixed tile. These are structural pacing improvements, not proof of player enjoyment or optimal minimum solutions.

## Verification

- 19 Node test groups passed, including all 455 enriched puzzle solutions, initially unsolved state, progressive mechanics, hint completion, ad rules, daily selection, restoration integrity, and opening repair bounds.
- TypeScript no-emit check passed.
- Production static build passed.
- Browser visual/interaction QA, VoiceOver, iPad and iPhone device tests were not performed. No native compilation was attempted in this pass.

## Remaining evaluation

Human playtesting is still needed for campaign difficulty and variety, especially levels 16–90. A full native port of these browser improvements, platform purchase verification and device QA are separate work. Existing Xcode and Playgrounds editions are preserved as requested.

## Run the downloadable build

Extract the downloaded build ZIP. From its extracted directory, serve the web folder using a local HTTP server, for example:

```sh
python3 -m http.server 8080 --directory web
```

On Windows with the Python launcher, use `py -m http.server 8080 --directory web`.
Open http://localhost:8080 in a browser. Do not open index.html directly with file://; this build uses module scripts and absolute asset URLs. Keep the local server running while playing. No installation of game dependencies is needed to serve the compiled files.

This build has not replaced the live site. Browser commerce and ads remain demonstrations. Progress remains local to the browser origin. The new version reads legacy scores when available and writes version-2 gameplay storage without overwriting the legacy gameplay save.
