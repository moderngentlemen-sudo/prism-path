import SwiftUI
import GoogleMobileAds
import UserMessagingPlatform

enum AdPlacement: String, CaseIterable { case banner = "Banner", between = "Between puzzles", both = "Both" }

@MainActor
final class AdController: NSObject, ObservableObject, FullScreenContentDelegate {
    // Official Google test units. Replace only after account and privacy setup.
    static let bannerID = "ca-app-pub-3940256099942544/2435281174"
    static let interstitialID = "ca-app-pub-3940256099942544/4411468910"
    let mode: AdPlacement = .both
    @Published private(set) var adsRemoved = false
    @Published var ready = false
    @Published var presenting = false { didSet { onPresentationChange?(presenting) } }
    var onPresentationChange: ((Bool) -> Void)?
    @Published var privacyRequired = false
    private var began = false, sdkStarted = false, loading = false
    private var interstitial: InterstitialAd?
    private var loadedAt = Date.distantPast
    private var lastBreak = Date()
    private var completions = 0
    private var seen = Set<String>()
    private var continuation: (() -> Void)?

    func setAdFree(_ value: Bool) {
        let changed = adsRemoved != value; adsRemoved = value
        if value { ready = false; interstitial = nil }
        else if changed { if began { refreshPermission() } else { start() } }
    }
    func start() {
        guard !began, !adsRemoved else { return }; began = true
        ConsentInformation.shared.requestConsentInfoUpdate(with: RequestParameters()) { [weak self] error in
            Task { @MainActor in
                guard let self else { return }
                if error == nil { try? await ConsentForm.loadAndPresentIfRequired(from:nil) }
                self.refreshPermission()
            }
        }
    }
    private func refreshPermission() {
        privacyRequired = ConsentInformation.shared.privacyOptionsRequirementStatus == .required
        ready = !adsRemoved && ConsentInformation.shared.canRequestAds
        guard ready else { interstitial = nil; return }
        if !sdkStarted { sdkStarted = true; MobileAds.shared.start() }
        Task { await load() }
    }
    func privacyOptions() async {
        ready = false; interstitial = nil
        try? await ConsentForm.presentPrivacyOptionsForm(from:nil)
        refreshPermission()
    }
    private func load() async {
        guard !adsRemoved, ready, !loading, interstitial == nil else { return }
        loading = true; defer { loading = false }
        do {
            let ad = try await InterstitialAd.load(with:Self.interstitialID,request:Request())
            guard !adsRemoved, ready, ConsentInformation.shared.canRequestAds else { return }
            ad.fullScreenContentDelegate = self; interstitial = ad; loadedAt = Date()
        } catch { interstitial = nil }
    }
    func record(key:String,tutorial:Bool) {
        guard !tutorial, seen.insert(key).inserted else { return }; completions += 1
    }
    func next(_ action: @escaping () -> Void) {
        guard !presenting else { return }
        guard !adsRemoved, ready, ConsentInformation.shared.canRequestAds, mode != .banner,
              completions >= 3, Date().timeIntervalSince(lastBreak) >= 120 else { action(); return }
        guard let ad = interstitial, Date().timeIntervalSince(loadedAt) < 3500 else {
            interstitial = nil; Task { await load() }; action(); return
        }
        continuation = action; presenting = true
        ad.present(from:nil)
    }
    func adDidRecordImpression(_ ad: FullScreenPresentingAd) { lastBreak = Date(); completions = 0 }
    func adDidDismissFullScreenContent(_ ad: FullScreenPresentingAd) { finish() }
    func ad(_ ad: FullScreenPresentingAd, didFailToPresentFullScreenContentWithError error: Error) { finish() }
    private func finish() {
        interstitial = nil; presenting = false
        let action = continuation; continuation = nil; action?()
        Task { await load() }
    }
}

struct AdBanner: UIViewRepresentable {
    @ObservedObject var controller: AdController
    func makeUIView(context: Context) -> BannerView {
        let banner = BannerView(adSize:AdSizeBanner)
        banner.adUnitID = AdController.bannerID; banner.delegate = context.coordinator
        if controller.ready && ConsentInformation.shared.canRequestAds { banner.load(Request()) }
        return banner
    }
    func updateUIView(_ view: BannerView, context: Context) {}
    func makeCoordinator() -> Coordinator { Coordinator(controller) }
    final class Coordinator: NSObject, BannerViewDelegate {
        let controller: AdController
        init(_ controller: AdController) { self.controller = controller }
        func bannerViewWillPresentScreen(_ bannerView: BannerView) { controller.presenting = true }
        func bannerViewDidDismissScreen(_ bannerView: BannerView) { controller.presenting = false }
    }
}
