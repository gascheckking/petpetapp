// ============ PETVERSE SHOP SYSTEM ============
// Version 1.0 - Hantering av butiker, items och köp

const ShopSystem = (function() {
    // Butiksitems
    const SHOP_ITEMS = {
        skins: [
            { id: 'fire_wings', name: 'Fire Wings', emoji: '🔥', price: 200, type: 'skin', rarity: 'rare', description: 'Lägg till flammande vingar på din pet!' },
            { id: 'legendary_glow', name: 'Legendary Glow', emoji: '✨', price: 500, type: 'skin', rarity: 'epic', description: 'Din pet lyser som en legend!' },
            { id: 'royal_crown', name: 'Royal Crown', emoji: '👑', price: 800, type: 'skin', rarity: 'legendary', description: 'Kröning för din kungliga pet' },
            { id: 'shadow_cloak', name: 'Shadow Cloak', emoji: '🌑', price: 300, type: 'skin', rarity: 'rare', description: 'Din pet blir mystisk och skuggig' },
            { id: 'ice_armor', name: 'Ice Armor', emoji: '❄️', price: 350, type: 'skin', rarity: 'rare', description: 'Frostig rustning för din pet' },
            { id: 'thunder_wings', name: 'Thunder Wings', emoji: '⚡', price: 450, type: 'skin', rarity: 'epic', description: 'Blixtrande vingar som lyser upp natten' }
        ],
        powerups: [
            { id: 'xp_boost', name: 'XP Boost', emoji: '⚡', price: 100, type: 'powerup', duration: '1 hour', effect: 'double_xp', description: 'Dubbel XP i 1 timme!' },
            { id: 'energy_potion', name: 'Energy Potion', emoji: '🧪', price: 50, type: 'consumable', effect: 'restore_energy', description: 'Återställer all energi direkt' },
            { id: 'health_potion', name: 'Health Potion', emoji: '💊', price: 75, type: 'consumable', effect: 'restore_health', description: 'Återställer all hälsa direkt' },
            { id: 'lucky_coin', name: 'Lucky Coin', emoji: '🍀', price: 150, type: 'powerup', duration: '1 day', effect: 'double_coins', description: 'Dubbelt mynt i 1 dag!' },
            { id: 'revive_potion', name: 'Revive Potion', emoji: '💀', price: 200, type: 'consumable', effect: 'revive', description: 'Återupplivar din pet i battle' }
        ],
        limited: [
            { id: 'halloween_pet', name: 'Halloween Pet', emoji: '🎃', price: 1000, type: 'special', limited: true, description: 'Sällsynt Halloween skin!' },
            { id: 'xmas_pet', name: 'Christmas Pet', emoji: '🎄', price: 1000, type: 'special', limited: true, description: 'Festligt jultema!' }
        ]
    };

    // IRL-butiker (fysiska platser)
    const IRL_SHOPS = [
        { id: 'drake_spel', name: '🐉 Drake Spelbutik', address: 'Tumba Centrum', distance: '500m', discount: '15%', coinsReward: 50, expReward: 25 },
        { id: 'magirav_cafe', name: '🦊 MagiRäv Café', address: 'Skärholmen', distance: '1.2km', discount: 'Gratis kaffe', coinsReward: 40, expReward: 20 },
        { id: 'fenix_lounge', name: '🔥 Fenix Lounge', address: 'Stockholm City', distance: '3km', discount: '10%', coinsReward: 60, expReward: 30 },
        { id: 'varg_krog', name: '🐺 Vargkrogen', address: 'Alby', distance: '800m', discount: '20% på mat', coinsReward: 45, expReward: 22 },
        { id: 'rav_art', name: '🦊 Rävens Galleri', address: 'Fittja', distance: '1km', discount: '15%', coinsReward: 55, expReward: 28 }
    ];

    // Rabattkoder
    let discountCodes = [
        { code: 'MYPET20', discount: 20, used: false, rewardCoins: 100, partner: 'Svenska Spel' },
        { code: 'WELCOME10', discount: 10, used: false, rewardCoins: 50, partner: 'Welcome Deal' },
        { code: 'DRAGON15', discount: 15, used: false, rewardCoins: 75, partner: 'Drake Spelbutik' },
        { code: 'LEGEND50', discount: 50, used: false, rewardCoins: 200, partner: 'Legendary Event' }
    ];

    let purchaseHistory = [];

    // Ladda purchase history
    function loadHistory() {
        purchaseHistory = Storage.load('purchase_history', []);
    }

    // Spara purchase history
    function saveHistory() {
        Storage.save('purchase_history', purchaseHistory);
    }

    // Köp item
    function purchaseItem(itemId, category) {
        const items = SHOP_ITEMS[category];
        if (!items) return { success: false, message: 'Item finns inte' };
        
        const item = items.find(i => i.id === itemId);
        if (!item) return { success: false, message: 'Item finns inte' };
        
        const user = Storage.loadUser({});
        if (user.coins < item.price) {
            return { success: false, message: `Behöver ${item.price - user.coins} mer coins!` };
        }
        
        // Dra coins
        user.coins -= item.price;
        Storage.saveUser(user);
        
        // Lägg till i inventory
        const inventory = Storage.loadInventory([]);
        inventory.push({
            id: item.id,
            name: item.name,
            emoji: item.emoji,
            type: item.type,
            purchasedAt: new Date().toISOString(),
            equipped: false
        });
        Storage.saveInventory(inventory);
        
        // Spara i historik
        purchaseHistory.push({
            itemId: item.id,
            itemName: item.name,
            price: item.price,
            purchasedAt: new Date().toISOString()
        });
        saveHistory();
        
        // Uppdatera UI
        if (window.updateUI) window.updateUI();
        
        // Kolla achievements
        Achievements.checkAchievements(user);
        
        return { success: true, message: `✅ Du köpte ${item.name}!` };
    }

    // Använd powerup
    function usePowerup(itemId) {
        const inventory = Storage.loadInventory([]);
        const itemIndex = inventory.findIndex(i => i.id === itemId && i.type === 'powerup');
        
        if (itemIndex === -1) return { success: false, message: 'Item finns inte i inventory' };
        
        const item = inventory[itemIndex];
        
        // Applicera effekt baserat på item
        const shopItem = SHOP_ITEMS.powerups.find(p => p.id === itemId);
        if (shopItem && shopItem.effect) {
            applyPowerupEffect(shopItem.effect, shopItem.duration);
        }
        
        // Ta bort från inventory
        inventory.splice(itemIndex, 1);
        Storage.saveInventory(inventory);
        
        return { success: true, message: `✨ Du använde ${item.name}!` };
    }

    // Applicera powerup-effekt
    function applyPowerupEffect(effect, duration) {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + parseDuration(duration));
        
        const activeEffects = Storage.load('active_effects', []);
        activeEffects.push({
            effect: effect,
            expiresAt: expiresAt.toISOString()
        });
        Storage.save('active_effects', activeEffects);
    }

    // Parsa duration string till milliseconds
    function parseDuration(duration) {
        if (duration.includes('hour')) {
            const hours = parseInt(duration);
            return hours * 60 * 60 * 1000;
        }
        if (duration.includes('day')) {
            const days = parseInt(duration);
            return days * 24 * 60 * 60 * 1000;
        }
        return 60 * 60 * 1000; // default 1 hour
    }

    // Kolla aktiva effekter
    function getActiveEffects() {
        const activeEffects = Storage.load('active_effects', []);
        const now = new Date();
        const validEffects = activeEffects.filter(e => new Date(e.expiresAt) > now);
        
        if (validEffects.length !== activeEffects.length) {
            Storage.save('active_effects', validEffects);
        }
        
        return validEffects;
    }

    // Kolla om dubbel XP är aktiv
    function hasDoubleXP() {
        const effects = getActiveEffects();
        return effects.some(e => e.effect === 'double_xp');
    }

    // Kolla om dubbelt mynt är aktiv
    function hasDoubleCoins() {
        const effects = getActiveEffects();
        return effects.some(e => e.effect === 'double_coins');
    }

    // Claima rabattkod
    function claimCode(code) {
        const codeData = discountCodes.find(c => c.code === code);
        if (!codeData) return { success: false, message: 'Ogiltig kod' };
        if (codeData.used) return { success: false, message: 'Koden är redan använd' };
        
        codeData.used = true;
        
        const user = Storage.loadUser({});
        user.coins = (user.coins || 0) + codeData.rewardCoins;
        Storage.saveUser(user);
        
        if (window.updateUI) window.updateUI();
        
        return { success: true, message: `✅ Kod ${code} inlöst! Du fick ${codeData.rewardCoins} coins!` };
    }

    // Besök IRL butik
    function visitIRLShop(shopId) {
        const shop = IRL_SHOPS.find(s => s.id === shopId);
        if (!shop) return { success: false, message: 'Butik finns inte' };
        
        const visitedShops = Storage.load('visited_shops', []);
        const lastVisit = visitedShops.find(v => v.shopId === shopId);
        
        // Kolla om besökt idag
        const today = Utils.getTodayString();
        if (lastVisit && lastVisit.date === today) {
            return { success: false, message: 'Du har redan besökt denna butik idag!' };
        }
        
        // Uppdatera besök
        visitedShops.push({ shopId: shopId, date: today });
        Storage.save('visited_shops', visitedShops);
        
        // Ge belöning
        const user = Storage.loadUser({});
        user.coins = (user.coins || 0) + shop.coinsReward;
        Storage.saveUser(user);
        
        PetSystem.addExp(shop.expReward);
        
        if (window.updateUI) window.updateUI();
        
        return { success: true, message: `🎮 Du besökte ${shop.name}! +${shop.coinsReward} coins, +${shop.expReward} XP!` };
    }

    // Rendera shop UI
    function renderShop(container) {
        const user = Storage.loadUser({});
        const activeEffects = getActiveEffects();
        
        let effectsHtml = '';
        if (activeEffects.length > 0) {
            effectsHtml = '<div class="glass-card" style="margin-bottom: 15px;"><div style="font-weight: bold;">⚡ AKTIVA EFFEKTER</div>';
            activeEffects.forEach(e => {
                const expires = new Date(e.expiresAt);
                effectsHtml += `<div>${e.effect === 'double_xp' ? '✨ Dubbel XP' : '💰 Dubbelt mynt'} - giltigt till ${expires.toLocaleTimeString()}</div>`;
            });
            effectsHtml += '</div>';
        }
        
        container.innerHTML = `
            <div class="glass-card">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 28px; font-weight: bold;">💰 ${user.coins || 0}</span>
                    <span class="stat-badge">Lv.${user.pet?.level || 1}</span>
                </div>
            </div>
            
            ${effectsHtml}
            
            <div style="margin: 20px 0;">
                <div style="font-weight: bold; margin-bottom: 12px;">🎟️ RABATTKODER</div>
                ${discountCodes.map(code => `
                    <div class="glass-card" style="margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: bold;">${code.code}</div>
                            <div style="font-size: 11px; color: #888;">${code.discount}% rabatt · ${code.partner}</div>
                        </div>
                        <button class="btn-primary" style="padding: 8px 16px; font-size: 12px;" onclick="ShopSystem.claimCode('${code.code}')" ${code.used ? 'disabled style="opacity:0.5"' : ''}>
                            ${code.used ? 'Använd' : 'Använd'}
                        </button>
                    </div>
                `).join('')}
            </div>
            
            <div style="margin: 20px 0;">
                <div style="font-weight: bold; margin-bottom: 12px;">🛍️ SKINS</div>
                <div class="grid-2">
                    ${SHOP_ITEMS.skins.map(skin => `
                        <div class="grid-item" onclick="ShopSystem.purchaseItem('${skin.id}', 'skins')">
                            <div style="font-size: 40px;">${skin.emoji}</div>
                            <div style="font-weight: bold;">${skin.name}</div>
                            <div style="font-size: 11px; color: #888;">${skin.price} coins</div>
                            <div style="font-size: 10px; color: #39FF14;">${skin.rarity}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div style="margin: 20px 0;">
                <div style="font-weight: bold; margin-bottom: 12px;">⚡ POWER-UPS</div>
                <div class="grid-2">
                    ${SHOP_ITEMS.powerups.map(powerup => `
                        <div class="grid-item" onclick="ShopSystem.purchaseItem('${powerup.id}', 'powerups')">
                            <div style="font-size: 40px;">${powerup.emoji}</div>
                            <div style="font-weight: bold;">${powerup.name}</div>
                            <div style="font-size: 11px; color: #888;">${powerup.price} coins</div>
                            <div style="font-size: 10px; color: #888;">${powerup.duration || 'Instant'}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div style="margin: 20px 0;">
                <div style="font-weight: bold; margin-bottom: 12px;">🏪 IRL BUTIKER</div>
                ${IRL_SHOPS.map(shop => `
                    <div class="glass-card" style="margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: bold;">${shop.name}</div>
                            <div style="font-size: 11px; color: #888;">${shop.address} · ${shop.distance}</div>
                            <div style="font-size: 10px; color: #39FF14;">${shop.discount}</div>
                        </div>
                        <button class="btn-primary" style="padding: 8px 16px; font-size: 12px;" onclick="ShopSystem.visitIRLShop('${shop.id}')">
                            🎮 Besök
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Hämta inventory
    function getInventory() {
        return Storage.loadInventory([]);
    }

    // Utrusta skin
    function equipSkin(itemId) {
        const inventory = Storage.loadInventory([]);
        const item = inventory.find(i => i.id === itemId);
        if (!item || item.type !== 'skin') return { success: false, message: 'Item finns inte' };
        
        // Avrusta andra skins
        inventory.forEach(i => {
            if (i.type === 'skin') i.equipped = false;
        });
        
        item.equipped = true;
        Storage.saveInventory(inventory);
        
        // Uppdatera pet skin
        const pet = PetSystem.getPet();
        pet.equippedSkin = item.name;
        Storage.saveUser({ ...Storage.loadUser({}), pet: pet });
        
        return { success: true, message: `✨ Du utrustade ${item.name}!` };
    }

    return {
        purchaseItem,
        usePowerup,
        claimCode,
        visitIRLShop,
        renderShop,
        getInventory,
        equipSkin,
        hasDoubleXP,
        hasDoubleCoins,
        SHOP_ITEMS,
        IRL_SHOPS
    };
})();

window.ShopSystem = ShopSystem;