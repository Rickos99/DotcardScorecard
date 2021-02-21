import { Menu } from "./menu.js";
import { ScoreEntry } from "./gamemodel.js";
import { loadFromLocalStorage, saveToLocalStorage } from "./localstorage.js";
import { ScoreCard } from "./scorecard.js";

window.onload = () => {
    const gameKey = "currentGame";
    let gamemodel;
    try {
        gamemodel = loadFromLocalStorage(gameKey);
        const scoreCard = new ScoreCard(gamemodel);
        const menu = new Menu(gamemodel);
        scoreCard.outputModelToTable();
    } catch (error) {
        console.log(`No game with key ${gameKey} was found`);
        new Menu().toggleNavigation();
    }
};
