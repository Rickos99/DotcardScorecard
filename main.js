window.onload = () => {
    const oldGame = loadModelFromLocalStorage();
    if (oldGame === null) {
        const players = prompt("Enter player name(s), seperate names with comma");
        model.players = players.split(/\s*,\s*/);
        for (let i = 9; i >= 0; i--) {
            addRowToModel(i);
        }
        for (let i = 0; i <= 9; i++) {
            addRowToModel(i);
        }
    } else {
        console.log("Loaded old game");
        model = oldGame;
    }

    outputModelToTable();
};

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

let model = {
    players: [],
    scorecard: [],
    bonusPoints: [],
    diceFaces: [],
};

const oldGameStorageKey = "oldGame";
const diceFaces = {
    0: {
        color: "",
        layout: [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
        ],
    },
    1: {
        color: "DeepSkyBlue",
        layout: [
            [0, 0, 0],
            [0, 1, 0],
            [0, 0, 0],
        ],
    },
    2: {
        color: "HotPink",
        layout: [
            [0, 0, 1],
            [0, 0, 0],
            [1, 0, 0],
        ],
    },
    3: {
        color: "Brown",
        layout: [
            [0, 0, 1],
            [0, 1, 0],
            [1, 0, 0],
        ],
    },
    4: {
        color: "White",
        layout: [
            [1, 0, 1],
            [0, 0, 0],
            [1, 0, 1],
        ],
    },
    5: {
        color: "Black",
        layout: [
            [1, 0, 1],
            [0, 1, 0],
            [1, 0, 1],
        ],
    },
    6: {
        color: "ForestGreen",
        layout: [
            [1, 0, 1],
            [1, 0, 1],
            [1, 0, 1],
        ],
    },
    7: {
        color: "Yellow",
        layout: [
            [1, 0, 1],
            [1, 1, 1],
            [1, 0, 1],
        ],
    },
    8: {
        color: "Purple",
        layout: [
            [1, 1, 1],
            [1, 0, 1],
            [1, 1, 1],
        ],
    },
    9: {
        color: "red",
        layout: [
            [1, 1, 1],
            [1, 1, 1],
            [1, 1, 1],
        ],
    },
};

/**
 *
 * @param {Number} faceValue
 * @returns {SVGSVGElement}
 */
function createDiceFace(faceValue) {
    const face = diceFaces[faceValue];
    const faceColor = face.color;
    const radius = 7;
    const margin = 2;
    const canvasSize = (radius * 2 + margin) * 3;

    const svgNode = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
    );
    svgNode.setAttributeNS(null, "viewBox", `0 0 ${canvasSize} ${canvasSize}`);

    for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
            if (face.layout[y][x] !== 1) continue;
            const centerX = radius * (x + 1) + x * (radius + margin) + 1;
            const centerY = radius * (y + 1) + y * (radius + margin) + 1;

            const circleNode = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "circle"
            );
            circleNode.setAttributeNS(null, "stroke", "black");
            circleNode.setAttributeNS(null, "fill", faceColor);
            circleNode.setAttributeNS(null, "cx", centerX);
            circleNode.setAttributeNS(null, "cy", centerY);
            circleNode.setAttributeNS(null, "r", radius);
            svgNode.appendChild(circleNode);
        }
    }
    return svgNode;
}

/**
 *
 * @param {number} diceFaceValue
 */
function addTableRow(diceFaceValue) {
    const table = document.querySelector("#scorecard");
    const newRow = table.tBodies[0].insertRow();

    const diceFaceCell = document.createElement("td");
    diceFaceCell.classList.add("dice-face");
    diceFaceCell.appendChild(createDiceFace(diceFaceValue));
    newRow.appendChild(diceFaceCell);

    for (let i = 0; i < model.players.length + 4; i++) {
        const isScoreCell = i - model.players.length < 0;
        newRow.appendChild(generateInputCell(isScoreCell));
    }
}

/**
 *
 * @param {string} playerName
 */
function addPlayerToTable(playerIndex) {
    const table = document.querySelector("#scorecard");
    const headerRow = table.tHead.rows[1];
    const bodyRows = table.tBodies[0].rows;
    const footerRow = table.tFoot.rows[0];
    const columnIndex = headerRow.childElementCount - 4;

    const headerCell = document.createElement("td");
    headerCell.innerText = model.players[playerIndex];
    headerCell.classList.add("player-header");
    headerRow.children[columnIndex].before(headerCell);

    for (const bodyRow of bodyRows) {
        bodyRow.children[columnIndex].before(generateInputCell(true));
    }

    footerRow.appendChild(document.createElement("td"));
    
    // Expand colspan for card-header to match players
    const cardHeaderDatacell = document.querySelector("#card-header-datacell");
    const previousColSpan = parseInt(cardHeaderDatacell.getAttribute("colspan"));
    cardHeaderDatacell.setAttribute("colspan", previousColSpan + 1);
}

/**
 *
 * @param {boolean} isScoreCell
 */
