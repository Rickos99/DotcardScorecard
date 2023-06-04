import { describe, it } from "mocha";
import { deepStrictEqual, strictEqual } from "assert";
import { GameModel, ScoreEntry } from "../public_html/javascript/gamemodel.js";
import { diceFaces } from "../public_html/javascript/diceFaces.js";

describe("Gamemodel", () => {
    describe("CalculateScore()", () => {
        it("Should return 0", async () => {
            const players = ["", "", ""];
            const diceFaces = [9];
            const model = new GameModel(players, diceFaces);

            model.scorecard[0][0].addVictory();

            const scores = await model.calculateScore(0);
            strictEqual(scores, 0);
        });
    });

    describe("CalculateScoreForAllPlayers()", () => {
        it("Should return [0, -6, 30], with bonuspoints", async () => {
            const players = ["", "", ""];
            const diceFaces = [9];
            const model = new GameModel(players, diceFaces);

            model.scorecard[0][0].addVictory();
            model.scorecard[0][1].changeScore(-15);
            model.scorecard[0][2].changeScore(21);

            model.bonusPoints[0][3].changeScore(9);

            const scores = await model.calculateScoreForAllPlayers();
            deepStrictEqual(scores, [0, -6, 30]);
        });

        it("Should return [90, 166, 60], with bonuspoints", async () => {
            const players = ["", "", ""];
            const diceFaces = [9, 8, 7, 6, 5];
            const model = new GameModel(players, diceFaces);

            model.scorecard[0][0].changeScore(45);
            model.scorecard[0][1].changeScore(89);
            model.scorecard[0][2].addVictory();
            model.bonusPoints[0][1].changeScore(6);

            model.scorecard[1][0].addVictory();
            model.scorecard[1][1].changeScore(-5);
            model.scorecard[1][2].changeScore(45);
            model.bonusPoints[1][2].changeScore(6);
            model.bonusPoints[1][3].changeScore(9);

            model.bonusPoints[3][0].changeScore(5);

            model.scorecard[4][0].changeScore(23);
            model.scorecard[4][1].changeScore(45);
            model.scorecard[4][2].addVictory();
            model.bonusPoints[4][0].changeScore(5);
            model.bonusPoints[4][1].changeScore(7);
            model.bonusPoints[4][2].changeScore(4);
            model.bonusPoints[4][3].changeScore(0);

            const scores = await model.calculateScoreForAllPlayers();
            deepStrictEqual(scores, [90, 166, 60]);
        });

        it("Should return [0, -5, 31], no bonuspoints", async () => {
            const players = ["", "", ""];
            const diceFaces = [9];
            const model = new GameModel(players, diceFaces);

            model.scorecard[0][0].addVictory();
            model.scorecard[0][1].changeScore(-5);
            model.scorecard[0][2].changeScore(31);

            const scores = await model.calculateScoreForAllPlayers();
            deepStrictEqual(scores, [0, -5, 31]);
        });
    });

    describe("appendRows()", () => {
        it("Append row with 5 as value of diceface", () => {
            const players = ["", "", ""];
            const diceFaces = [5];
            const model = new GameModel(players, diceFaces);

            model.bonusPoints[0].forEach(item => {
                strictEqual(item.constructor.name, ScoreEntry.name);
            });
            model.scorecard[0].forEach(item => {
                strictEqual(item.constructor.name, ScoreEntry.name);
            });
            strictEqual(model.diceFaces[0], diceFaces[0]);
        });
    });

    describe("appendRows()", () => {
        it("Append rows with 20 dicefaces from 9 through 0 and back up to 9 again", () => {
            const players = ["", ""];
            const diceFaces = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
            const model = new GameModel(players, diceFaces);

            deepStrictEqual(model.diceFaces, diceFaces);
            deepStrictEqual(model.scorecard.length, diceFaces.length);
            deepStrictEqual(model.bonusPoints.length, diceFaces.length);
        });
    });

    describe("InitNew()", () => {
        it("Should initialize a model from an old one and calculate total score", async () => {
            const oldModelString =
                '{"players":["Player 1","Player 2","Player 3"],"scorecard":[[{"points":45,"isVictory":false,"isEmpty":false},{"points":89,"isVictory":false,"isEmpty":false},{"points":0,"isVictory":true,"isEmpty":false}],[{"points":0,"isVictory":true,"isEmpty":false},{"points":-5,"isVictory":false,"isEmpty":false},{"points":45,"isVictory":false,"isEmpty":false}],[{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true}],[{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true}],[{"points":23,"isVictory":false,"isEmpty":false},{"points":45,"isVictory":false,"isEmpty":false},{"points":0,"isVictory":true,"isEmpty":false}],[{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true}],[{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true}],[{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true}],[{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true}],[{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true}],[{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true}],[{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true}],[{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true}],[{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true}],[{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true}],[{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true}],[{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true}],[{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true}],[{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true}],[{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true}]],"bonusPoints":[[{"points":0,"isVictory":false,"isEmpty":true},{"points":6,"isVictory":false,"isEmpty":false},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true}],[{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":6,"isVictory":false,"isEmpty":false},{"points":9,"isVictory":false,"isEmpty":false}],[{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true}],[{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true}],[{"points":5,"isVictory":false,"isEmpty":false},{"points":7,"isVictory":false,"isEmpty":false},{"points":4,"isVictory":false,"isEmpty":false},{"points":0,"isVictory":false,"isEmpty":false}],[{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true}],[{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true}],[{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true}],[{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true}],[{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true}],[{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true}],[{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true}],[{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true}],[{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true}],[{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true}],[{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true}],[{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true}],[{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true}],[{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true}],[{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true},{"points":0,"isVictory":false,"isEmpty":true}]],"diceFaces":[9,8,7,6,5,4,3,2,1,0,0,1,2,3,4,5,6,7,8,9],"nameOfGame":"oldGame"}';
            const oldModelParsed = GameModel.initNew(JSON.parse(oldModelString));

            const players = ["Player 1", "Player 2", "Player 3"];
            const diceFaces = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
            const expectedModel = new GameModel(players, diceFaces);

            expectedModel.scorecard[0][0].changeScore(45);
            expectedModel.scorecard[0][1].changeScore(89);
            expectedModel.scorecard[0][2].addVictory();
            expectedModel.bonusPoints[0][1].changeScore(6);

            expectedModel.scorecard[1][0].addVictory();
            expectedModel.scorecard[1][1].changeScore(-5);
            expectedModel.scorecard[1][2].changeScore(45);
            expectedModel.bonusPoints[1][2].changeScore(6);
            expectedModel.bonusPoints[1][3].changeScore(9);

            expectedModel.scorecard[4][0].changeScore(23);
            expectedModel.scorecard[4][1].changeScore(45);
            expectedModel.scorecard[4][2].addVictory();
            expectedModel.bonusPoints[4][0].changeScore(5);
            expectedModel.bonusPoints[4][1].changeScore(7);
            expectedModel.bonusPoints[4][2].changeScore(4);
            expectedModel.bonusPoints[4][3].changeScore(0);

            deepStrictEqual(oldModelParsed, expectedModel);
            deepStrictEqual(await oldModelParsed.calculateScoreForAllPlayers(), [90, 166, 60]);
        });
    });
});
