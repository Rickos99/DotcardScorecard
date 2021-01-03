window.onload = () => {
    const oldGame = loadModelFromLocalStorage();
    if (oldGame === null) {
        model.players = ["Player 1", "Player 2", "Player 3", "Player 4"];
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
function addCardRow(diceFaceValue) {
    const table = document.querySelector("#scorecard");
    const newRow = table.tBodies[0].insertRow();

    const diceFaceCell = document.createElement("td");
    diceFaceCell.classList.add("dice-face");
    diceFaceCell.appendChild(createDiceFace(diceFaceValue));
    newRow.appendChild(diceFaceCell);

    for (let i = 0; i < model.players.length + 4; i++) {
        const isScoreCell = i - model.players.length < 0;
        newRow.appendChild(createInputCell(isScoreCell));
    }
}

/**
 *
 * @param {string} playerName
 */
function addPlayerColumn(playerIndex) {
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
        bodyRow.children[columnIndex].before(createInputCell(true));
    }

    footerRow.appendChild(document.createElement("td"));
}

/**
 *
 * @param {boolean} isScoreCell
 */
function createInputCell(isScoreCell) {
    const cell = document.createElement("td");
    const scoreInput = document.createElement("input");

    scoreInput.setAttribute("type", "number");
    if (isScoreCell) {
        scoreInput.addEventListener("input", scoreInputChange);
        scoreInput.classList.add("score-input");
    } else {
        scoreInput.addEventListener("input", bonusInputChange);
        scoreInput.classList.add("bonus-input");
    }

    cell.appendChild(scoreInput);
    return cell;
}

function scoreInputChange(ev) {
    const inputValue = parseInt(ev.path[0].value);
    const col = ev.path[1].cellIndex - 1;
    const row = ev.path[2].rowIndex - ev.path[4].tHead.rows.length;

    model.scorecard[row][col] = inputValue;

    calculateScore();
}

function bonusInputChange(ev) {
    const inputValue = parseInt(ev.path[0].value);
    const col = ev.path[1].cellIndex + 4 - ev.path[2].childElementCount;
    const row = ev.path[2].rowIndex - ev.path[4].tHead.rows.length;

    model.bonusPoints[row][col] = isNaN(inputValue) ? 0 : inputValue;
    console.log(model.bonusPoints);

    calculateScore();
}

function calculateScore() {
    let scores = Array(model.players.length);
    scores.fill(0);
    for (let row = 0; row < model.scorecard.length; row++) {
        if (model.scorecard[row] === undefined) continue;

        let bonusPoints = model.bonusPoints[row].reduce((a, b) => a + b, 0);

        for (let col = 0; col < model.scorecard[row].length; col++) {
            const cardEntry = model.scorecard[row][col];
            if (!isNaN(cardEntry) && cardEntry !== null) {
                scores[col] += cardEntry + bonusPoints;
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
    const oldModel = localStorage.getItem(oldGameStorageKey);
    return JSON.parse(oldModel);
}

function saveModelToLocalStorage() {
    const modelAsJson = JSON.stringify(model);
    localStorage.setItem(oldGameStorageKey, modelAsJson);
}

function outputModelToTable() {
    const table = document.querySelector("#scorecard");
    const bodyRows = table.tBodies[0].rows;

    // Add player columns and add rows
    for (let i = 0; i < model.players.length; i++) {
        addPlayerColumn(i);
    }
    for (let row = 0; row < model.scorecard.length; row++) {
        addCardRow(model.diceFaces[row]);
    }

    // Output values to cells
    for (let row = 0; row < model.scorecard.length; row++) {
        for (let col = 0; col < model.players.length + 4; col++) {
            const cellInputField = bodyRows[row].cells[col + 1].children[0];
            if (col < model.players.length) {
                cellInputField.value = model.scorecard[row][col];
            } else {
                cellInputField.value =
                    model.bonusPoints[row][col - model.players.length];
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

    scorecardRow.fill(0);
    bonusRow.fill(0);

    model.scorecard.push(scorecardRow);
    model.bonusPoints.push(bonusRow);
    model.diceFaces.push(diceFaceValue);
}
