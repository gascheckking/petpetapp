// ============ PETVERSE ACHIEVEMENTS ============
// Version 1.0 - Hantering av badges och prestationer

const Achievements = (function() {
    // Alla achievements i spelet
    const ACHIEVEMENTS_LIST = [
        { id: 'first_post', name: 'Första inlägget', description: 'Publicera ditt första inlägg', emoji: '📸', rewardCoins: 50, rewardExp: 50, requirement: { type: 'posts', count: 1 } },
        { id: 'social_butterfly', name: 'Social Butterfly', description: 'Möt 10 vänner IRL', emoji: '🦋', rewardCoins: 200, rewardExp: 150, requirement: { type: 'meetings', count: 10 } },
        { id: 'level_5', name: 'Äventyrare', description: 'Nå level 5 med din pet', emoji: '⭐', rewardCoins: 100, rewardExp: 100, requirement: { type: 'level', count: 5 } },
        { id: 'level_10', name: 'Mästare', description: 'Nå level 10 med din pet', emoji: '🏆', rewardCoins: 300, rewardExp: 200, requirement: { type: 'level', count: 10 } },
        { id: 'level_25', name: 'Legend', description: 'Nå level 25 med din pet', emoji: '👑', rewardCoins: 1000, rewardExp: 500, requirement: { type: 'level', count: 25 } },
        { id: 'streak_7', name: 'On Fire', description: '7 dagars streak', emoji: '🔥', rewardCoins: 150, rewardExp: 100, requirement: { type: 'streak', count: 7 } },
        { id: 'streak_30', name: 'Legendär Streak', description: '30 dagars streak', emoji: '💎', rewardCoins: 500, rewardExp: 300, requirement: { type: 'streak', count: 30 } },
        { id: 'shopaholic', name: 'Shopaholic', description: 'Handla 5 items i shoppen', emoji: '🛍️', rewardCoins: 100, rewardExp: 80, requirement: { type: 'purchases', count: 5 } },
        { id: 'bounty_hunter', name: 'Bounty Hunter', description: 'Slutför 10 bounties', emoji: '🎯', rewardCoins: 300, rewardExp: 200, requirement: { type: 'bounties_completed', count: 10 } },
        { id: 'battle_winner', name: 'Battle Champion', description: 'Vinn 10 pet battles', emoji: '⚔️', rewardCoins: 250, rewardExp: 150, requirement: { type: 'battle_wins', count: 10 } },
        { id: 'collector', name: 'Samlare', description: 'Samla 5 olika skins', emoji: '🎨', rewardCoins: 200, rewardExp: 100, requirement: { type: 'skins', count: 5 } },
        { id: 'millionaire', name: 'Miljonär', description: 'Samla 1000 coins', emoji: '💰', rewardCoins: 500, rewardExp: 200, requirement: { type: 'coins', count: 1000 } },
        { id: 'explorer', name: 'Utforskare', description: 'Besök 5 olika platser', emoji: '🗺️', rewardCoins: 150, rewardExp: 100, requirement: { type: 'locations_visited', count: 5 } },
        { id: 'friendly', name: 'Vänlig', description: 'Ha 5 vänner i appen', emoji: '🤝', rewardCoins: 100, rewardExp: 80, requirement: { type: 'friends', count: 5 } },
        { id: 'post_master', name: 'Post Mästare', description: 'Publicera 20 inlägg', emoji: '📝', rewardCoins: 200, rewardExp: 150, requirement: { type: 'posts', count: 20 } },
        { id: 'liked', name: 'Populär', description: 'Få 100 likes totalt', emoji: '❤️', rewardCoins: 200, rewardExp: 100, requirement: { type: 'likes_received', count: 100 } },
        { id: 'early_bird', name: 'Early Bird', description: 'Gå med under första veckan', emoji: '🌅', rewardCoins: 500, rewardExp: 250, requirement: { type: 'early_adopter', count: 1 } }
    ];

    let unlockedAchievements = [];

    // Ladda achievements
    function loadAchievements() {
        unlockedAchievements = Storage.loadAchievements([]);
        return unlockedAchievements;
    }

    // Spara achievements
    function saveAchievements() {
        Storage.saveAchievements(unlockedAchievements);
    }

    // Kolla om achievement är upplåst
    function isUnlocked(achievementId) {
        return unlockedAchievements.includes(achievementId);
    }

    // Lås upp achievement
    function unlockAchievement(achievementId) {
        if (isUnlocked(achievementId)) return false;
        
        const achievement = ACHIEVEMENTS_LIST.find(a => a.id === achievementId);
        if (!achievement) return false;
        
        unlockedAchievements.push(achievementId);
        saveAchievements();
        
        // Ge belöning
        const user = Storage.loadUser({});
        user.coins = (user.coins || 0) + achievement.rewardCoins;
        Storage.saveUser(user);
        
        // Uppdatera UI
        Notifications.show(`🏆 NY BADGE! ${achievement.name}\n+${achievement.rewardCoins} coins!`, 'achievement');
        
        if (window.updateUI) window.updateUI();
        
        return true;
    }

    // Kolla och uppdatera achievements baserat på användardata
    function checkAchievements(userData) {
        const stats = {
            posts: userData.posts?.length || 0,
            meetings: userData.meetings || 0,
            level: userData.pet?.level || 1,
            streak: userData.streak || 0,
            purchases: userData.purchases?.length || 0,
            bounties_completed: userData.bountiesCompleted?.length || 0,
            battle_wins: userData.pet?.battleWins || 0,
            skins: userData.pet?.skins?.length || 1,
            coins: userData.coins || 0,
            locations_visited: userData.locationsVisited?.length || 0,
            friends: userData.friends?.length || 0,
            likes_received: userData.likesReceived || 0
        };
        
        for (const achievement of ACHIEVEMENTS_LIST) {
            if (isUnlocked(achievement.id)) continue;
            
            const req = achievement.requirement;
            let completed = false;
            
            switch (req.type) {
                case 'posts':
                    completed = stats.posts >= req.count;
                    break;
                case 'meetings':
                    completed = stats.meetings >= req.count;
                    break;
                case 'level':
                    completed = stats.level >= req.count;
                    break;
                case 'streak':
                    completed = stats.streak >= req.count;
                    break;
                case 'purchases':
                    completed = stats.purchases >= req.count;
                    break;
                case 'bounties_completed':
                    completed = stats.bounties_completed >= req.count;
                    break;
                case 'battle_wins':
                    completed = stats.battle_wins >= req.count;
                    break;
                case 'skins':
                    completed = stats.skins >= req.count;
                    break;
                case 'coins':
                    completed = stats.coins >= req.count;
                    break;
                case 'locations_visited':
                    completed = stats.locations_visited >= req.count;
                    break;
                case 'friends':
                    completed = stats.friends >= req.count;
                    break;
                case 'likes_received':
                    completed = stats.likes_received >= req.count;
                    break;
                case 'early_adopter':
                    completed = req.count === 1;
                    break;
            }
            
            if (completed) {
                unlockAchievement(achievement.id);
            }
        }
    }

    // Hämta alla achievements med status
    function getAllAchievements() {
        return ACHIEVEMENTS_LIST.map(ach => ({
            ...ach,
            unlocked: isUnlocked(ach.id)
        }));
    }

    // Hämta antal upplåsta achievements
    function getUnlockedCount() {
        return unlockedAchievements.length;
    }

    // Hämta totalt antal achievements
    function getTotalCount() {
        return ACHIEVEMENTS_LIST.length;
    }

    // Render achievements UI
    function renderAchievements(container) {
        const achievements = getAllAchievements();
        container.innerHTML = achievements.map(ach => `
            <div class="achievement-card ${ach.unlocked ? '' : 'achievement-locked'}">
                <div style="font-size: 32px;">${ach.emoji}</div>
                <div style="flex: 1;">
                    <div style="font-weight: bold;">${ach.name}</div>
                    <div style="font-size: 11px; color: #888;">${ach.description}</div>
                    <div style="font-size: 10px; color: #39FF14;">+${ach.rewardCoins} coins</div>
                </div>
                ${ach.unlocked ? '<div style="color: #39FF14;">✅</div>' : '<div style="color: #555;">🔒</div>'}
            </div>
        `).join('');
    }

    return {
        loadAchievements,
        isUnlocked,
        unlockAchievement,
        checkAchievements,
        getAllAchievements,
        getUnlockedCount,
        getTotalCount,
        renderAchievements,
        ACHIEVEMENTS_LIST
    };
})();

window.Achievements = Achievements;