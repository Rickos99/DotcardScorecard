import { download, openFromFileSelector } from "./fs.js";
import { GameModel } from "./gamemodel.js";
import {
    saveToLocalStorage,
    findInLocalStorage,
    loadFromLocalStorage,
    removeFromLocalStorage,
    keyExistsInLocalStorage,
} from "./localstorage.js";

export class Menu {
    static _navigationContainerId = "#navigation";
    static _playersContainerName = "#playernames-inputs";
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
        this.outputPreviousGames();
        if (this._gameModel !== undefined) {
            this._gameModel.players.forEach((playerName, index) => {
                this.addPlayerNameInput();
                this.setPlayerNameInputValue(playerName, index);
            });
        }
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

        const diceFaces = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        const gamemodel = new GameModel(players, diceFaces);
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
}