function generateInputCell(isScoreCell) {
    const cell = document.createElement("td");
    const scoreInput = document.createElement("input");

    scoreInput.setAttribute("type", "tel");
    if (isScoreCell) {
        scoreInput.addEventListener("input", scoreInputChangeEvent);
        scoreInput.classList.add("score-input");
    } else {
        scoreInput.addEventListener("input", bonusInputChangeEvent);
        scoreInput.classList.add("bonus-input");
    }

    cell.appendChild(scoreInput);
    return cell;
}

function scoreInputChangeEvent(ev) {
    const rawinputValue = ev.path[0].value;
    const col = ev.path[1].cellIndex - 1;
    const row = ev.path[2].rowIndex - ev.path[4].tHead.rows.length;

    if (rawinputValue === "-") {
        model.scorecard[row][col].addVictory();
    } else if (!isNaN(parseInt(rawinputValue))) {
        model.scorecard[row][col].changeScore(parseInt(rawinputValue));
    } else {
        model.scorecard[row][col].removeScore();
    }

    calculateScore();
}

function bonusInputChangeEvent(ev) {
    const parsedInputValue = parseInt(ev.path[0].value);
    const col = ev.path[1].cellIndex + 4 - ev.path[2].childElementCount;
    const row = ev.path[2].rowIndex - ev.path[4].tHead.rows.length;

    if (parsedInputValue < 0 || parsedInputValue > 9) {
        const entry = model.bonusPoints[row][col];
        
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
        model.bonusPoints[row][col].removeScore();
    } else {
        model.bonusPoints[row][col].changeScore(parsedInputValue);
    }

    calculateScore();
}

async function calculateScore() {
    let scores = Array(model.players.length);
    scores.fill(0);
    for (let row = 0; row < model.scorecard.length; row++) {
        let bonusPoints = 0;
        model.bonusPoints[row].forEach((scoreEntry) => {
            bonusPoints += scoreEntry.points;
        });

        for (let col = 0; col < model.scorecard[row].length; col++) {
            const cardEntry = model.scorecard[row][col];
            if (!cardEntry.isVictory && !cardEntry.isEmpty) {
                if (isNaN(cardEntry.points)) {
                    console.warn(`${row}:${col}, NaN value detected`);
                }
                scores[col] += cardEntry.points + bonusPoints;
            }
        }
    }

    saveModelToLocalStorage();

    const table = document.querySelector("#scorecard");
    scores.forEach((score, col) => {
        table.tFoot.rows[0].children[col + 1].innerText = score;
    });
}

/**
 * @returns {object}
 */
function loadModelFromLocalStorage() {
    const storageData = localStorage.getItem(oldGameStorageKey);
    const parsedModel = JSON.parse(storageData);
    if (parsedModel === null) return null;

    for (let row = 0; row < parsedModel.scorecard.length; row++) {
        for (let col = 0; col < parsedModel.scorecard[row].length; col++) {
            parsedModel.scorecard[row][col] = Object.assign(
                new ScoreEntry(),
                parsedModel.scorecard[row][col]
            );
        }
        for (let col = 0; col < parsedModel.bonusPoints[row].length; col++) {
            parsedModel.bonusPoints[row][col] = Object.assign(
                new ScoreEntry(),
                parsedModel.bonusPoints[row][col]
            );
        }
    }
    return parsedModel;
}

function saveModelToLocalStorage() {
    const modelAsJson = JSON.stringify(model);
    localStorage.setItem(oldGameStorageKey, modelAsJson);
}

function removeModelFromLocalStorage() {
    localStorage.removeItem(oldGameStorageKey);
    location.reload();
}

function outputModelToTable() {
    const table = document.querySelector("#scorecard");
    const bodyRows = table.tBodies[0].rows;

    // Add player columns and add rows
    for (let i = 0; i < model.players.length; i++) {
        addPlayerToTable(i);
    }
    for (let row = 0; row < model.scorecard.length; row++) {
        addTableRow(model.diceFaces[row]);
    }

    // Output values to cells
    for (let row = 0; row < model.scorecard.length; row++) {
        for (let col = 0; col < model.players.length + 4; col++) {
            const cellInputField = bodyRows[row].cells[col + 1].children[0];
            if (col < model.players.length) {
                const scoreEntry = model.scorecard[row][col];
                if (!scoreEntry.isEmpty) {
                    if (scoreEntry.isVictory) {
                        cellInputField.value = "-";
                    } else {
                        cellInputField.value = scoreEntry.points;
                    }
                }
            } else {
                const bCol = col - model.players.length;
                const scoreEntry = model.bonusPoints[row][bCol];
                if (!scoreEntry.isEmpty) {
                    cellInputField.value = scoreEntry.points;
                }
            }
        }
    }

    calculateScore();
}

/**
 *
 * @param {number} diceFaceValue
 */
function addRowToModel(diceFaceValue) {
    const scorecardRow = Array(model.players.length);
    const bonusRow = Array(4);

    for (let i = 0; i < scorecardRow.length; i++) {
        scorecardRow[i] = new ScoreEntry();
    }
    for (let i = 0; i < bonusRow.length; i++) {
        bonusRow[i] = new ScoreEntry();
    }

    model.scorecard.push(scorecardRow);
    model.bonusPoints.push(bonusRow);
    model.diceFaces.push(diceFaceValue);
}
