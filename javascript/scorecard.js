import { GameModel } from "./gamemodel.js";
import { diceFaces, generateDiceFace } from "./diceFaces.js";
import { saveToLocalStorage } from "./localstorage.js";

export class ScoreCard {
    /** @type {GameModel} */
    _GameModel;

    /** @type {HTMLTableElement} */
    _Table;

    /** @type {HTMLTableSectionElement} */
    _TableHead;

    /** @type {HTMLTableSectionElement} */
    _TableBody;

    /** @type {HTMLTableSectionElement} */
    _TableFoot;

    /**
     *
     * @param {GameModel} gameModel
     */
    constructor(gameModel) {
        const scorecardTableId = "#scorecard";
        const TableHeaderId = "#card-header-datacell";

        this._GameModel = gameModel;
        this._Table = document.querySelector(scorecardTableId);
        this._TableHead = this._Table.tHead;
        this._TableBody = this._Table.tBodies[0];
        this._TableFoot = this._Table.tFoot;

        this._TableTitle = document.querySelector(TableHeaderId);

        /* FLOW
            set constants

            Load old model // try-catch
            if(no old model){
                open navigation //allows user to define players
                return
            }

            set this.model to old model
            output model to table
        */
    }

    /**
     * @access private
     */
    addPlayersToTable() {
        // Add cells to second header row with each playername.
        const players = this._GameModel.players;
        players.forEach((player, index) => {
            const cell = this._TableHead.rows[1].insertCell(index + 1);
            cell.classList.add("player-header");
            cell.innerText = player;
        });

        // Change number of cells the header spans.
        const currentColSpan = parseInt(this._TableTitle.getAttribute("colspan"));
        this._TableTitle.setAttribute("colspan", currentColSpan + players.length);
    }

    /**
     * @access private
     */
    addTableRows() {
        const numOfPlayers = this._GameModel.players.length;
        this._GameModel.diceFaces.forEach(diceface => {
            const row = this._TableBody.insertRow(-1);

            // Add diceface to row
            const diceFaceCell = row.insertCell(-1);
            diceFaceCell.appendChild(generateDiceFace(diceface));
            diceFaceCell.classList.add("dice-face");

            // Add input fields to row, affected cells are player and bonuspoints cells.
            for (let i = 0; i < numOfPlayers + 4; i++) {
                const isScoreCell = i - numOfPlayers < 0;
                row.insertCell(-1).appendChild(this.generateInputCell(isScoreCell));
            }
        });
    }

    /**
     * @access private
     */
    addTableFoot() {
        const footRow = this._TableFoot.rows[0];
        const numOfPlayers = this._GameModel.players.length;
        for (let i = 0; i < numOfPlayers; i++) {
            footRow.insertCell(-1);
        }
    }

    /**
     * @access private
     * @param {boolean} isScoreCell
     * @returns {HTMLInputElement}
     */
    generateInputCell(isScoreCell) {
        const scoreInput = document.createElement("input");

        scoreInput.setAttribute("type", "tel");
        if (isScoreCell) {
            scoreInput.addEventListener("input", async ev => this.onScoreInputChange(ev, this));
            scoreInput.classList.add("score-input");
        } else {
            scoreInput.addEventListener("input", async ev => this.onBonusInputChange(ev, this));
            scoreInput.classList.add("bonus-input");
        }
        return scoreInput;
    }

    /**
     * @access private
     * @param {InputEvent} ev
     * @param {ScoreCard} scorecard
     */
    async onBonusInputChange(ev, scorecard) {
        const parsedInputValue = parseInt(ev.path[0].value);
        const bonuspointsCol = ev.path[1].cellIndex + 4 - ev.path[2].childElementCount;
        const bonuspointsRow = ev.path[2].rowIndex - ev.path[4].tHead.rows.length;

        if (parsedInputValue < 0 || parsedInputValue > 9) {
            const entry = scorecard._GameModel.bonusPoints[bonuspointsRow][bonuspointsCol];

            // Restore previous value
            if (entry.isEmpty) {
                ev.path[0].value = "";
            } else {
                ev.path[0].value = entry.points;
            }
            alert("Invalid input!");
            return;
        }

        if (isNaN(parsedInputValue)) {
            scorecard._GameModel.bonusPoints[bonuspointsRow][bonuspointsCol].removeScore();
        } else {
            scorecard._GameModel.bonusPoints[bonuspointsRow][bonuspointsCol].changeScore(parsedInputValue);
        }

        await this.outputScoreSummary();
        saveToLocalStorage(scorecard._GameModel);
    }

    /**
     * @access private
     * @param {InputEvent} ev
     * @param {ScoreCard} scorecard
     */
    async onScoreInputChange(ev, scorecard) {
        const rawinputValue = ev.path[0].value;
        const scorecardCol = ev.path[1].cellIndex - 1;
        const scorecardRow = ev.path[2].rowIndex - ev.path[4].tHead.rows.length;

        if (rawinputValue === "-") {
            scorecard._GameModel.scorecard[scorecardRow][scorecardCol].addVictory();
        } else if (!isNaN(parseInt(rawinputValue))) {
            scorecard._GameModel.scorecard[scorecardRow][scorecardCol].changeScore(parseInt(rawinputValue));
        } else {
            scorecard._GameModel.scorecard[scorecardRow][scorecardCol].removeScore();
        }

        await this.outputScore(scorecardCol);
        saveToLocalStorage(scorecard._GameModel);
    }

    /**
     *
     */
    outputModelToTable() {
        // Add player columns, rows, and tablefoot to table
        this.addPlayersToTable();
        this.addTableRows();
        this.addTableFoot();

        const bodyRows = this._TableBody.rows;
        const numOfEntries = this._GameModel.scorecard.length;
        const numOfPlayers = this._GameModel.players.length;

        // Output values to cells
        for (let row = 0; row < numOfEntries; row++) {
            for (let col = 0; col < numOfPlayers + 4; col++) {
                const cellInputField = bodyRows[row].cells[col + 1].children[0];
                if (col < numOfPlayers) {
                    const scoreEntry = this._GameModel.scorecard[row][col];
                    if (!scoreEntry.isEmpty) {
                        if (scoreEntry.isVictory) {
                            cellInputField.value = "-";
                        } else {
                            cellInputField.value = scoreEntry.points;
                        }
                    }
                } else {
                    const bCol = col - numOfPlayers;
                    const scoreEntry = this._GameModel.bonusPoints[row][bCol];
                    if (!scoreEntry.isEmpty) {
                        cellInputField.value = scoreEntry.points;
                    }
                }
            }
        }

        this.outputScoreSummary();
    }

    /**
     * @access private
     * @param {number} column
     */
    async outputScore(column) {
        const score = await this._GameModel.calculateScore(column);
        this._TableFoot.rows[0].cells[column + 1].innerText = score;
    }

    /**
     * @access private
     */
    async outputScoreSummary() {
        const scores = await this._GameModel.calculateScoreForAllPlayers();
        const footRow = this._TableFoot.rows[0];
        scores.forEach((score, col) => {
            footRow.cells[col + 1].innerText = score;
        });
    }
}
