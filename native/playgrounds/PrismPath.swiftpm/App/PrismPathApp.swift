import SwiftUI
import UIKit

@main
struct PrismPathApp: App {
    @StateObject private var game = GameModel()
    @StateObject private var ads = AdController()
    @StateObject private var store = PurchaseStore()
    var body: some Scene {
        WindowGroup {
            ContentView().environmentObject(game).environmentObject(store).environmentObject(ads)
                .preferredColorScheme(.dark)
                .task { ads.onPresentationChange = { showing in game.suspendAudio(showing || UIApplication.shared.applicationState != .active) }; await store.load(); game.applyAudioEntitlements(music:store.ownsMusic,effects:store.ownsSfx); ads.setAdFree(store.ownsAdFree); ads.start() }
        }
    }
}
