import Foundation
import Combine
import UIKit
import AVFoundation

struct Receiver: Codable { let at: Int; let color: String }
struct Puzzle: Codable, Identifiable {
    let id: Int
    let size: Int
    let initial: [Int]
    let solution: [Int]
    let path: [Int]
    let par: Int
    let stage: Int
    let paceSeconds: Int
    let locked: [Int]
    let filters: [String:String]
    let receivers: [Receiver]
    let lesson: String
}
struct PuzzleBank: Decodable { let campaign: [Puzzle]; let daily: [Puzzle] }

enum Circuit {
    static func rotate(_ mask: Int) -> Int { ((mask << 1) & 15) | (mask >> 3) }
    static func trace(_ board: [Int], size: Int) -> (lit: Set<Int>, solved: Bool) {
        guard size > 0, board.count == size * size, board[0] & 8 != 0 else { return ([], false) }
        var lit: Set<Int> = [0], queue = [0], k = 0
        let steps = [(-1,0,1,4),(0,1,2,8),(1,0,4,1),(0,-1,8,2)]
        while k < queue.count {
            let at = queue[k], row = at / size, col = at % size
            k += 1
            for (dr, dc, bit, opposite) in steps {
                let r = row + dr, c = col + dc, next = r * size + c
                if r >= 0 && r < size && c >= 0 && c < size && board[at] & bit != 0 && board[next] & opposite != 0 && !lit.contains(next) {
                    lit.insert(next); queue.append(next)
                }
            }
        }
        return (lit, lit.contains(size * size - 1) && board[size * size - 1] & 2 != 0)
    }
    static func illuminate(_ board: [Int], puzzle: Puzzle) -> (lit: Set<Int>, solved: Bool, colors: [Int:Set<String>]) {
        let size = puzzle.size
        var colors: [Int:Set<String>] = [:], queue: [(Int,String)] = [], k = 0
        func add(_ at: Int, _ input: String) {
            let color = puzzle.filters[String(at)] ?? input
            guard !(colors[at]?.contains(color) ?? false) else { return }
            colors[at,default:[]].insert(color); queue.append((at,color))
        }
        if board[0] & 8 != 0 { add(0,"mint") }
        let steps = [(-1,0,1,4),(0,1,2,8),(1,0,4,1),(0,-1,8,2)]
        while k < queue.count {
            let (at,color) = queue[k]; k += 1
            for (dr,dc,bit,opposite) in steps {
                let r = at / size + dr, c = at % size + dc, next = r * size + c
                if r >= 0 && r < size && c >= 0 && c < size && board[at] & bit != 0 && board[next] & opposite != 0 { add(next,color) }
            }
        }
        let lit = Set(colors.keys)
        return (lit,lit.contains(board.count-1) && board[board.count-1] & 2 != 0 && puzzle.receivers.allSatisfy { colors[$0.at]?.contains($0.color) ?? false },colors)
    }
    static func ports(_ mask: Int) -> String {
        let names = ["north", "east", "south", "west"]
        return (0..<4).filter { mask & (1 << $0) != 0 }.map { names[$0] }.joined(separator: " and ")
    }
}

