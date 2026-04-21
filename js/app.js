// ============ PETVERSE MAIN APP ============
// Version 1.0 - Huvudlogik och navigation

// Globala variabler
let currentView = 'feed';
let currentLocationView = null;

// Initiera appen
async function initApp() {
    console.log('🚀 PETVERSE startar...');
    
    // Ladda alla system
    Storage.loadUser({});
    PetSystem.loadPet();
    Achievements.loadAchievements();
    SocialSystem.loadPosts();
    BountiesSystem.loadBounties();
    WorldSystem.loadWorldData();
    WorldSystem.checkDailyReset();
    
    // Skapa 3D bakgrund
    createStars();
    
    // Uppdatera UI
    updateUI();
    
    // Sätt upp navigation
    setupNavigation();
    
    // Starta dagliga påminnelser
    Notifications.scheduleDailyReminders();
    
    // Begär notis-tillstånd
    setTimeout(() => {
        Notifications.requestPushPermission();
    }, 5000);
    
    console.log('✅ PETVERSE redo!');
}

// Skapa stjärnor i bakgrunden
function createStars() {
    const bg = document.getElementById('universeBg');
    if (!bg) return;
    
    // Rensa befintliga
    bg.innerHTML = '';
    
    // Skapa stjärnor
    for (let i = 0; i < 200; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.width = Math.random() * 3 + 1 + 'px';
        star.style.height = star.style.width;
        star.style.animationDelay = Math.random() * 5 + 's';
        star.style.animationDuration = Math.random() * 3 + 2 + 's';
        bg.appendChild(star);
    }
    
    // Skapa nebulosor
    for (let i = 0; i < 5; i++) {
        const nebula = document.createElement('div');
        nebula.className = 'nebula';
        nebula.style.left = Math.random() * 80 + '%';
        nebula.style.top = Math.random() * 80 + '%';
        nebula.style.width = Math.random() * 200 + 100 + 'px';
        nebula.style.height = nebula.style.width;
        nebula.style.animationDelay = Math.random() * 5 + 's';
        nebula.style.animationDuration = Math.random() * 15 + 10 + 's';
        bg.appendChild(nebula);
    }
}

// Uppdatera UI (top bar etc)
function updateUI() {
    const user = Storage.loadUser({});
    const pet = PetSystem.getPet();
    const petType = PetSystem.getPetType();
    
    // Uppdatera top bar
    const topAvatar = document.getElementById('topAvatar');
    const topStreak = document.getElementById('topStreak');
    const topCoins = document.getElementById('topCoins');
    const topEnergy = document.getElementById('topEnergy');
    const topLevel = document.getElementById('topLevel');
    
    if (topAvatar) topAvatar.innerHTML = petType.emoji;
    if (topStreak) topStreak.innerHTML = user.streak || 0;
    if (topCoins) topCoins.innerHTML = user.coins || 0;
    if (topEnergy) topEnergy.innerHTML = pet.currentEnergy || 100;
    if (topLevel) topLevel.innerHTML = `Lv.${pet.level}`;
    
    // Uppdatera världskartan
    renderWorldMap();
}

// Rendera världskartan
function renderWorldMap() {
    const container = document.getElementById('worldMap');
    if (!container) return;
    
    const locations = WorldSystem.getAllLocations();
    const currentLocation = WorldSystem.getCurrentLocation();
    
    container.innerHTML = locations.map(location => `
        <div class="location-card ${currentLocation.id === location.id ? 'active' : ''} ${!location.isUnlocked ? 'locked' : ''}" 
             onclick="WorldSystem.goToLocation('${location.id}')"
             style="${!location.isUnlocked ? 'opacity: 0.6;' : ''}">
            <div class="location-emoji">${location.emoji}</div>
            <div class="location-name">${location.name}</div>
            <div class="location-status">${location.isUnlocked ? `👥 ${location.activeUsers}` : `🔒 Lv.${location.levelRequired}`}</div>
        </div>
    `).join('');
}

// Sätt upp navigation
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-item');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const nav = btn.getAttribute('data-nav');
            if (nav) {
                switchView(nav);
            }
        });
    });
    
    // Sätt default vy
    switchView('feed');
}

// Byt vy
function switchView(view) {
    currentView = view;
    
    // Uppdatera navigations-ikoner
    const navIcons = document.querySelectorAll('.nav-icon');
    navIcons.forEach(icon => icon.classList.remove('active'));
    
    const activeIcon = document.querySelector(`.nav-item[data-nav="${view}"] .nav-icon`);
    if (activeIcon) activeIcon.classList.add('active');
    
    const navLabels = document.querySelectorAll('.nav-label');
    navLabels.forEach(label => label.classList.remove('active'));
    
    const activeLabel = document.querySelector(`.nav-item[data-nav="${view}"] .nav-label`);
    if (activeLabel) activeLabel.classList.add('active');
    
    // Rendera rätt vy
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;
    
    switch(view) {
        case 'feed':
            renderFeedView(mainContent);
            break;
        case 'shop':
            renderShopView(mainContent);
            break;
        case 'world':
            renderWorldView(mainContent);
            break;
        case 'profile':
            renderProfileView(mainContent);
            break;
        default:
            renderFeedView(mainContent);
    }
}

// Rendera feed-vy
function renderFeedView(container) {
    container.innerHTML = '<div class="feed-container" id="feedContainer"></div>';
    const feedContainer = document.getElementById('feedContainer');
    SocialSystem.renderFeed(feedContainer);
}

