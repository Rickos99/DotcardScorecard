import { ScoreCard } from "./scorecard.js";

export { GameModel, ScoreEntry };

class ScoreEntry {
    constructor() {
        this.points = 0;
        this.isVictory = false;
        this.isEmpty = true;
    }

    addVictory() {
        this.points = 0;
        this.isVictory = true;
        this.isEmpty = false;
    }

    /**
     *
     * @param {number} points
     * @param {boolean} isVictory
     */
    changeScore(points) {
        this.points = points;
        this.isVictory = false;
        this.isEmpty = false;
    }

    removeScore() {
        this.points = 0;
        this.isVictory = false;
        this.isEmpty = true;
    }

    /**
     *
     * @param {ScoreEntry} o
     */
    copyFrom(o) {
        this.points = o.points;
        this.isVictory = o.isVictory;
        this.isEmpty = o.isEmpty;
    }
}

class GameModel {
    /**
     * @access public
     * @param {GameModel} model
     * @returns {GameModel}
     */
    static initNew(model) {
        const newModel = new GameModel(model.players, model.diceFaces);

        for (let row = 0; row < model.scorecard.length; row++) {
            // Scorecard
            for (let col = 0; col < model.scorecard[row].length; col++) {
                newModel.scorecard[row][col] = Object.assign(new ScoreEntry(), model.scorecard[row][col]);
            }

            // Bonuspoints
            for (let col = 0; col < model.bonusPoints[row].length; col++) {
                newModel.bonusPoints[row][col] = Object.assign(new ScoreEntry(), model.bonusPoints[row][col]);
            }
        }
        return newModel;
    }

    /**
     * @access public
     * @param {Array<string>} players An array of all playernames
     * @param {Array<number>} diceFaces The value of the diceFaces
     */
    constructor(players, diceFaces) {
        this.diceFaces = diceFaces;
        this.players = players;
        this.appendRows();
    }

    /**
     * Append a new row to the end of scorecard with a diceface.
     * @access private
     */
    appendRow() {
        const scorecardRow = Array(this.players.length);
        const bonusRow = Array(4);

        for (let i = 0; i < scorecardRow.length; i++) {
            scorecardRow[i] = new ScoreEntry();
        }
        for (let i = 0; i < bonusRow.length; i++) {
            bonusRow[i] = new ScoreEntry();
        }

        this.scorecard.push(scorecardRow);
        this.bonusPoints.push(bonusRow);
    }

    /**
     * Append a new row to the end of scorecard with a diceface.
     * @access private
     */
    appendRows() {
        this.diceFaces.forEach(diceFace => {
            this.appendRow(diceFace);
        });
    }

    /**
     * Calculate the sum of all scorecard points and bonuspoints for a specific column in the scorecard.
     * @access public
     * @param {number} column The column to calculate the score of. The column must be greater than zero and less than "number of players - 1"
     * @returns {Promise<Number>} The sum of all scorecard points and bonuspoints. The score can also be negative.
     */
    calculateScore(column) {
        return new Promise((resolve, reject) => {
            if (column < 0 || column > this.players.length) {
                reject(
                    `The specified column "${column}" if outside of the allowed range. Allowed interval is [0, ${
                        this.players.length - 1
                    }]`
                );
            }

            let score = 0;
            for (let row = 0; row < this.scorecard.length; row++) {
                let bonusPoints = 0;
                this.bonusPoints[row].forEach(scoreEntry => {
                    bonusPoints += scoreEntry.points;
                });

                const cardEntry = this.scorecard[row][column];
                if (!cardEntry.isVictory && !cardEntry.isEmpty) {
                    score += cardEntry.points + bonusPoints;
                }
            }
            resolve(score);
        });
    }

    /**
     * @access public
     * @returns {Promise<Array<Number>>} Array with sum of the point for each player
     */
    async calculateScoreForAllPlayers() {
        let scores = Array(this.players.length);
        this.players.forEach((player, i) => {
            scores[i] = this.calculateScore(i);
        });

        return new Promise(async (resolve, reject) => {
            resolve(await Promise.all(scores));
        });
    }

    /**
     * @type {Array<number>}
     */
    players = [];

    /**
     * @type {Array<Array<ScoreEntry>>}
     */
    scorecard = [];

    /**
     * @type {Array<Array<ScoreEntry>>}
     */
    bonusPoints = [];

    /**
     * @type {Array<number>}
     */
    diceFaces = [];

    /**
     * @type {string}
     */
    nameOfGame = "currentGame";
}
