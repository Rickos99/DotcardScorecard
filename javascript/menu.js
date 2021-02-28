import { download, openFromFileSelector } from "./fs.js";
import { GameModel } from "./gamemodel.js";
import { saveToLocalStorage, findInLocalStorage, loadFromLocalStorage } from "./localstorage.js";

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
            const btn = document.createElement("button");
            const gameKey = entry.key;

            title.innerText = gameKey.replace(Menu._oldGameKeyBegValue, "");
            btn.innerText = "Load";
            btn.addEventListener("click", () => {
                if (confirm("Current game will be lost, do you want to continue?")) {
                    this.loadPreviousGame(gameKey);
                }
            });

            li.appendChild(btn);
            li.appendChild(title);
            prevGameList.appendChild(li);
        });
    }

    loadPreviousGame(key) {
        const prevGame = loadFromLocalStorage(key);
        saveToLocalStorage(prevGame);
        window.location.reload();
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
        if (name === null || name === "") {
            return;
        }

        this._gameModel.nameOfGame = `${Menu._oldGameKeyBegValue}${name}`;
        saveToLocalStorage(this._gameModel);
        alert(`Game was saved as ${name}`);
        this.outputPreviousGames();
    }

    async startNewGame() {
        if (this._gameModel !== undefined && !confirm("Current game will be lost, do you want to continue?")) {
            return;
        }

        const players = await this.getPlayerNames();
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
