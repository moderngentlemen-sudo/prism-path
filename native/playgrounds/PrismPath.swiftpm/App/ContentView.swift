import SwiftUI
import StoreKit

struct ContentView: View {
    @EnvironmentObject private var game: GameModel
    @EnvironmentObject private var ads: AdController
    @EnvironmentObject private var store: PurchaseStore
    @Environment(\.scenePhase) private var phase
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    private let clock = Timer.publish(every:0.1,on:.main,in:.common).autoconnect()
    @State private var showShop = false
    @State private var showLevels = false
    private let ink = Color(red: 0.043, green: 0.078, blue: 0.094)
    private var beam: Color {
        if game.theme == "aurora" && store.owned.contains(PurchaseStore.auroraID) { return Color(red:0.72,green:0.63,blue:1) }
        if game.theme == "sunset" && store.owned.contains(PurchaseStore.sunsetID) { return Color(red:1,green:0.74,blue:0.49) }
        return Color(red:0.77,green:0.95,blue:0.49)
    }
    private var mayPlay: Bool { game.dailyKey != nil || game.index < 33 || store.ownsPack }
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment:.leading, spacing:20) {
                    HStack { Text("◈ PRISM PATH").font(.headline).tracking(2); Spacer(); Label("\(game.totalStars)",systemImage:"star").foregroundStyle(beam); Button { showShop = true } label: { Image(systemName:"bag").frame(width:44,height:44) }.accessibilityLabel("Open shop") }
                    HStack {
                        Toggle("Sound",isOn:$game.sound)
                        Toggle("Haptics",isOn:$game.haptics)
                    }.font(.subheadline)
                    Toggle("Background music",isOn:$game.musicEnabled).font(.subheadline)
                    HStack { Image(systemName:"music.note"); Slider(value:$game.musicVolume,in:0...1).accessibilityLabel("Music volume") }
                    Toggle("Calm mode · hide bonus timer",isOn:$game.calmMode).font(.subheadline)
                    if ads.adsRemoved { Label("Ad-free · purchased",systemImage:"checkmark.shield").font(.caption) }
                    if ads.privacyRequired { Button("Ad privacy choices") { Task { await ads.privacyOptions() } } }
                    Divider()
                    HStack(alignment:.bottom) { VStack(alignment:.leading,spacing:8) { Text(game.dailyKey != nil ? "DAILY MOMENT" : game.index < 30 ? "FIRST LIGHT" : "AFTER HOURS").font(.caption).tracking(2).foregroundStyle(.secondary); Text(game.dailyKey != nil ? "Today’s light" : String(format:"Puzzle %02d",game.puzzle.id)).font(.largeTitle.weight(.light)) }; Spacer(); VStack(alignment:.trailing){Text("\(game.moves)").font(.title);Text("rotations · aim \(game.puzzle.par)").font(.caption).foregroundStyle(.secondary)} }
                    if mayPlay {
                        Text(game.puzzle.lesson).font(.subheadline).padding(14).frame(maxWidth:.infinity,alignment:.leading).background(beam.opacity(0.1),in:RoundedRectangle(cornerRadius:12))
                        if game.puzzle.paceSeconds > 0 && !game.calmMode {
                            VStack(alignment:.leading,spacing:7) {
                                Text(game.signal.solved ? (game.remaining > 0 ? "Pulse bonus earned" : "Path complete") : game.remaining <= 0 ? "Bonus time ended · keep solving" : game.moves == 0 ? "Pulse bonus · starts on your first turn" : "\(Int(ceil(game.remaining)))s · Pulse bonus").font(.subheadline)
                                ProgressView(value:game.remaining,total:Double(game.puzzle.paceSeconds)).tint(game.remaining < Double(game.puzzle.paceSeconds)*0.25 ? .orange : beam)
                            }.padding(12).background(beam.opacity(0.1),in:RoundedRectangle(cornerRadius:12))
                        }
                        Text("LIGHT IN →").font(.caption).tracking(2).foregroundStyle(beam)
                        LazyVGrid(columns:Array(repeating:GridItem(.flexible(),spacing:7),count:game.puzzle.size),spacing:7) {
                            ForEach(game.board.indices,id:\.self) { i in
                                let isLit = game.signal.lit.contains(i)
                                let color = game.signal.colors[i]?.contains("violet") == true ? Color.purple : game.signal.colors[i]?.contains("amber") == true ? Color.orange : beam
                                Button { game.rotate(i) } label: {
                                    ZStack {
                                        RoundedRectangle(cornerRadius:10).fill(isLit ? color.opacity(0.13) : Color.white.opacity(0.055))
                                        RoundedRectangle(cornerRadius:10).stroke(isLit ? color.opacity(0.55) : Color.white.opacity(0.12),lineWidth:1)
                                        ChannelShape(mask:game.board[i]).stroke(isLit ? color : Color(red:0.27,green:0.38,blue:0.42),style:StrokeStyle(lineWidth:8,lineCap:.round,lineJoin:.round)).clipped()
                                        Circle().fill(isLit ? Color.white : Color.gray).frame(width:6,height:6)
                                        VStack { HStack { if game.puzzle.locked.contains(i) { Image(systemName:"lock.fill") }; if game.puzzle.filters[String(i)] != nil { Text("P").bold() }; Spacer() }; Spacer(); HStack { Spacer(); ForEach(game.puzzle.receivers.filter { $0.at == i },id:\.color) { r in Text(r.color == "mint" ? "◇" : r.color == "amber" ? "A" : "V").bold().foregroundStyle(r.color == "amber" ? Color.orange : r.color == "violet" ? Color.purple : beam).padding(3).background(.black.opacity(0.8),in:Circle()) } } }.font(.caption2).padding(5)
                                        if game.guideIndex == i { RoundedRectangle(cornerRadius:10).stroke(.white,style:StrokeStyle(lineWidth:2,dash:[4])) }

                                    }.aspectRatio(1,contentMode:.fit).contentShape(Rectangle()).scaleEffect(!reduceMotion && game.pulseTile == i ? 1.07 : 1).animation(reduceMotion ? nil : .easeOut(duration:0.18),value:game.pulseTile).shadow(color:isLit ? color.opacity(0.1+Double(game.intensity)*0.08) : .clear,radius:CGFloat(game.intensity*2))
                                }.buttonStyle(.plain).disabled(game.signal.solved || game.puzzle.locked.contains(i)).animation(reduceMotion ? nil : .easeOut(duration:0.25),value:isLit)
                                 .accessibilityLabel("Row \(i / game.puzzle.size + 1), column \(i % game.puzzle.size + 1); \(Circuit.ports(game.board[i])); \(isLit ? "lit" : "unlit")")
                                 .accessibilityHint("Rotate clockwise")
                            }
                        }.padding(10).background(Color.black.opacity(0.3),in:RoundedRectangle(cornerRadius:20))
                        HStack { Spacer();Text("→ LIGHT OUT").font(.caption).tracking(2).foregroundStyle(game.signal.solved ? beam : Color.gray) }
                        if game.signal.solved {
                            VStack(alignment:.leading,spacing:12) {
                                Text(String(repeating:"★",count:game.resultStars)).font(.title2).foregroundStyle(beam).accessibilityLabel("\(game.resultStars) stars")
                                Text("A new star in your sky.").font(.title2)
                                CompletionBurst(beam:beam,intensity:game.intensity).frame(height:50)
                                Button { if game.index == 32 && !store.ownsPack { next() } else { ads.next { next() } } } label: { Label(game.dailyKey != nil ? "Back to journey" : game.index == 89 ? "All puzzles" : "Next puzzle",systemImage:"arrow.right").frame(maxWidth:.infinity).padding(9) }.buttonStyle(.borderedProminent).tint(beam).foregroundStyle(ink)
                            }
                        } else { Text(game.puzzle.stage < 21 ? "Connect the light to the exit." : game.puzzle.stage < 41 ? "Light every diamond receiver and reach the exit." : "Match the receivers: A = amber; V = violet.").font(.subheadline).foregroundStyle(.secondary).frame(maxWidth:.infinity) }
                        if game.hintIndex != nil {
                            VStack(alignment:.leading,spacing:12) { Text(game.hintText).font(.subheadline); HStack { Button("I’ll try it") { game.hintIndex = nil }; Spacer(); Button("Turn it for me") { game.applyHint() } } }.padding().background(beam.opacity(0.1),in:RoundedRectangle(cornerRadius:12))
                        }
                        constellation
                        HStack {
                            Button { game.reset() } label: { Label("Reset",systemImage:"arrow.clockwise").frame(minHeight:44) }
                            Spacer()
                            Button { game.undo() } label: { Label("Undo",systemImage:"arrow.uturn.backward").frame(minHeight:44) }.disabled(!game.canUndo)
                            Spacer()
                            Button { game.nudge() } label: { Label("Nudge",systemImage:"sparkles").frame(minHeight:44) }.disabled(game.signal.solved)
                        }.font(.subheadline)
                        Text("Explanations are free. Automatic turns count as hints. The bonus timer never ends your puzzle.").font(.caption).foregroundStyle(.secondary)
                    } else {
                        Text("After hours is an additional chapter. Purchase it or restore your purchase to continue.").padding(.vertical)
                        Button("Open shop") { showShop = true }.buttonStyle(.borderedProminent)
                    }
                    Divider()
                    HStack { Button { showLevels = true } label: { Label("All puzzles",systemImage:"square.grid.2x2").frame(minHeight:44) };Spacer();Button { game.daily() } label: { Label("Daily moment",systemImage:"sun.max").frame(minHeight:44) } }.font(.subheadline)
                    Text("Your progress stays on this device.").font(.caption).foregroundStyle(.secondary).frame(maxWidth:.infinity)
                }.padding(22).frame(maxWidth:540)
            }.background(ink).tint(beam)
             .safeAreaInset(edge:.bottom) {
                 if ads.ready && ads.mode != .between && !game.signal.solved && (game.dailyKey != nil || game.puzzle.id > 3) {
                     VStack(spacing:5) { Text("ADVERTISEMENT · TEST AD").font(.caption2).foregroundStyle(.secondary); AdBanner(controller:ads).frame(width:320,height:50) }.padding(.vertical,10).frame(maxWidth:.infinity).background(ink)
                 }
             }
             .onChange(of:game.signal.solved) { _, solved in if solved { ads.record(key:game.dailyKey ?? String(game.puzzle.id),tutorial:game.dailyKey == nil && game.puzzle.id <= 3) } }
             .onReceive(clock) { game.tick($0,paused:showShop || showLevels || phase != .active || ads.presenting) }
             .onChange(of:store.owned) { _, _ in ads.setAdFree(store.ownsAdFree); game.applyAudioEntitlements(music:store.ownsMusic,effects:store.ownsSfx) }
             .onChange(of:ads.presenting) { _, showing in game.suspendAudio(showing || phase != .active) }
             .sheet(isPresented:$showShop) { ShopView().presentationDragIndicator(.visible) }
             .sheet(isPresented:$showLevels) { levels.presentationDragIndicator(.visible) }
             .onChange(of:phase) { _, value in game.suspendAudio(value != .active || ads.presenting); if value == .active { Task { await store.refreshEntitlements() } } }
        }
    }
    private var constellation: some View {
        let after = game.dailyKey == nil && game.index >= 30
        let first = after ? 31 : 1
        let count = after ? 60 : 30
        let earned = (first..<(first+count)).filter { game.stars[String($0)] != nil }.count
        return VStack(alignment:.leading,spacing:12) {
            Text("\(after ? "After hours" : "First light") constellation · \(earned) / \(count)").font(.caption)
            LazyVGrid(columns:Array(repeating:GridItem(.flexible()),count:10),spacing:12) {
                ForEach(first..<(first+count),id:\.self) { id in
                    Image(systemName:game.stars[String(id)] == nil ? "circle" : "sparkle").foregroundStyle(game.stars[String(id)] == nil ? Color.gray.opacity(0.4) : beam).font(.caption).accessibilityLabel("Puzzle \(id), \(game.stars[String(id)] == nil ? "not completed" : "completed")")
                }
            }
        }.padding(.vertical,12)
    }
    private func next() {
        if game.dailyKey != nil { game.select(min(29,game.index),ownsPack:store.ownsPack) }
        else if game.index == 89 { showLevels = true }
        else if game.index == 32 && !store.ownsPack { showShop = true }
        else { game.select(game.index+1,ownsPack:store.ownsPack) }
    }
    private var levels: some View {
        NavigationStack {
            ScrollView {
                LazyVGrid(columns:Array(repeating:GridItem(.flexible()),count:5),spacing:12) {
                    ForEach(0..<90,id:\.self) { i in
                        let paywall = i >= 33 && !store.ownsPack
                        Button {
                            if paywall { showLevels = false; DispatchQueue.main.asyncAfter(deadline:.now()+0.4){showShop = true} }
                            else { game.select(i,ownsPack:store.ownsPack);showLevels = false }
                        } label: {
                            VStack(spacing:6){Text("\(i+1)");if paywall { Image(systemName:"lock").font(.caption) }else{Text(String(repeating:"★",count:game.stars[String(i+1)] ?? 0)).font(.caption2)}}.frame(maxWidth:.infinity,minHeight:60).background(Color.white.opacity(0.08),in:RoundedRectangle(cornerRadius:10))
                        }.disabled(!paywall && !game.isUnlocked(i))
                    }
                }.padding()
            }.navigationTitle("Your journey").toolbar { ToolbarItem(placement:.confirmationAction){Button("Done"){showLevels = false}} }
        }
    }
}

