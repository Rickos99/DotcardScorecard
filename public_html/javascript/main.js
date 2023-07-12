import { Menu } from "./menu.js";
import { GameModel } from "./gamemodel.js";
import { loadFromLocalStorage } from "./localstorage.js";
import { ScoreCard } from "./scorecard.js";

window.addEventListener("load", () => {
    const gamemodel = loadRecentGamemodel();
    if (gamemodel === undefined) {
        new Menu().toggleNavigation(false);
    } else {
        new Menu(gamemodel);
        const scoreCard = new ScoreCard(gamemodel);
        scoreCard.outputModelToTable();
    }
});

/**
 * @returns {GameModel|undefined} gamemodel or undefined if no game is found
 */
function loadRecentGamemodel() {
    const gameKey = "currentGame";
    let gamemodel;
    try {
        gamemodel = loadFromLocalStorage(gameKey);
    } catch (error) {
        console.log(`No game with key ${gameKey} was found`);
    }
    return gamemodel;
}
