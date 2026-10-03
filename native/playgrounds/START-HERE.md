# Prism Path — separate Swift Playgrounds edition

## Status

Prepared from prism-path-ios-source-v3.zip for opening in Swift Playgrounds on iPad. NOT compiled, package-resolved, signed, or device-tested. This is source code, not an installable app or a guaranteed successful iPad build. The original Xcode source and browser site have not been modified.

## Open on iPad

1. Install/update Apple's Swift Playgrounds app.
2. Download this ZIP and save it to Files. Tap the ZIP to extract it.
3. Open the extracted PrismPath.swiftpm package with Swift Playgrounds. Open the package, not individual Swift files or Package.swift alone.
4. Allow the two Google packages to download; the initial open requires internet access.
5. Press Run. If a build error occurs, send its complete text and your Swift Playgrounds/iPadOS versions back for diagnosis.

Do not submit this edition to App Store Connect before build, device, privacy and purchase testing. No Apple account, signing team, production ad unit, or product record was invented.

## What remains intact

- All 90 campaign and 365 daily puzzles; progression, hints, timers and reduced-motion handling.
- Original game UI and rules, audio files, icon, verified StoreKit purchase/restoration logic and all six product IDs.
- Google Mobile Ads 13.9.0 and UMP 3.1.0, consent checks and official test ads. No SDKs were silently removed or replaced with mocks.
- The original XCTest file is retained in ReferenceTests outside the app package; run it through the original Xcode project. This package does not claim XCTest execution on iPad.

## Packaging-only changes

- A new AppleProductTypes .swiftpm app manifest replaces the Xcode build container for this edition only.
- Resource loading uses Bundle.module instead of Bundle.main so SwiftPM can locate puzzle JSON and WAV files.
- The existing Info.plist is merged through additionalInfoPlistContentFilePath. The existing privacy manifest is included as a resource; verify final privacy report placement on an Apple build before release.
- A separate placeholder bundle identifier, com.yourstudio.prismpath.playgrounds, avoids overwriting the Xcode app when installed side by side. Choose your own unique identifier and signing team in app settings before distribution.

## Important limitations

The Playgrounds compiler/SDK must support iOS 17 APIs and the exact Google binary dependencies. SwiftPM support alone does not prove those SDKs will compile in your installed Playgrounds version. If a binary/compiler compatibility error occurs, do not change package versions blindly; provide the error. A Mac/Xcode build may still be necessary for the full ad-enabled edition.

StoreKit product IDs are preserved but are still placeholders. A different app bundle does not automatically inherit purchases or product availability from another app. Progress also lives in separate app storage; this conversion does not migrate or sync progress. Testing purchases requires appropriate Apple configuration. Do not make real purchases as part of initial testing.

No iPad-specific layout redesign or gameplay fixes were included; this is a separate packaging conversion. No Swift compiler, Xcode, simulator, or iPad was available in the preparation environment.

## Original archive fingerprint

SHA-256 of the unchanged uploaded prism-path-ios-source-v3.zip:

f9c63bbb4334148961eef4d9d2754718a3dc36a0ed5f1710d68218226ad6d234

The original upload remains the canonical Xcode version. Keep both archives.

## References

- https://developer.apple.com/swift-playground/
- https://developers.google.com/admob/ios/quick-start
- https://github.com/googleads/swift-package-manager-google-mobile-ads/releases/tag/13.9.0

