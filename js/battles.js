// ============ PETVERSE BATTLE SYSTEM ============
// Version 1.0 - Pet vs Pet strider

const BattleSystem = (function() {
    let activeBattle = null;
    let battleInterval = null;

    // AI-motståndare
    const AI_OPPONENTS = [
        { name: 'Skogsvätte', emoji: '🌲', petType: 'wolf', level: 1, rewardCoins: 50, rewardExp: 30 },
        { name: 'Eldsprutare', emoji: '🔥', petType: 'dragon', level: 3, rewardCoins: 100, rewardExp: 60 },
        { name: 'Isdemon', emoji: '❄️', petType: 'phoenix', level: 5, rewardCoins: 150, rewardExp: 90 },
        { name: 'Mörkrets Riddare', emoji: '⚔️', petType: 'wolf', level: 8, rewardCoins: 250, rewardExp: 150 },
        { name: 'Uråldrig Drake', emoji: '🐉', petType: 'dragon', level: 12, rewardCoins: 500, rewardExp: 300 },
        { name: 'Fenix Konung', emoji: '👑', petType: 'phoenix', level: 15, rewardCoins: 750, rewardExp: 450 }
    ];

    // Starta battle mot AI
    function startBattle(opponentIndex = 0) {
        const opponent = AI_OPPONENTS[Math.min(opponentIndex, AI_OPPONENTS.length - 1)];
        const playerPet = PetSystem.getPet();
        const playerStats = {
            type: PetSystem.getPetType(),
            currentHp: playerPet.currentHp,
            maxHp: PetSystem.getMaxHp(),
            currentEnergy: playerPet.currentEnergy,
            maxEnergy: 100,
            level: playerPet.level
        };
        
        const opponentPetType = PetSystem.PET_TYPES[opponent.petType];
        const opponentMaxHp = opponentPetType.baseHp + (opponent.level - 1) * 10;
        
        const opponentStats = {
            type: opponentPetType,
            name: opponent.name,
            emoji: opponent.emoji,
            currentHp: opponentMaxHp,
            maxHp: opponentMaxHp,
            level: opponent.level,
            rewardCoins: opponent.rewardCoins,
            rewardExp: opponent.rewardExp
        };
        
        activeBattle = {
            player: playerStats,
            opponent: opponentStats,
            turn: 'player', // player eller opponent
            log: [],
            winner: null
        };
        
        renderBattleUI();
        return activeBattle;
    }

    // Utför spelar-attack
    function playerAttack(abilityIndex) {
        if (!activeBattle || activeBattle.winner) return false;
        if (activeBattle.turn !== 'player') {
            Notifications.show('❌ Vänta på motståndarens tur!', 'error');
            return false;
        }
        
        const ability = PetSystem.useAbility(abilityIndex);
        if (!ability) return false;
        
        // Beräkna skada
        const damage = Math.floor(ability.damage + Math.random() * 10 - 5);
        activeBattle.opponent.currentHp = Math.max(0, activeBattle.opponent.currentHp - damage);
        
        // Lägg till i logg
        activeBattle.log.push({
            turn: 'player',
            action: ability.name,
            damage: damage,
            message: `${PetSystem.getPetType().name} använde ${ability.name} och gjorde ${damage} skada!`
        });
        
        // Kolla om motståndaren är besegrad
        if (activeBattle.opponent.currentHp <= 0) {
            endBattle(true);
            return true;
        }
        
        // Byt tur
        activeBattle.turn = 'opponent';
        renderBattleUI();
        
        // AI-tur efter kort fördröjning
        setTimeout(() => opponentTurn(), 1000);
        
        return true;
    }

    // AI-tur
    function opponentTurn() {
        if (!activeBattle || activeBattle.winner) return;
        if (activeBattle.turn !== 'opponent') return;
        
        // AI väljer random ability
        const opponentAbilities = activeBattle.opponent.type.abilities;
        const randomAbility = opponentAbilities[Math.floor(Math.random() * opponentAbilities.length)];
        
        // Beräkna AI-skada
        const baseDamage = randomAbility.damage + Math.floor(activeBattle.opponent.level * 2);
        const damage = Math.floor(baseDamage + Math.random() * 15 - 7);
        
        activeBattle.player.currentHp = Math.max(0, activeBattle.player.currentHp - damage);
        
        activeBattle.log.push({
            turn: 'opponent',
            action: randomAbility.name,
            damage: damage,
            message: `${activeBattle.opponent.name} använde ${randomAbility.name} och gjorde ${damage} skada!`
        });
        
        // Kolla om spelaren är besegrad
        if (activeBattle.player.currentHp <= 0) {
            endBattle(false);
            return;
        }
        
        activeBattle.turn = 'player';
        renderBattleUI();
    }

    // Avsluta battle
    function endBattle(won) {
        if (!activeBattle) return;
        
        activeBattle.winner = won ? 'player' : 'opponent';
        
        if (won) {
            // Ge belöningar
            const coinsReward = activeBattle.opponent.rewardCoins;
            const expReward = activeBattle.opponent.rewardExp;
            
            const user = Storage.loadUser({});
            user.coins = (user.coins || 0) + coinsReward;
            Storage.saveUser(user);
            
            PetSystem.addExp(expReward);
            PetSystem.recordBattleResult(true);
            
            Notifications.show(`🎉 VINST! Du fick ${coinsReward} coins och ${expReward} XP!`, 'success');
            
            // Kolla achievements
            Achievements.checkAchievements(user);
        } else {
            PetSystem.recordBattleResult(false);
            Notifications.show(`💀 FÖRLUST! Din pet förlorade striden...`, 'error');
        }
        
        renderBattleUI();
        
        // Stäng battle efter 3 sekunder
        setTimeout(() => {
            if (window.closeBattle) window.closeBattle();
        }, 3000);
    }

    // Rendera battle UI
    function renderBattleUI() {
        const container = document.getElementById('battleContent');
        if (!container) return;
        
        if (!activeBattle) {
            // Välj motståndare
            container.innerHTML = `
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="font-size: 24px; font-weight: bold;">⚔️ VÄLJ MOTSTÅNDARE ⚔️</div>
                    <div style="font-size: 12px; color: #888;">Vinn strider för att tjäna coins och XP!</div>
                </div>
                <div class="grid-2">
                    ${AI_OPPONENTS.map((opp, idx) => `
                        <div class="grid-item" onclick="BattleSystem.startBattle(${idx})">
                            <div style="font-size: 40px;">${opp.emoji}</div>
                            <div style="font-weight: bold;">${opp.name}</div>
                            <div style="font-size: 11px; color: #39FF14;">Lv.${opp.level}</div>
                            <div style="font-size: 10px; color: #888;">💰 ${opp.rewardCoins} | ⚡ ${opp.rewardExp} XP</div>
                        </div>
                    `).join('')}
                </div>
            `;
            return;
        }
        
        const player = activeBattle.player;
        const opponent = activeBattle.opponent;
        const playerHpPercent = (player.currentHp / player.maxHp) * 100;
        const opponentHpPercent = (opponent.currentHp / opponent.maxHp) * 100;
        const playerEnergyPercent = (player.currentEnergy / player.maxEnergy) * 100;
        
        const petType = PetSystem.getPetType();
        
        container.innerHTML = `
            <div class="battle-arena">
                <div class="battle-pet">
                    <div class="battle-pet-emoji">${petType.emoji}</div>
                    <div style="font-weight: bold;">${petType.name}</div>
                    <div>Lv.${player.level}</div>
                    <div class="battle-health">
                        <div class="battle-health-fill" style="width: ${playerHpPercent}%"></div>
                    </div>
                    <div>❤️ ${player.currentHp}/${player.maxHp}</div>
                    <div class="battle-health" style="background: #39FF1420;">
                        <div class="battle-health-fill" style="width: ${playerEnergyPercent}%; background: #39FF14;"></div>
                    </div>
                    <div>⚡ ${player.currentEnergy}/${player.maxEnergy}</div>
                </div>
                
                <div style="font-size: 30px;">VS</div>
                
                <div class="battle-pet">
                    <div class="battle-pet-emoji">${opponent.emoji}</div>
                    <div style="font-weight: bold;">${opponent.name}</div>
                    <div>Lv.${opponent.level}</div>
                    <div class="battle-health">
                        <div class="battle-health-fill" style="width: ${opponentHpPercent}%"></div>
                    </div>
                    <div>❤️ ${opponent.currentHp}/${opponent.maxHp}</div>
                </div>
            </div>
            
            <div class="battle-log" style="height: 150px; overflow-y: auto; background: rgba(0,0,0,0.3); border-radius: 20px; padding: 10px; margin: 15px 0;">
                ${activeBattle.log.slice(-5).map(log => `
                    <div style="font-size: 12px; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                        ${log.message}
                    </div>
                `).join('')}
                ${activeBattle.log.length === 0 ? '<div style="color: #888; text-align: center;">Välj en attack för att börja!</div>' : ''}
            </div>
            
            ${!activeBattle.winner && activeBattle.turn === 'player' ? `
                <div class="battle-actions">
                    ${petType.abilities.map((ability, idx) => `
                        <button class="battle-action" onclick="BattleSystem.playerAttack(${idx})" ${player.currentEnergy < ability.energyCost ? 'disabled style="opacity:0.5"' : ''}>
                            ${ability.emoji} ${ability.name} (${ability.energyCost}⚡)
                        </button>
                    `).join('')}
                </div>
            ` : ''}
            
            ${activeBattle.winner ? `
                <div style="text-align: center; margin-top: 20px;">
                    <div style="font-size: 24px; margin-bottom: 10px;">${activeBattle.winner === 'player' ? '🎉 VINST! 🎉' : '💀 FÖRLUST 💀'}</div>
                    <button class="btn-primary" onclick="window.closeBattle?.()">Stäng</button>
                </div>
            ` : ''}
            
            ${activeBattle.turn === 'opponent' && !activeBattle.winner ? `
                <div style="text-align: center; margin-top: 20px; color: #888;">Motståndaren funderar...</div>
            ` : ''}
        `;
        
        // Scrolla loggen till botten
        const logContainer = container.querySelector('.battle-log');
        if (logContainer) logContainer.scrollTop = logContainer.scrollHeight;
    }

    // Öppna battle modal
    function openBattle() {
        activeBattle = null;
        renderBattleUI();
        document.getElementById('battleModal').classList.remove('hidden');
    }

    // Stäng battle modal
    function closeBattle() {
        document.getElementById('battleModal').classList.add('hidden');
        activeBattle = null;
        if (battleInterval) clearInterval(battleInterval);
    }

    return {
        startBattle,
        playerAttack,
        endBattle,
        openBattle,
        closeBattle,
        renderBattleUI,
        AI_OPPONENTS
    };
})();

window.BattleSystem = BattleSystem;