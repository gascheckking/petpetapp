// ============ PETVERSE STORAGE ============
// Version 1.0 - Hantering av localStorage

const Storage = (function() {
    const STORAGE_KEYS = {
        USER: 'petverse_user',
        INVENTORY: 'petverse_inventory',
        ACHIEVEMENTS: 'petverse_achievements',
        SETTINGS: 'petverse_settings',
        FRIENDS: 'petverse_friends',
        BOUNTIES: 'petverse_bounties',
        POSTS: 'petverse_posts',
        CHAT_HISTORY: 'petverse_chat'
    };

    // Spara data
    function save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch(e) {
            console.error('Storage save error:', e);
            return false;
        }
    }

    // Ladda data
    function load(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch(e) {
            console.error('Storage load error:', e);
            return defaultValue;
        }
    }

    // Ta bort data
    function remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch(e) { return false; }
    }

    // Rensa all data
    function clear() {
        try {
            localStorage.clear();
            return true;
        } catch(e) { return false; }
    }

    // Kolla om nyckel finns
    function has(key) {
        return localStorage.getItem(key) !== null;
    }

    // Spara användardata
    function saveUser(userData) {
        return save(STORAGE_KEYS.USER, userData);
    }

    // Ladda användardata
    function loadUser(defaultUser = null) {
        return load(STORAGE_KEYS.USER, defaultUser);
    }

    // Spara inventory
    function saveInventory(inventory) {
        return save(STORAGE_KEYS.INVENTORY, inventory);
    }

    // Ladda inventory
    function loadInventory(defaultInventory = []) {
        return load(STORAGE_KEYS.INVENTORY, defaultInventory);
    }

    // Spara achievements
    function saveAchievements(achievements) {
        return save(STORAGE_KEYS.ACHIEVEMENTS, achievements);
    }

    // Ladda achievements
    function loadAchievements(defaultAchievements = []) {
        return load(STORAGE_KEYS.ACHIEVEMENTS, defaultAchievements);
    }

    // Spara inställningar
    function saveSettings(settings) {
        return save(STORAGE_KEYS.SETTINGS, settings);
    }

    // Ladda inställningar
    function loadSettings(defaultSettings = {}) {
        return load(STORAGE_KEYS.SETTINGS, defaultSettings);
    }

    // Spara vänner
    function saveFriends(friends) {
        return save(STORAGE_KEYS.FRIENDS, friends);
    }

    // Ladda vänner
    function loadFriends(defaultFriends = []) {
        return load(STORAGE_KEYS.FRIENDS, defaultFriends);
    }

    // Exportera alla data (för backup)
    function exportAll() {
        const allData = {};
        for (const key in STORAGE_KEYS) {
            allData[STORAGE_KEYS[key]] = load(STORAGE_KEYS[key]);
        }
        return allData;
    }

    // Importera data (för återställning)
    function importAll(data) {
        for (const key in data) {
            save(key, data[key]);
        }
    }

    return {
        save,
        load,
        remove,
        clear,
        has,
        saveUser,
        loadUser,
        saveInventory,
        loadInventory,
        saveAchievements,
        loadAchievements,
        saveSettings,
        loadSettings,
        saveFriends,
        loadFriends,
        exportAll,
        importAll,
        KEYS: STORAGE_KEYS
    };
})();

window.Storage = Storage;