@MainActor
final class GameModel: ObservableObject {
    let bank: PuzzleBank
    @Published var puzzle: Puzzle
    @Published var board: [Int]
    @Published var calmMode = false
    @Published var elapsed: Double = 0
    @Published var pulseTile: Int?
    private var lastTick = Date()
    var remaining: Double { max(0,Double(puzzle.paceSeconds)-elapsed) }
    var intensity: Int { min(4,(puzzle.stage-1)/20) }
    func tick(_ now: Date, paused: Bool) {
        defer { lastTick = now }
        guard moves > 0, !signal.solved, puzzle.paceSeconds > 0, !calmMode, !paused, !audioSuspended else { return }
        elapsed += min(0.25,max(0,now.timeIntervalSince(lastTick)))
    }
    @Published var moves = 0
    @Published var hints = 0
    @Published var index = 0
    @Published var dailyKey: String?
    @Published var stars: [String: Int]
    @Published var theme: String { didSet { UserDefaults.standard.set(theme, forKey: "theme") } }
    @Published var hintIndex: Int?
    @Published var sound = UserDefaults.standard.bool(forKey:"sound") { didSet { UserDefaults.standard.set(sound,forKey:"sound") } }
    @Published var haptics = UserDefaults.standard.bool(forKey:"haptics") { didSet { UserDefaults.standard.set(haptics,forKey:"haptics") } }
    @Published var musicEnabled = (UserDefaults.standard.object(forKey:"musicEnabled") as? Bool) ?? true { didSet { UserDefaults.standard.set(musicEnabled,forKey:"musicEnabled"); updateMusic() } }
    @Published var musicVolume: Double = 0.25 { didSet { musicPlayer?.volume = Float(musicVolume) } }
    @Published private(set) var musicTrack = "quiet-orbit"
    @Published private(set) var soundStyle = "classic"
    @Published private(set) var previewTrack: String?
    private var samplePlayer: AVAudioPlayer?
    private var sampleTask: Task<Void,Never>?
    func selectMusic(_ track: String, ownsPack: Bool) {
        guard ["quiet-orbit","moonrise","drift"].contains(track), track == "quiet-orbit" || ownsPack else { return }
        stopPreview(); musicPlayer?.pause(); musicPlayer = nil; musicTrack = track; musicEnabled = true
    }
    func selectSounds(_ style: String, ownsPack: Bool) {
        guard style == "classic" || (style == "crystal" && ownsPack) else { return }; soundStyle = style
    }
    func applyAudioEntitlements(music: Bool, effects: Bool) {
        if !music && musicTrack != "quiet-orbit" { let wasPlaying = musicEnabled; selectMusic("quiet-orbit",ownsPack:false); musicEnabled = wasPlaying }
        if !effects { soundStyle = "classic" }
    }
    func previewMusic(_ track: String) {
        guard ["quiet-orbit","moonrise","drift"].contains(track), !audioSuspended,
              let url = AppResources.bundle.url(forResource:track,withExtension:"wav") else { return }
        stopPreview(); musicPlayer?.pause()
        try? AVAudioSession.sharedInstance().setCategory(.ambient,mode:.default,options:.mixWithOthers)
        samplePlayer = try? AVAudioPlayer(contentsOf:url); samplePlayer?.volume = Float(musicVolume)
        guard samplePlayer?.play() == true else { updateMusic(); return }
        previewTrack = track
        sampleTask = Task { [weak self] in try? await Task.sleep(nanoseconds:8_000_000_000); guard !Task.isCancelled else { return }; self?.stopPreview() }
    }
    func stopPreview() { sampleTask?.cancel(); sampleTask = nil; samplePlayer?.stop(); samplePlayer = nil; previewTrack = nil; updateMusic() }
    func previewEffects() { feedback(win:true,style:"crystal",preview:true) }
    private var musicPlayer: AVAudioPlayer?
    private var audioSuspended = false
    func suspendAudio(_ value: Bool) { audioSuspended = value; if value { player?.stop(); stopPreview() }; updateMusic() }
    private func updateMusic() {
        guard musicEnabled, !audioSuspended, previewTrack == nil else { musicPlayer?.pause(); return }
        if musicPlayer == nil, let url = AppResources.bundle.url(forResource:musicTrack,withExtension:"wav") {
            musicPlayer = try? AVAudioPlayer(contentsOf:url); musicPlayer?.numberOfLoops = -1
        }
        try? AVAudioSession.sharedInstance().setCategory(.ambient,mode:.default,options:.mixWithOthers)
        musicPlayer?.volume = Float(musicVolume); musicPlayer?.play()
    }
    private var player: AVAudioPlayer?
    private var history: [[Int]] = []

