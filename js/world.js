// ============ PETVERSE WORLD SYSTEM ============
// Version 1.0 - Hantering av världskarta och platser

const WorldSystem = (function() {
    // Alla platser i världen
    const WORLD_LOCATIONS = [
        { 
            id: 'home', 
            name: 'Hemvärlden', 
            emoji: '🏠', 
            description: 'Din bas där allt börjar', 
            activeUsers: 127,
            unlocked: true,
            levelRequired: 1,
            activities: ['feed', 'profile', 'chat']
        },
        { 
            id: 'shopping', 
            name: 'Shopping Plaza', 
            emoji: '🛍️', 
            description: 'Köp skins, power-ups och mer', 
            activeUsers: 45,
            unlocked: true,
            levelRequired: 1,
            activities: ['shop']
        },
        { 
            id: 'bounty', 
            name: 'Uppdragstorget', 
            emoji: '🎯', 
            description: 'Ta på dig uppdrag och tjäna belöningar', 
            activeUsers: 32,
            unlocked: true,
            levelRequired: 1,
            activities: ['bounties']
        },
        { 
            id: 'arena', 
            name: 'Battle Arena', 
            emoji: '⚔️', 
            description: 'Utmana andra i pet-strider', 
            activeUsers: 18,
            unlocked: true,
            levelRequired: 3,
            activities: ['battles']
        },
        { 
            id: 'forest', 
            name: 'MagiSkogen', 
            emoji: '🌲', 
            description: 'Utforska och hitta sällsynta items', 
            activeUsers: 56,
            unlocked: true,
            levelRequired: 2,
            activities: ['explore']
        },
        { 
            id: 'mountain', 
            name: 'Drakberget', 
            emoji: '⛰️', 
            description: 'Farlig terräng med stora belöningar', 
            activeUsers: 23,
            unlocked: false,
            levelRequired: 10,
            activities: ['explore', 'battles']
        },
        { 
            id: 'beach', 
            name: 'Stranden', 
            emoji: '🏖️', 
            description: 'Avkopplande plats med daily rewards', 
            activeUsers: 89,
            unlocked: true,
            levelRequired: 1,
            activities: ['relax']
        },
        { 
            id: 'castle', 
            name: 'Kungens Slott', 
            emoji: '🏰', 
            description: 'Möt kungen och få exklusiva quests', 
            activeUsers: 12,
            unlocked: false,
            levelRequired: 15,
            activities: ['quests']
        },
        { 
            id: 'desert', 
            name: 'Sandöknen', 
            emoji: '🏜️', 
            description: 'Hitta gömd skatt i sanden', 
            activeUsers: 8,
            unlocked: false,
            levelRequired: 20,
            activities: ['explore']
        },
        { 
            id: 'volcano', 
            name: 'Vulkanön', 
            emoji: '🌋', 
            description: 'Endast för de modigaste äventyrarna', 
            activeUsers: 3,
            unlocked: false,
            levelRequired: 30,
            activities: ['battles', 'explore']
        }
    ];

    let unlockedLocations = [];
    let visitedLocations = [];
    let currentLocation = 'home';

    // Ladda data
    function loadWorldData() {
        const savedUnlocked = Storage.load('unlocked_locations');
        if (savedUnlocked) {
            unlockedLocations = savedUnlocked;
        } else {
            unlockedLocations = WORLD_LOCATIONS.filter(l => l.unlocked).map(l => l.id);
        }
        
        const savedVisited = Storage.load('visited_locations');
        if (savedVisited) {
            visitedLocations = savedVisited;
        }
        
        const savedCurrent = Storage.load('current_location');
        if (savedCurrent) {
            currentLocation = savedCurrent;
        }
        
        return { unlockedLocations, visitedLocations, currentLocation };
    }

    // Spara data
    function saveWorldData() {
        Storage.save('unlocked_locations', unlockedLocations);
        Storage.save('visited_locations', visitedLocations);
        Storage.save('current_location', currentLocation);
    }

    // Lås upp ny plats
    function unlockLocation(locationId) {
        const location = WORLD_LOCATIONS.find(l => l.id === locationId);
        if (!location) return false;
        if (unlockedLocations.includes(locationId)) return true;
        
        const user = Storage.loadUser({});
        const petLevel = user.pet?.level || 1;
        
        if (petLevel >= location.levelRequired) {
            unlockedLocations.push(locationId);
            saveWorldData();
            
            Notifications.show(`🎉 Ny plats upplåst: ${location.name}!`, 'success');
            return true;
        }
        
        return false;
    }

    // Besök plats
    function visitLocation(locationId) {
        const location = WORLD_LOCATIONS.find(l => l.id === locationId);
        if (!location) return { success: false, message: 'Plats finns inte' };
        
        // Kolla om upplåst
        if (!unlockedLocations.includes(locationId)) {
            const unlocked = unlockLocation(locationId);
            if (!unlocked) {
                return { success: false, message: `Du måste vara level ${location.levelRequired} för att besöka ${location.name}` };
            }
        }
        
        // Registrera besök
        const today = Utils.getTodayString();
        const alreadyVisitedToday = visitedLocations.some(v => v.locationId === locationId && v.date === today);
        
        if (!alreadyVisitedToday) {
            visitedLocations.push({ locationId, date: today });
            saveWorldData();
            
            // Ge XP för att utforska nya platser
            const isFirstVisit = visitedLocations.filter(v => v.locationId === locationId).length === 1;
            if (isFirstVisit) {
                PetSystem.addExp(25);
                Notifications.show(`✨ Du utforskade ${location.name} för första gången! +25 XP`, 'info');
            } else {
                PetSystem.addExp(5);
            }
        }
        
        currentLocation = locationId;
        saveWorldData();
        
        // Kolla achievements
        const uniqueLocations = [...new Set(visitedLocations.map(v => v.locationId))];
        if (uniqueLocations.length >= 5) {
            const user = Storage.loadUser({});
            Achievements.checkAchievements({ ...user, locationsVisited: uniqueLocations });
        }
        
        return { success: true, location: location };
    }

    // Hämta aktuell plats
    function getCurrentLocation() {
        return WORLD_LOCATIONS.find(l => l.id === currentLocation) || WORLD_LOCATIONS[0];
    }

    // Hämta alla platser med status
    function getAllLocations() {
        const user = Storage.loadUser({});
        const petLevel = user.pet?.level || 1;
        
        return WORLD_LOCATIONS.map(location => ({
            ...location,
            isUnlocked: unlockedLocations.includes(location.id),
            isLocked: !unlockedLocations.includes(location.id) && petLevel < location.levelRequired,
            levelRequired: location.levelRequired,
            canUnlock: petLevel >= location.levelRequired && !unlockedLocations.includes(location.id)
        }));
    }

    // Rendera världskartan
    function renderWorldMap(container) {
        const locations = getAllLocations();
        const user = Storage.loadUser({});
        const petLevel = user.pet?.level || 1;
        
        container.innerHTML = `
            <div class="glass-card" style="margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-size: 20px; font-weight: bold;">🌍 UTFORSKA VÄRLDEN</div>
                        <div style="font-size: 12px; color: #888;">Din pet är level ${petLevel}</div>
                    </div>
                    <div class="stat-badge">🏆 ${visitedLocations.length}/${WORLD_LOCATIONS.length} platser</div>
                </div>
            </div>
            
            <div class="grid-2">
                ${locations.map(location => `
                    <div class="world-region ${!location.isUnlocked ? 'locked' : ''}" 
                         style="background: linear-gradient(135deg, ${location.isUnlocked ? 'rgba(57,255,20,0.1)' : 'rgba(100,100,100,0.1)'}, rgba(0,0,0,0.5)); 
                                border-radius: 25px; padding: 20px; margin-bottom: 15px; 
                                ${!location.isUnlocked ? 'opacity: 0.6;' : 'cursor: pointer;'}"
                         onclick="${location.isUnlocked ? `WorldSystem.goToLocation('${location.id}')` : ''}">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="font-size: 40px;">${location.emoji}</div>
                            ${!location.isUnlocked ? `<div style="font-size: 12px; background: rgba(0,0,0,0.5); padding: 4px 8px; border-radius: 20px;">🔒 Lv.${location.levelRequired}</div>` : ''}
                        </div>
                        <div style="font-weight: bold; margin: 8px 0;">${location.name}</div>
                        <div style="font-size: 11px; color: #888; margin-bottom: 8px;">${location.description}</div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="font-size: 10px; color: #39FF14;">👥 ${location.activeUsers} här</div>
                            ${location.isUnlocked && visitedLocations.some(v => v.locationId === location.id && v.date === Utils.getTodayString()) ? 
                                '<div style="font-size: 10px; color: #39FF14;">✅ Besökt idag</div>' : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Gå till plats
    function goToLocation(locationId) {
        const result = visitLocation(locationId);
        if (result.success) {
            Notifications.show(`🌟 Du är nu i ${result.location.name}!`, 'success');
            
            // Uppdatera UI baserat på platsens aktiviteter
            if (window.switchToLocationView) {
                window.switchToLocationView(result.location);
            }
        } else {
            Notifications.show(result.message, 'error');
        }
    }

    // Hämta aktiviteter för aktuell plats
    function getLocationActivities() {
        const location = getCurrentLocation();
        return location.activities || [];
    }

    // Daglig reset av besök
    function checkDailyReset() {
        const lastReset = Storage.load('last_world_reset');
        const today = Utils.getTodayString();
        
        if (lastReset !== today) {
            // Rensa dagliga besök (men behåll historik)
            const uniqueVisits = visitedLocations.filter((v, index, self) => 
                self.findIndex(v2 => v2.locationId === v.locationId) === index
            );
            visitedLocations = uniqueVisits;
            saveWorldData();
            Storage.save('last_world_reset', today);
        }
    }

    return {
        loadWorldData,
        unlockLocation,
        visitLocation,
        getCurrentLocation,
        getAllLocations,
        renderWorldMap,
        goToLocation,
        getLocationActivities,
        checkDailyReset,
        WORLD_LOCATIONS
    };
})();

window.WorldSystem = WorldSystem;