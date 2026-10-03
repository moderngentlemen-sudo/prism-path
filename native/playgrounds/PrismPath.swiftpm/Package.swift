// swift-tools-version: 5.9
import PackageDescription
import AppleProductTypes

let package = Package(
    name: "PrismPath",
    platforms: [.iOS("17.0")],
    products: [
        .iOSApplication(
            name: "Prism Path Playgrounds",
            targets: ["PrismPath"],
            bundleIdentifier: "com.yourstudio.prismpath.playgrounds",
            displayVersion: "1.0",
            bundleVersion: "1",
            appIcon: .asset("AppIcon"),
            accentColor: .presetColor(.mint),
            supportedDeviceFamilies: [.pad, .phone],
            supportedInterfaceOrientations: [.portrait, .landscapeLeft, .landscapeRight],
            additionalInfoPlistContentFilePath: "App/Info.plist"
        )
    ],
    dependencies: [
        .package(url: "https://github.com/googleads/swift-package-manager-google-mobile-ads.git", exact: "13.9.0"),
        .package(url: "https://github.com/googleads/swift-package-manager-google-user-messaging-platform.git", exact: "3.1.0")
    ],
    targets: [
        .executableTarget(
            name: "PrismPath",
            dependencies: [
                .product(name: "GoogleMobileAds", package: "swift-package-manager-google-mobile-ads"),
                .product(name: "GoogleUserMessagingPlatform", package: "swift-package-manager-google-user-messaging-platform")
            ],
            path: "App",
            exclude: ["Info.plist"],
            resources: [
                .process("Assets.xcassets"),
                .copy("puzzles.json"),
                .copy("quiet-orbit.wav"),
                .copy("moonrise.wav"),
                .copy("drift.wav"),
                .copy("PrivacyInfo.xcprivacy")
            ],
            linkerSettings: [.unsafeFlags(["-ObjC"])]
        )
    ]
)
