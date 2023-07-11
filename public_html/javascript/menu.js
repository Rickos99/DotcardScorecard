import { download, openFromFileSelector } from "./fs.js";
import { GameModel } from "./gamemodel.js";
import {
    saveToLocalStorage,
    findInLocalStorage,
    loadFromLocalStorage,
    removeFromLocalStorage,
    keyExistsInLocalStorage,
} from "./localstorage.js";
import { gamemodeNames, getDiceFaceLayout } from "./diceFaces.js";

export class Menu {
    static _navigationContainerId = "#navigation";
    static _playersContainerName = "#playernames-inputs";
    static _gamemodeSelectorId = "#gamemode-input";
    static _roundsInputId = "#rounds-input";
    static _oldGameKeyBegValue = "game:";

    /**
     * @access private
     * @readonly
     * @type {GameModel}
     */
    _gameModel;

    /**
     * @access public
     * @param {GameModel} gameModel
     */
    constructor(gameModel) {
        this._gameModel = gameModel;
        this.attachEventListeners();
        this.outputAvaliableGameModes();
        this.outputPreviousGames();
        this.outputCurrentGameSettings();
    }

    /**
     * @access public
     */
    openNavigationAndResetAll() {
        this.clearPlayersInputs();
        document.querySelector(Menu._navigationContainerId).classList.remove("hidden");
    }

    /**
     * @access public
     * @param {boolean} animate Should the navigation anaimation be present?
     */
    toggleNavigation(animate = true) {
        let classList = document.querySelector("#navigation").classList;
        if (classList.contains("hidden")) {
            classList.remove("hidden");
            if (animate) {
                classList.add("open");
                setTimeout(() => classList.remove("open"), 500);
            }
        } else {
            classList.add("hidden");
            if (animate) {
                classList.add("close");
                setTimeout(() => classList.remove("close"), 500);
            }
        }
    }

    /**
     * @access public
     * @returns {Promise<Array<string>>}
     */
    getPlayerNames() {
        const selector = `${Menu._playersContainerName} > div > input`;
        return new Promise(resolve => {
            var playerNames = [];
            document.querySelectorAll(selector).forEach(inputElm => {
                const playerName = inputElm.value.trim();
                if (playerName != "") playerNames.push(playerName);
            });
            resolve(playerNames);
        });
    }

    /**
     * @access private
     */
    async outputPreviousGames() {
        const gamekeyRegex = new RegExp(`^${Menu._oldGameKeyBegValue}`);
        const prevGameList = document.querySelector("#previousGamesList");
        const entries = await findInLocalStorage(gamekeyRegex, false);
        if (entries.length === 0) {
            prevGameList.innerText = "No saved games was found";
            return;
        }

        // Remove already existing list items
        while (prevGameList.firstChild) {
            prevGameList.lastChild.remove();
        }

        // Output previous games
        entries.forEach(entry => {
            const li = document.createElement("li");
            const title = document.createElement("b");
            const btnLoad = document.createElement("button");
            const btnRemove = document.createElement("button");
            const gameKey = entry.key;
            const nameOfGame = gameKey.replace(Menu._oldGameKeyBegValue, "");

            title.innerText = nameOfGame;
            btnLoad.innerText = "Load";
            btnLoad.addEventListener("click", () => {
                if (confirm("Current game will be lost, do you want to continue?")) {
                    this.loadPreviousGame(gameKey);
                }
            });
            btnRemove.innerText = "Remove";
            btnRemove.addEventListener("click", () => {
                if (confirm(`The game '${nameOfGame}' will be removed, do you want to contiune?`)) {
                    this.removePreviousGame(gameKey);
                }
            });

            li.appendChild(btnLoad);
            li.appendChild(btnRemove);
            li.appendChild(title);
            prevGameList.appendChild(li);
        });
    }

    async outputCurrentGameSettings() {
        if (this._gameModel === undefined) {
            return;
        }

        this._gameModel.players.forEach((playerName, index) => {
            this.addPlayerNameInput();
            this.setPlayerNameInputValue(playerName, index);
        });

        this.setGamemodeSelectorValue(this._gameModel.gamemode);
        this.setRoundsInputValue(this._gameModel.rounds);
    }

    loadPreviousGame(key) {
        const prevGame = loadFromLocalStorage(key);
        saveToLocalStorage(prevGame);
        window.location.reload();
    }

    removePreviousGame(key) {
        removeFromLocalStorage(key);
        this.outputPreviousGames();
        alert(`The game was removed`);
    }

