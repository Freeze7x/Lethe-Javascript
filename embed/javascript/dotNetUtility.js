function returnNewObject() {
    return {};
}

function turnIterableIntoArray(itr) {
    return [...itr];
}

class GameData {
    #dictionary = new Map();
    static #instances = new Set();
    get(key, defaultValue = {}) {
        if (this.#dictionary.has(key))
            return this.#dictionary.get(key);

        this.#dictionary.set(key, defaultValue);
        return defaultValue;
    }
    constructor() {
        GameData.#instances.add(this);
    }
}

function constructGameData() {
    return new GameData();
}