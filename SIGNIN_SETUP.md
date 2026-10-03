# Additional sign-in providers

This preview retains Sites Sign in with ChatGPT. Auth.js Core handles Apple, Google, Microsoft and Discord as additional providers, using authorization-code flows and its built-in CSRF/state/nonce/PKCE checks as appropriate. It uses a secure, HttpOnly, encrypted seven-day session cookie. All player APIs verify identity server-side. Public leaderboard names remain opt-in.

## Activation

The provider applications must be registered by the owner. No provider credentials were available during implementation. The UI only enables a provider once its credentials, `AUTH_SECRET` and `AUTH_ORIGIN` are configured. Never put secret values into Git, the browser, or chat messages; use the Site's secret settings.

`AUTH_ORIGIN` must be the exact HTTPS origin with no path. This preview uses `https://prism-path-improvements-jason.welcome466084.chatgpt.site`. `AUTH_SECRET` must be a cryptographically random secret of at least 32 characters; preserve it across deployments to preserve sessions. If moving to a custom domain, update the origin and all provider registrations together.

| Provider | Runtime variables | Exact redirect URL for this preview |
| --- | --- | --- |
| Apple | `AUTH_APPLE_ID`, `AUTH_APPLE_SECRET` | `https://prism-path-improvements-jason.welcome466084.chatgpt.site/api/auth/callback/apple` |
| Google | `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | `https://prism-path-improvements-jason.welcome466084.chatgpt.site/api/auth/callback/google` |
| Microsoft | `AUTH_MICROSOFT_ID`, `AUTH_MICROSOFT_SECRET` | `https://prism-path-improvements-jason.welcome466084.chatgpt.site/api/auth/callback/microsoft-entra-id` |
| Discord | `AUTH_DISCORD_ID`, `AUTH_DISCORD_SECRET` | `https://prism-path-improvements-jason.welcome466084.chatgpt.site/api/auth/callback/discord` |

Apple uses a Services ID and a signed JWT client secret from the Apple developer account. Register the web domain and return URL, and renew the secret before its expiration. Apple callbacks use POST, with the library's appropriate state/nonce cookies. Google uses a Web Application OAuth client and requires the consent screen configured for the intended audience. Microsoft is configured for the common tenant; its application registration must support personal Microsoft accounts and organizational accounts. Discord requires an OAuth2 application and the exact redirect URL. Provider-specific branding/domain verification and production review must be completed in their consoles as required.

References: [Auth.js Apple](https://authjs.dev/getting-started/providers/apple), [Google](https://authjs.dev/getting-started/providers/google), [Microsoft](https://authjs.dev/getting-started/providers/microsoft-entra-id), [Discord](https://authjs.dev/getting-started/providers/discord).

## Existing accounts

External identities are namespaced by provider and stable provider subject, so two users with the same email or same subject at different providers cannot take over one another's points or wallet. Automatic linking to an existing ChatGPT profile is intentionally absent. Use the same provider to resume an account. A later explicit account-linking flow must prove control of both identities before migrating or combining progress.

After credentials are configured, test real sign-in, denial/cancellation, sign-out, a second device, and returning access to points and Stardust for every provider. Those live provider checks have not yet been performed. Automated tests validate configuration gating, encrypted-session rejection with an incorrect key, CSRF handling and redirect restrictions.

## Relax Mode

Relax Mode has independent device-local progress, 3×3 or 4×4 routing puzzles, unlimited help/skip/undo, no timer, scoring, leaderboard submission, streak prompts, haptics or advertising interruptions. It introduces no receivers, prisms or fixed tiles and does not escalate difficulty. A separate ambient soundscape fades slowly between sustained chords, with softer connection sounds and an understated completion chord. Audio preferences and play mode are remembered. Reduced-motion preferences and an explicit Still light setting suppress animation. Journey progress, currency and existing monetization behavior in Journey are preserved. No therapeutic efficacy claims are made.
