import XCTest
@testable import PrismPath

final class CircuitTests: XCTestCase {
    func testReciprocalPortsAndExit() {
        XCTAssertTrue(Circuit.trace([10,12,0,3],size:2).solved)
        XCTAssertFalse(Circuit.trace([2,12,0,3],size:2).solved)
        XCTAssertFalse(Circuit.trace([10,9,0,3],size:2).solved)
        XCTAssertFalse(Circuit.trace([10,12,0,9],size:2).solved)
    }
    func testRotations() {
        for mask in 1..<16 {
            var m = mask
            for _ in 0..<4 { m = Circuit.rotate(m) }
            XCTAssertEqual(m,mask)
        }
    }
    @MainActor func testEveryBundledPuzzle() {
        let game = GameModel()
        XCTAssertEqual(game.bank.campaign.count,90)
        XCTAssertEqual(game.bank.daily.count,365)
        for p in game.bank.campaign + game.bank.daily {
            XCTAssertTrue(Circuit.illuminate(p.solution,puzzle:p).solved,"Puzzle \(p.id)")
            XCTAssertFalse(Circuit.illuminate(p.initial,puzzle:p).solved,"Puzzle \(p.id)")
        }
    }
    @MainActor func testPaidChapterNeedsEntitlement() {
        let game = GameModel()
        game.select(0,ownsPack:false)
        game.select(30,ownsPack:false)
        XCTAssertEqual(game.index,30)
        game.stars["33"] = 1
        game.select(33,ownsPack:false)
        XCTAssertEqual(game.index,30)
        game.select(33,ownsPack:true)
        XCTAssertEqual(game.index,33)
    }
}
