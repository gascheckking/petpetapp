// ============ PETVERSE PET SYSTEM ============
// Version 1.0 - Hantering av användarens pet

const PetSystem = (function() {
    // Pet typer med stats
    const PET_TYPES = {
        dragon: {
            name: 'Eldraken',
            emoji: '🐉',
            baseHp: 120,
            baseAttack: 25,
            baseDefense: 20,
            abilities: [
                { name: 'Fire Breath', damage: 35, energyCost: 20, emoji: '🔥' },
                { name: 'Fly', damage: 20, energyCost: 15, emoji: '🪽' },
                { name: 'Lightning Strike', damage: 45, energyCost: 30, emoji: '⚡' }
            ],
            evolutionLevels: { 10: 'Fire Dragon', 25: 'Elder Dragon', 50: 'Ancient Dragon' }
        },
        wolf: {
            name: 'Skuggvarg',
            emoji: '🐺',
            baseHp: 100,
            baseAttack: 30,
            baseDefense: 15,
            abilities: [
                { name: 'Howl', damage: 15, energyCost: 10, emoji: '🌙' },
                { name: 'Hunt', damage: 40, energyCost: 25, emoji: '🏃' },
                { name: 'Pack Strike', damage: 50, energyCost: 35, emoji: '🐺🐺' }
            ],
            evolutionLevels: { 10: 'Shadow Wolf', 25: 'Night Wolf', 50: 'Alpha Wolf' }
        },
        phoenix: {
            name: 'Fenix',
            emoji: '🔥',
            baseHp: 90,
            baseAttack: 35,
            baseDefense: 10,
            abilities: [
                { name: 'Rebirth', damage: 0, energyCost: 40, emoji: '✨', heal: true },
                { name: 'Blaze', damage: 55, energyCost: 35, emoji: '🔥🔥' },
                { name: 'Heal', damage: 0, energyCost: 25, emoji: '❤️', heal: true }
            ],
            evolutionLevels: { 10: 'Young Phoenix', 25: 'Radiant Phoenix', 50: 'Immortal Phoenix' }
        },
        fox: {
            name: 'MagiRäv',
            emoji: '🦊',
            baseHp: 85,
            baseAttack: 28,
            baseDefense: 18,
            abilities: [
                { name: 'Charm', damage: 20, energyCost: 15, emoji: '🌀' },
                { name: 'Dash', damage: 30, energyCost: 20, emoji: '⚡' },
                { name: 'Magic Blast', damage: 48, energyCost: 32, emoji: '🔮' }
            ],
            evolutionLevels: { 10: 'Mystic Fox', 25: 'Arcane Fox', 50: 'Elder Fox' }
        }
    };

    // Standard pet data
    const DEFAULT_PET = {
        type: 'dragon',
        level: 1,
        exp: 0,
        currentHp: 100,
        currentEnergy: 100,
        skins: ['Default'],
        equippedSkin: 'Default',
        nickname: '',
        battleWins: 0,
        battleLosses: 0
    };

    let currentPet = null;

    // Ladda pet från storage
    function loadPet() {
        const saved = Storage.load(Storage.KEYS.USER);
        if (saved && saved.pet) {
            currentPet = saved.pet;
        } else {
            currentPet = { ...DEFAULT_PET };
        }
        return currentPet;
    }

    // Spara pet
    function savePet() {
        const user = Storage.loadUser({});
        user.pet = currentPet;
        Storage.saveUser(user);
    }

    // Hämta pet data
    function getPet() {
        if (!currentPet) loadPet();
        return currentPet;
    }

    // Hämta pet typ detaljer
    function getPetType() {
        return PET_TYPES[currentPet.type];
    }

    // Beräkna max HP baserat på level
    function getMaxHp() {
        const base = PET_TYPES[currentPet.type].baseHp;
        return base + (currentPet.level - 1) * 10;
    }

    // Beräkna attack baserat på level
    function getAttack() {
        const base = PET_TYPES[currentPet.type].baseAttack;
        return base + Math.floor((currentPet.level - 1) * 1.5);
    }

    // Beräkna försvar baserat på level
    function getDefense() {
        const base = PET_TYPES[currentPet.type].baseDefense;
        return base + Math.floor((currentPet.level - 1) * 1.2);
    }

    // Lägg till XP
    function addExp(amount) {
        currentPet.exp += amount;
        let leveledUp = false;
        const expNeeded = getExpNeededForNextLevel();
        
        while (currentPet.exp >= expNeeded) {
            currentPet.exp -= expNeeded;
            currentPet.level++;
            leveledUp = true;
            
            // Uppdatera HP/Energy vid level up
            currentPet.currentHp = getMaxHp();
            currentPet.currentEnergy = 100;
            
            // Kolla evolution
            const evolution = PET_TYPES[currentPet.type].evolutionLevels[currentPet.level];
            if (evolution && currentPet.nickname === '') {
                Notifications.show(`✨ Din ${getPetType().name} utvecklades till ${evolution}! ✨`, 'success');
            }
        }
        
        savePet();
        if (leveledUp) {
            Notifications.show(`🎉 LEVEL UP! Din pet är nu level ${currentPet.level}! 🎉`, 'success');
        }
        return leveledUp;
    }

    // XP som behövs för nästa level
    function getExpNeededForNextLevel() {
        return 100 + (currentPet.level - 1) * 25;
    }

    // Progress till nästa level (0-100%)
    function getLevelProgress() {
        const needed = getExpNeededForNextLevel();
        return (currentPet.exp / needed) * 100;
    }

    // Ändra pet typ (byte av pet)
    function changePetType(newType) {
        if (PET_TYPES[newType]) {
            currentPet.type = newType;
            currentPet.currentHp = getMaxHp();
            savePet();
            return true;
        }
        return false;
    }

    // Använd en ability (för battle)
    function useAbility(abilityIndex) {
        const petType = getPetType();
        const ability = petType.abilities[abilityIndex];
        if (!ability) return null;
        
        if (currentPet.currentEnergy < ability.energyCost) {
            Notifications.show('❌ Inte nog med energi!', 'error');
            return null;
        }
        
        currentPet.currentEnergy -= ability.energyCost;
        savePet();
        
        return {
            ...ability,
            damage: ability.damage + Math.floor(getAttack() * 0.5)
        };
    }

    // Lägg till skin
    function addSkin(skinName) {
        if (!currentPet.skins.includes(skinName)) {
            currentPet.skins.push(skinName);
            savePet();
            return true;
        }
        return false;
    }

    // Utrusta skin
    function equipSkin(skinName) {
        if (currentPet.skins.includes(skinName)) {
            currentPet.equippedSkin = skinName;
            savePet();
            return true;
        }
        return false;
    }

    // Återställ HP och Energy (efter battle)
    function restoreHealth() {
        currentPet.currentHp = getMaxHp();
        currentPet.currentEnergy = 100;
        savePet();
    }

    // Ta skada
    function takeDamage(amount) {
        const defense = getDefense();
        const actualDamage = Math.max(1, amount - Math.floor(defense / 2));
        currentPet.currentHp = Math.max(0, currentPet.currentHp - actualDamage);
        savePet();
        return actualDamage;
    }

    // Registrera battle resultat
    function recordBattleResult(won) {
        if (won) {
            currentPet.battleWins++;
            addExp(50);
        } else {
            currentPet.battleLosses++;
            addExp(20);
        }
        restoreHealth();
        savePet();
    }

    // Sätt smeknamn
    function setNickname(nickname) {
        currentPet.nickname = nickname.substring(0, 20);
        savePet();
    }

    // Hämta evolution namn (om tillgängligt)
    function getEvolutionName() {
        const evolutions = PET_TYPES[currentPet.type].evolutionLevels;
        let evolution = null;
        for (const level in evolutions) {
            if (currentPet.level >= parseInt(level)) {
                evolution = evolutions[level];
            }
        }
        return evolution;
    }

    return {
        loadPet,
        getPet,
        getPetType,
        getMaxHp,
        getAttack,
        getDefense,
        addExp,
        getExpNeededForNextLevel,
        getLevelProgress,
        changePetType,
        useAbility,
        addSkin,
        equipSkin,
        restoreHealth,
        takeDamage,
        recordBattleResult,
        setNickname,
        getEvolutionName,
        PET_TYPES
    };
})();

window.PetSystem = PetSystem;