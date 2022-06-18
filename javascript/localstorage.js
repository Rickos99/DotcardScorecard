import { GameModel } from "./gamemodel.js";

/**
 * Load a saved gamemodel from localstorage
 * @param {string} key Name of localstorage entry to load
 * @returns {GameModel} The GameModel that was found with the specified key
 * @throws Will throw an error if no model belongs to the specified key
 */
export function loadFromLocalStorage(key) {
    const storageData = localStorage.getItem(key);
    const model = JSON.parse(storageData);
    if (model === null) throw new Error(`No entry with key ${key} was found in localstorage.`);
    return GameModel.initNew(model);
}

/**
 * Save a gamemodel to localstorage
 * @param {GameModel} model Model to save
 */
export function saveToLocalStorage(model) {
    const modelAsJson = JSON.stringify(model);
    localStorage.setItem(model.nameOfGame, modelAsJson);
    console.log(`The item with key ${model.nameOfGame} was saved to localstorage.`);
}

/**
 * Remove a gamemodel from localstorage
 * @param {string} key The key of the entry to remove
 */
export function removeFromLocalStorage(key) {
    localStorage.removeItem(key);
    console.log(`The item with key ${key} was removed from localstorage.`);
}

/**
 * Find items by query in localstorage
 * @param {RegExp} query
 * @param {boolean} parseValuesAsJson
 * @returns {Promise<Array<{key:string, value:string|object}>>}
 */
export async function findInLocalStorage(query, parseValuesAsJson) {
    let results = [];
    for (let i in localStorage) {
        if (localStorage.hasOwnProperty(i)) {
            if (i.match(query) || (!query && typeof i === "string")) {
                try {
                    const value = localStorage.getItem(i);
                    if (parseValuesAsJson) {
                        results.push({ key: i, value: JSON.parse(value) });
                    } else {
                        results.push({ key: i, value: value });
                    }
                } catch (error) {}
            }
        }
    }
    return results;
}

/**
 * Check whether an object with the specified key exists or not.
 * @param {string} key The key to check
 * @returns {boolean} True if an object with the specified key exists, else false.
 */
export function keyExistsInLocalStorage(key) {
    const keys = Object.keys(localStorage);
    return keys.includes(key);
}