// Rendera shop-vy
function renderShopView(container) {
    ShopSystem.renderShop(container);
}

// Rendera world-vy
function renderWorldView(container) {
    WorldSystem.renderWorldMap(container);
}

// Rendera profile-vy
function renderProfileView(container) {
    const user = Storage.loadUser({});
    const pet = PetSystem.getPet();
    const petType = PetSystem.getPetType();
    const expPercent = PetSystem.getLevelProgress();
    const achievements = Achievements.getAllAchievements();
    const unlockedCount = Achievements.getUnlockedCount();
    const inventory = ShopSystem.getInventory();
    const completedBounties = BountiesSystem.getCompletedBounties();
    
    container.innerHTML = `
        <div class="profile-screen">
            <div class="profile-header">
                <div class="profile-avatar">${petType.emoji}</div>
                <div style="font-size: 24px; font-weight: bold;">${user.name || 'Äventyrare'}</div>
                <div style="color: #888;">${petType.name} · Level ${pet.level}</div>
            </div>
            
            <div class="stats-row">
                <div class="stat">
                    <div class="stat-value">${user.streak || 0}</div>
                    <div class="stat-label">Streak</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${user.meetings || 0}</div>
                    <div class="stat-label">Möten</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${user.coins || 0}</div>
                    <div class="stat-label">Coins</div>
                </div>
            </div>
            
            <div class="pet-detail">
                <div class="exp-bar">
                    <div class="exp-fill" style="width: ${expPercent}%"></div>
                </div>
                <div>${pet.exp}/${PetSystem.getExpNeededForNextLevel()} XP till level ${pet.level + 1}</div>
                <div class="abilities">
                    ${petType.abilities.map(a => `<span class="ability">${a.emoji} ${a.name}</span>`).join('')}
                </div>
            </div>
            
            <div style="margin: 20px 0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <div style="font-weight: bold;">🏆 BADGES</div>
                    <div style="font-size: 12px; color: #39FF14;">${unlockedCount}/${achievements.length}</div>
                </div>
                <div class="badges-grid" style="display: flex; flex-wrap: wrap; gap: 10px;">
                    ${achievements.slice(0, 6).map(ach => `
                        <div class="badge-card ${ach.unlocked ? 'unlocked' : ''}" style="text-align: center; padding: 10px; background: ${ach.unlocked ? 'rgba(57,255,20,0.1)' : 'rgba(255,255,255,0.05)'}; border-radius: 20px; min-width: 80px;">
                            <div style="font-size: 30px;">${ach.emoji}</div>
                            <div style="font-size: 10px;">${ach.name}</div>
                        </div>
                    `).join('')}
                    ${achievements.length > 6 ? `<div style="text-align: center; padding: 10px; color: #888;">+${achievements.length - 6} fler</div>` : ''}
                </div>
            </div>
            
            <div style="margin: 20px 0;">
                <div style="font-weight: bold; margin-bottom: 12px;">🎒 INVENTORY</div>
                <div class="inventory-grid" style="display: flex; flex-wrap: wrap; gap: 10px;">
                    ${inventory.length === 0 ? '<div style="color: #888;">Tomt inventory. Handla i shoppen!</div>' : inventory.slice(0, 6).map(item => `
                        <div class="inventory-item" style="text-align: center; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 20px; min-width: 70px;">
                            <div style="font-size: 30px;">${item.emoji || '📦'}</div>
                            <div style="font-size: 10px;">${item.name}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div style="margin: 20px 0;">
                <div style="font-weight: bold; margin-bottom: 12px;">📋 STATISTIK</div>
                <div class="glass-card">
                    <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                        <span>Totalt möten:</span>
                        <span style="color: #39FF14;">${user.meetings || 0}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                        <span>Slutförda uppdrag:</span>
                        <span style="color: #39FF14;">${completedBounties.length}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                        <span>Battle vinster:</span>
                        <span style="color: #39FF14;">${pet.battleWins || 0}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                        <span>Inlösta koder:</span>
                        <span style="color: #39FF14;">${user.collectedCodes?.length || 0}</span>
                    </div>
                </div>
            </div>
            
            <button class="btn-primary" onclick="shareProfile()">📤 DELA PROFIL</button>
        </div>
    `;
}

// Dela profil
async function shareProfile() {
    const user = Storage.loadUser({});
    const pet = PetSystem.getPet();
    const petType = PetSystem.getPetType();
    
    const shareText = `🔥 ${user.name || 'Äventyrare'} - ${petType.name} Level ${pet.level}!\n${user.streak || 0} dagars streak!\n${user.meetings || 0} IRL-möten!\n${user.coins || 0} coins!\n\nLadda ner PETVERSE!`;
    
    const shared = await Utils.share({
        title: 'PETVERSE',
        text: shareText,
        url: window.location.href
    });
    
    if (!shared) {
        alert(shareText);
    }
}

// Globala funktioner för onclick
window.updateUI = updateUI;
window.shareProfile = shareProfile;
window.switchView = switchView;
window.renderCurrentView = () => switchView(currentView);

// Exponera system globalt
window.PetSystem = PetSystem;
window.ShopSystem = ShopSystem;
window.BountiesSystem = BountiesSystem;
window.SocialSystem = SocialSystem;
window.WorldSystem = WorldSystem;
window.ChatSystem = ChatSystem;
window.Achievements = Achievements;
window.Notifications = Notifications;
window.Utils = Utils;
window.Storage = Storage;

// Starta appen när sidan laddats
document.addEventListener('DOMContentLoaded', initApp);