    /**
     * @access private
     */
    attachEventListeners() {
        // Disable buttons with functions that relies on a non-empty _gameModel
        if (this._gameModel === undefined) {
            document.querySelector("#btnSaveGameAs").disabled = true;
            document.querySelector("#btnExportGame").disabled = true;
        } else {
            document.querySelector("#btnSaveGameAs").addEventListener("click", async () => this.saveGameAs());
            document.querySelector("#btnExportGame").addEventListener("click", async () => this.exportGame());
        }

        document.querySelector("#btnImportGame").addEventListener("click", async () => this.importGame());
        document.querySelector("#btnAddPlayerToList").addEventListener("click", async () => this.addPlayerNameInput());
        document.querySelector("#btnStartNewGame").addEventListener("click", async () => this.startNewGame());
        document
            .querySelector(Menu._gamemodeSelectorId)
            .addEventListener("change", () => this.displayOrHideRoundsInput());

        document.querySelectorAll('[gui-role="toogle-navigation"]').forEach(el => {
            el.addEventListener("click", () => this.toggleNavigation());
        });
    }

    /**
     * @access private
     */
    async importGame() {
        const fileContent = await openFromFileSelector();
        const importedGameModel = GameModel.initNew(JSON.parse(fileContent));
        saveToLocalStorage(importedGameModel);
        window.location.reload();
    }

    /**
     * @access private
     */
    async exportGame() {
        let gameName = prompt("Name of exported game:");
        if (gameName === null) {
            return;
        } else if (gameName === "") {
            gameName = "A game of DotCard";
        }
        const jsonFromGamemodel = JSON.stringify(this._gameModel);
        download(jsonFromGamemodel, gameName, "json");
    }

    /**
     * @access private
     */
    async saveGameAs() {
        const name = prompt("Name of game");
        if (name === null || name === "") return;

        this._gameModel.nameOfGame = `${Menu._oldGameKeyBegValue}${name}`;
        if (
            keyExistsInLocalStorage(this._gameModel.nameOfGame) &&
            !confirm("An game with that name already exists, do you want to overwrite it?")
        ) {
            this.saveGameAs();
            return;
        }

        saveToLocalStorage(this._gameModel);
        alert(`Game was saved as ${name}`);
        this.outputPreviousGames();
    }

    async startNewGame() {
        const players = await this.getPlayerNames();
        if (players.length == 0) {
            alert("Cannot start a game with no players.");
            return;
        }

        if (this._gameModel !== undefined && !confirm("Current game will be lost, do you want to continue?")) {
            return;
        }

        const gamemode = document.querySelector(Menu._gamemodeSelectorId).value;
        const rounds = parseInt(document.querySelector(Menu._roundsInputId).value);
        const diceFaces = getDiceFaceLayout(gamemode, rounds);
        const gamemodel = new GameModel(players, diceFaces, gamemode);
        saveToLocalStorage(gamemodel);
        window.location.reload();
    }

    /**
     * @access private
     */
    clearPlayersInputs() {
        const node = document.querySelector(Menu._playersContainerName);
        while (node.firstChild) {
            node.removeChild(node.lastChild);
        }
    }

    /**
     *
     * @param {string} playerName name of player
     * @param {number} index
     */
    setPlayerNameInputValue(playerName, index) {
        const selector = `${Menu._playersContainerName} > div > input`;
        document.querySelectorAll(selector)[index].value = playerName;
    }

    /**
     * @access private
     * @param {string} gamemode
     */
    setGamemodeSelectorValue(gamemode) {
        document.querySelector(Menu._gamemodeSelectorId).value = gamemode;
        this.displayOrHideRoundsInput();
    }

    /**
     *
     * @param {number} rounds
     */
    setRoundsInputValue(rounds) {
        document.querySelector(Menu._roundsInputId).value = rounds;
    }

    /**
     * @access private
     */
    addPlayerNameInput() {
        const parent = document.querySelector(Menu._playersContainerName);
        const div = document.createElement("div");
        const input = document.createElement("input");
        const span = document.createElement("span");

        input.type = "text";
        input.placeholder = "playername";
        span.innerText = "remove";
        span.classList.add("material-icons");
        span.addEventListener("click", () => span.parentElement.remove());

        div.appendChild(input);
        div.appendChild(span);
        parent.appendChild(div);
    }

    /**
     * @access private
     */
    outputAvaliableGameModes() {
        const selector = document.querySelector(Menu._gamemodeSelectorId);
        Object.keys(gamemodeNames).forEach(key => {
            const option = document.createElement("option");
            option.value = gamemodeNames[key];
            option.innerText = gamemodeNames[key];
            selector.appendChild(option);
        });
    }

    /**
     * @access private
     */
    displayOrHideRoundsInput() {
        const roundInputGroup = document.querySelector("#rounds-input-group");
        const selectedGamemode = document.querySelector(Menu._gamemodeSelectorId).value;
        if (selectedGamemode === gamemodeNames.random) {
            roundInputGroup.classList.remove("hidden");
        } else {
            roundInputGroup.classList.add("hidden");
        }
    }
}
