import StoreKit
import Foundation
import Combine

@MainActor
final class PurchaseStore: ObservableObject {
    // Register these exact IDs in App Store Connect under your own bundle.
    static let packID = "com.yourstudio.prismpath.afterhours"
    static let auroraID = "com.yourstudio.prismpath.aurora"
    static let sunsetID = "com.yourstudio.prismpath.sunset"
    static let adFreeID = "com.yourstudio.prismpath.adfree"
    static let musicID = "com.yourstudio.prismpath.nightmusic"
    static let sfxID = "com.yourstudio.prismpath.crystalsounds"
    static let productIDs: Set<String> = [packID, auroraID, sunsetID, adFreeID, musicID, sfxID]
    @Published private(set) var products: [Product] = []
    @Published private(set) var owned: Set<String> = []
    @Published private(set) var busy = false
    @Published var message: String?
    private var updates: Task<Void, Never>?
    var ownsAdFree: Bool { owned.contains(Self.adFreeID) }
    var ownsMusic: Bool { owned.contains(Self.musicID) }
    var ownsSfx: Bool { owned.contains(Self.sfxID) }
    var ownsPack: Bool { owned.contains(Self.packID) }

    init() {
        updates = Task { [weak self] in
            for await result in Transaction.updates {
                guard let self else { return }
                if case .verified(let transaction) = result, Self.productIDs.contains(transaction.productID) {
                    await self.refreshEntitlements()
                    await transaction.finish()
                }
            }
        }
    }
    deinit { updates?.cancel() }
    func load() async {
        await refreshEntitlements()
        do { products = try await Product.products(for: Array(Self.productIDs)) }
        catch { message = "The shop is unavailable. Please try again when you’re connected." }
        if products.isEmpty && message == nil { message = "The shop is not available yet. You can keep playing the free puzzles." }
    }
    func refreshEntitlements() async {
        var verified: Set<String> = []
        for await result in Transaction.currentEntitlements {
            if case .verified(let transaction) = result,
               Self.productIDs.contains(transaction.productID),
               transaction.revocationDate == nil,
               transaction.expirationDate == nil || transaction.expirationDate! > Date() {
                verified.insert(transaction.productID)
            }
        }
        owned = verified
    }
    func purchase(_ product: Product) async {
        guard !busy, Self.productIDs.contains(product.id) else { return }
        busy = true; message = nil
        defer { busy = false }
        do {
            switch try await product.purchase() {
            case .success(let result):
                guard case .verified(let transaction) = result else {
                    message = "This purchase couldn’t be verified. No content has been unlocked. Please contact Apple support if you were charged."
                    return
                }
                await refreshEntitlements()
                await transaction.finish()
                message = owned.contains(product.id) ? "Your purchase is ready. Thank you!" : "Your purchase is processing. Try Restore purchases if it doesn’t appear."
            case .pending: message = "Your purchase is awaiting approval. It will unlock after Apple confirms it."
            case .userCancelled: break
            @unknown default: message = "The purchase could not be completed. Please try again."
            }
        } catch { message = "The purchase could not be completed. Please try again." }
    }
    func restore() async {
        guard !busy else { return }; busy = true; message = nil
        defer { busy = false }
        do { try await AppStore.sync(); await refreshEntitlements(); message = owned.isEmpty ? "No purchases were found for this Apple account." : "Your purchases have been restored." }
        catch { message = "Purchases could not be restored. Please try again." }
    }
}