struct ChannelShape: Shape {
    var mask: Int
    func path(in rect: CGRect) -> Path {
        var path = Path();let center = CGPoint(x:rect.midX,y:rect.midY)
        let ends = [CGPoint(x:rect.midX,y:rect.minY),CGPoint(x:rect.maxX,y:rect.midY),CGPoint(x:rect.midX,y:rect.maxY),CGPoint(x:rect.minX,y:rect.midY)]
        for i in 0..<4 where mask & (1 << i) != 0 { path.move(to:center);path.addLine(to:ends[i]) }
        return path
    }
}

struct ShopView: View {
    @EnvironmentObject private var game: GameModel
    @EnvironmentObject private var ads: AdController
    @EnvironmentObject private var store: PurchaseStore
    @Environment(\.dismiss) private var dismiss
    private let offers = [(PurchaseStore.adFreeID,"Remove ads","Permanently removes banners and between-puzzle ads."),(PurchaseStore.packID,"After hours","60 puzzles with branches, paired color prisms and fixed tiles. Restore a second constellation."),(PurchaseStore.auroraID,"Aurora","A violet light palette. Purely cosmetic."),(PurchaseStore.sunsetID,"Sunset","A warm amber light palette. Purely cosmetic."),(PurchaseStore.musicID,"Night music","Two original looping tracks: Moonrise and Drift."),(PurchaseStore.sfxID,"Crystal sounds","Bell-like tile sounds and a crystalline completion chime.")]
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment:.leading,spacing:24) {
                    Text("A little more light.").font(.largeTitle.weight(.light))
                    Text("Permanent additions. No subscriptions.").foregroundStyle(.secondary)
                    ForEach(offers,id:\.0) { offer in
                        let (id,name,description) = offer
                        VStack(alignment:.leading,spacing:12) {
                            Text(name).font(.title2);Text(description).font(.subheadline).foregroundStyle(.secondary)
                            if store.owned.contains(id) {
                                Label("Purchased",systemImage:"checkmark.circle").font(.caption)
                                if id == PurchaseStore.packID { Button("Open chapter") { game.select(30,ownsPack:true); dismiss() }.buttonStyle(.borderedProminent) }
                                else if id == PurchaseStore.auroraID || id == PurchaseStore.sunsetID { Button("Use palette") { game.theme = id == PurchaseStore.auroraID ? "aurora" : "sunset" }.buttonStyle(.borderedProminent) }
                                else if id == PurchaseStore.adFreeID { Text("Both ad placements are disabled.").font(.caption) }
                                else if id == PurchaseStore.musicID { Text("Choose your track below.").font(.caption) }
                                else if id == PurchaseStore.sfxID { Button("Use Crystal sounds") { game.selectSounds("crystal",ownsPack:store.ownsSfx) }.buttonStyle(.borderedProminent) }
                            } else if let product = store.products.first(where:{$0.id == id}) {
                                Button("Buy once · \(product.displayPrice)") { Task { await store.purchase(product) } }.buttonStyle(.borderedProminent).disabled(store.busy)
                            } else { Text("Currently unavailable").font(.subheadline).foregroundStyle(.secondary) }
                        }.padding(20).frame(maxWidth:.infinity,alignment:.leading).background(Color.white.opacity(0.06),in:RoundedRectangle(cornerRadius:18))
                    }
                    Button("Play 3 free After hours samples") { game.select(30,ownsPack:store.ownsPack); dismiss() }.buttonStyle(.bordered)
                    Text("Listen before you choose").font(.title2)
                    ForEach([("quiet-orbit","Quiet Orbit"),("moonrise","Moonrise"),("drift","Drift")],id:\.0) { track in
                        VStack(alignment:.leading,spacing:8) {
                            Text(track.1).font(.headline)
                            HStack {
                                Button(game.previewTrack == track.0 ? "Stop preview" : "Preview 8 sec") { if game.previewTrack == track.0 { game.stopPreview() } else { game.previewMusic(track.0) } }
                                Spacer()
                                Button(game.musicTrack == track.0 ? "Selected" : "Use track") { game.selectMusic(track.0,ownsPack:store.ownsMusic) }.disabled(track.0 != "quiet-orbit" && !store.ownsMusic)
                            }
                            if track.0 != "quiet-orbit" && !store.ownsMusic { Text("Included with the Night music purchase.").font(.caption).foregroundStyle(.secondary) }
                        }
                    }
                    Button("Preview Crystal completion chime") { game.previewEffects() }
                    Button("Use included classic sounds") { game.selectSounds("classic",ownsPack:false) }
                    Button("Use free First light palette"){game.theme = "mint"}
                    Button("Restore purchases"){Task{await store.restore()}}.disabled(store.busy)
                    Button("Refresh shop"){Task{await store.load()}}.disabled(store.busy)
                    if store.busy { ProgressView("Connecting to Apple…") }
                    if let message = store.message { Text(message).font(.subheadline).accessibilityAddTraits(.updatesFrequently) }
                    Text("Purchases are confirmed by Apple. No extra lives, paid hints, subscriptions or randomized purchases.").font(.caption).foregroundStyle(.secondary)
                }.padding(24)
            }.toolbar { ToolbarItem(placement:.confirmationAction){Button("Done"){dismiss()}} }
        }
    }
}

struct CompletionBurst: View {
    let beam: Color
    let intensity: Int
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var expanded = false
    var body: some View {
        ZStack {
            ForEach(0..<(8+intensity*4),id:\.self) { i in
                Circle().fill(beam).frame(width:4,height:4)
                    .offset(x:expanded ? CGFloat(25+intensity*8) : 0)
                    .rotationEffect(.degrees(Double(i)*360/Double(8+intensity*4)))
                    .opacity(expanded ? 0 : 1)
            }
            Image(systemName:"sparkles").foregroundStyle(beam)
        }.onAppear { guard !reduceMotion else { return }; withAnimation(.easeOut(duration:1.2)) { expanded = true } }
    }
}
