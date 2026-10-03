# Prism Path device playtest

Prepared September 13, 2026. This is a test plan, not a record of completed device tests.

## Short browser session on iPhone and iPad

Record the device, OS, browser, orientation, puzzle, and any reproduction steps.

- Play puzzles 1–3 without coaching. Ask the player to point to the inlet and outlet before turning. Note hesitation and accidental turns.
- Play a fixed-tile and receiver puzzle. Check that tapping its objective marker brings the correct tile into view, that active symbols remain identifiable, and that reaching the exit without all objectives explains what is missing.
- At narrow widths, landscape and 200% text size, check the board, sticky demo banner, objective chips, shop buttons and Next puzzle for overlap or clipped text.
- Complete a puzzle on the move target, then complete a constellation. Check that rewards remain readable and Next puzzle is reachable throughout. Repeat with reduced motion.
- In Relax, select each path style, skip, request help and reload mid-puzzle. Verify that choosing a future style preserves the current path and the separate quiet sky.
- Listen to each instrument for at least two minutes. Compare tile, completion and next-puzzle sounds at a comfortable speaker and headphone volume. Test music mute, effects mute, first-tap playback, app switching and an interruption such as a phone call.
- Earn guest Stardust, reconnect an account and retry synchronization after a network interruption. Confirm the reward credits once, progress becomes spendable, and ownership persists. Use a dedicated test account.
- Revisit an old puzzle and confirm replaying cannot duplicate first-clear or constellation currency. Check that returning after a missed period retains points, Stardust and unlocks.

## Native build prerequisite

The current native source is not present in this workspace, and this Linux environment has neither Xcode nor Swift. Attach the latest native iPhone/iPad source before native integration work. Keep the existing native editions intact while applying browser-approved changes on a separate development branch.

On an Apple build environment, compile the app and run it on iPhone and iPad before treating native support as verified. Configure the intended StoreKit products and AdMob/UMP setup, then use sandbox purchases and test ads to check restoration, consent behavior and both ad placements. The browser's proposed $1/month ad removal must be deliberately reconciled with the native product setup; a browser UI change does not configure an Apple subscription.

## Content work still to schedule

Puzzles 16–90 retain their existing generated layouts. Use first-session playtest findings to author and tune later constellation chapters, preserving old saved-run and queued-reward compatibility as in the first fifteen. Extend Journey background compositions only after listening feedback on the current audio balance.
