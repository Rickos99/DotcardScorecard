import { describe, it } from "mocha";
import { deepStrictEqual, strictEqual } from "assert";
import { ScoreEntry } from "../javascript/gamemodel.js";

describe("ScoreEntry", () => {
    describe("addVictory()", () => {
        it("Should be a non-empty entry with 0 points and a victory", async () => {
            const scoreEntry = new ScoreEntry();
            scoreEntry.addVictory();

            const excpected = new ScoreEntry();
            excpected.points = 0;
            excpected.isVictory = true;
            excpected.isEmpty = false;

            deepStrictEqual(scoreEntry, excpected);
        });
    });

    describe("changeScore()", () => {
        it("Should be a non-empty entry with 89 points", async () => {
            const scoreEntry = new ScoreEntry();
            scoreEntry.changeScore(89);

            const excpected = new ScoreEntry();
            excpected.points = 89;
            excpected.isVictory = false;
            excpected.isEmpty = false;

            deepStrictEqual(scoreEntry, excpected);
        });
    });

    describe("removeScore()", () => {
        it("Should be an empty entry", async () => {
            const scoreEntry = new ScoreEntry();
            scoreEntry.changeScore(89);
            scoreEntry.removeScore();

            const excpected = new ScoreEntry();
            excpected.points = 0;
            excpected.isVictory = false;
            excpected.isEmpty = true;

            deepStrictEqual(scoreEntry, excpected);
        });
    });
});