    init() {
        guard let url = AppResources.bundle.url(forResource: "puzzles", withExtension: "json"),
              let data = try? Data(contentsOf: url),
              let bank = try? JSONDecoder().decode(PuzzleBank.self, from: data) else {
            preconditionFailure("The required bundled puzzle bank is missing or invalid.")
        }
        self.bank = bank
        self.puzzle = bank.campaign[0]
        self.board = bank.campaign[0].initial
        self.stars = (UserDefaults.standard.dictionary(forKey: "stars") as? [String:Int] ?? [:]).filter { (1...3).contains($0.value) }
        self.theme = UserDefaults.standard.string(forKey: "theme") ?? "mint"
        let savedIndex = max(0, min(29, UserDefaults.standard.integer(forKey: "lastPuzzle")))
        self.index = savedIndex
        self.puzzle = bank.campaign[savedIndex]
        self.board = bank.campaign[savedIndex].initial
        updateMusic()
    }
    var signal: (lit: Set<Int>, solved: Bool, colors: [Int:Set<String>]) { Circuit.illuminate(board, puzzle: puzzle) }
    var resultStars: Int { hints == 0 && moves <= puzzle.par ? 3 : hints <= 2 && moves <= Int(ceil(Double(puzzle.par) * 1.7)) ? 2 : 1 }
    var canUndo: Bool { !history.isEmpty && !signal.solved }
    var totalStars: Int { stars.values.reduce(0,+) }
    func isUnlocked(_ i: Int) -> Bool { i == 0 || i == 30 || stars[String(i)] != nil || stars[String(i+1)] != nil }
    func select(_ i: Int, ownsPack: Bool) {
        guard bank.campaign.indices.contains(i), (i < 33 || ownsPack), isUnlocked(i) else { return }
        index = i; dailyKey = nil; puzzle = bank.campaign[i]; reset()
        UserDefaults.standard.set(i, forKey: "lastPuzzle")
    }
    func daily(date: Date = Date()) {
        let days = Int(floor(date.timeIntervalSince1970 / 86400))
        let i = ((days % 365) + 365) % 365
        let formatter = DateFormatter(); formatter.dateFormat = "yyyy-MM-dd"; formatter.timeZone = TimeZone(secondsFromGMT: 0); formatter.locale = Locale(identifier: "en_US_POSIX")
        dailyKey = "daily-" + formatter.string(from: date)
        puzzle = bank.daily[i]; reset()
    }
    func reset() { board = puzzle.initial; moves = 0; hints = 0; history = []; hintIndex = nil; elapsed = 0; lastTick = Date(); pulseTile = nil }
    func rotate(_ i: Int) {
        guard board.indices.contains(i), !puzzle.locked.contains(i), !signal.solved else { return }
        remember(); pulseTile = i; Task { [weak self] in try? await Task.sleep(nanoseconds:180_000_000); if self?.pulseTile == i { self?.pulseTile = nil } }; hintIndex = nil; board[i] = Circuit.rotate(board[i]); moves += 1; feedback(win:signal.solved); completeIfNeeded()
    }
    func nudge() {
        guard !signal.solved else { return }
        hintIndex = puzzle.path.first { !puzzle.locked.contains($0) && board[$0] != puzzle.solution[$0] }
    }
    var guideIndex: Int? { hintIndex ?? (dailyKey == nil && puzzle.id < 3 ? puzzle.path.first { board[$0] != puzzle.solution[$0] } : nil) }
    var hintText: String {
        guard let at = hintIndex else { return "" }
        return "Row \(at / puzzle.size + 1), column \(at % puzzle.size + 1): aim the openings \(Circuit.ports(puzzle.solution[at])). The openings must meet the neighboring tiles."
    }
    func applyHint() {
        guard let at = hintIndex, !signal.solved else { return }
        remember(); board[at] = puzzle.solution[at]; hintIndex = nil; moves += 1; hints += 1; feedback(win:signal.solved); completeIfNeeded()
    }
    func undo() { guard canUndo, let old = history.popLast() else { return }; hintIndex = nil; board = old; moves += 1 }
    private func feedback(win: Bool, style: String? = nil, preview: Bool = false) {
        if haptics {
            if win { UINotificationFeedbackGenerator().notificationOccurred(.success) }
            else { UIImpactFeedbackGenerator(style:.light).impactOccurred() }
        }
        guard (sound || preview), !audioSuspended else { return }
        try? AVAudioSession.sharedInstance().setCategory(.ambient,mode:.default,options:.mixWithOthers)
        let rate = 22050, count = win ? 11025 : 3307
        var data = Data()
        func text(_ s: String) { data.append(contentsOf:s.utf8) }
        func word(_ n: UInt16) { var v = n.littleEndian; withUnsafeBytes(of:&v) { data.append(contentsOf:$0) } }
        func long(_ n: UInt32) { var v = n.littleEndian; withUnsafeBytes(of:&v) { data.append(contentsOf:$0) } }
        text("RIFF"); long(UInt32(36+count*2)); text("WAVEfmt "); long(16); word(1); word(1); long(UInt32(rate)); long(UInt32(rate*2)); word(2); word(16); text("data"); long(UInt32(count*2))
        for i in 0..<count {
            let t = Double(i)/Double(rate), fade = pow(1-Double(i)/Double(count),2)
            let crystal = (style ?? soundStyle) == "crystal"
            let frequency = crystal ? (win ? (i < count/3 ? 1046.5 : i < count*2/3 ? 1318.5 : 1568.0) : 880.0) : (win ? (i < count/2 ? 660.0 : 990.0) : 420.0)
            let value = Int16(sin(t*frequency*2*Double.pi)*fade*2000)
            word(UInt16(bitPattern:value))
        }
        player = try? AVAudioPlayer(data:data); player?.play()
    }
    private func remember() { history.append(board); if history.count > 100 { history.removeFirst() } }
    private func completeIfNeeded() {
        guard signal.solved else { return }
        let key = dailyKey ?? String(puzzle.id)
        stars[key] = max(stars[key] ?? 0, resultStars)
        UserDefaults.standard.set(stars, forKey: "stars")
    }
}
