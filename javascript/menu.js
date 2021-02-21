import { download, openFromFileSelector } from "./fs.js";
import { GameModel } from "./gamemodel.js";
import { saveToLocalStorage, findInLocalStorage, removeFromLocalStorage } from "./localstorage.js";

export class Menu {
    static _navigationContainerId = "#navigation";
    static _playersContainerName = "#playernames-inputs";

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
     */
    toggleNavigation() {
        let classList = document.querySelector("#navigation").classList;
        if (classList.contains("hidden")) {
            classList.remove("hidden");
        } else {
            classList.add("hidden");
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
        const prevGameList = document.querySelector("#previousGamesList");
        const entries = await findInLocalStorage(/game:.*/, false);
        if (entries.length === 0) return;

        // Remove already existing list items
        while (prevGameList.firstChild) {
            prevGameList.lastChild.remove();
        }

        // Output previous games
        entries.forEach(entry => {
            const li = document.createElement("li");
            const title = document.createElement("b");
            const link = document.createElement("a");

            title.innerText = `${entry.key}`;
            link.innerText = "Load";
            link.href = "#";

            li.appendChild(link);
            li.appendChild(title);
            prevGameList.appendChild(li);
        });
    }

    /**
     * @access private
     */
    attachEventListeners() {
        // document.querySelector("#btnPreviousGames").addEventListener("click", () => {});
        document.querySelector("#btnSaveGameAs").addEventListener("click", () => {
            if (this._gameModel === undefined) {
                alert("No game is in progress");
                return;
            }

            const name = prompt("Name of game");
            switch (name) {
                case "currentGame":
                    alert("Reserved name!");
                    break;
                case null:
                case "":
                    return;
                default:
                    break;
            }

            this._gameModel.nameOfGame = `game:${name}`;
            saveToLocalStorage(this._gameModel);
            alert(`Game was saved as ${name}`);
            this.outputPreviousGames();
        });
        // document.querySelector("#btnNewGame").addEventListener("click", () => {});
        document.querySelector("#btnExportGame").addEventListener("click", () => {
            const jsonFromGamemodel = JSON.stringify(this._gameModel);
            download(jsonFromGamemodel, this._gameModel.nameOfGame, "json");
        });
        document.querySelector("#btnImportGame").addEventListener("click", async () => {
            const fileContent = await openFromFileSelector();
            const importedGameModel = GameModel.initNew(JSON.parse(fileContent));
            saveToLocalStorage(importedGameModel);
            window.location.reload();
        });
        document.querySelector("#btnAddPlayerToList").addEventListener("click", async () => {
            this.addPlayerNameInput();
        });
        document.querySelector("#btnStartGame").addEventListener("click", async () => {
            const players = await this.getPlayerNames();
            const diceFaces = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
            const gamemodel = new GameModel(players, diceFaces);
            saveToLocalStorage(gamemodel);
            window.location.reload();
        });

        document.querySelectorAll('[gui-role="toogle-navigation"]').forEach(el => {
            el.addEventListener("click", () => this.toggleNavigation());
        });
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
