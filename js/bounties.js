// ============ PETVERSE BOUNTIES SYSTEM ============
// Version 1.0 - Hantering av uppdrag och belöningar

const BountiesSystem = (function() {
    // Standard bounties
    let bounties = [
        { 
            id: 'b1', 
            title: '📸 Fota något blått', 
            description: 'Hitta något blått i verkligheten, fota och ladda upp!', 
            rewardCoins: 100, 
            rewardExp: 50,
            creator: 'Ella', 
            expires: '2026-06-01', 
            claims: [], 
            status: 'active',
            category: 'photo',
            requiredProof: 'image'
        },
        { 
            id: 'b2', 
            title: '🏃 Gå 5000 steg idag', 
            description: 'Visa en screenshot från din stegräknare som bevis.', 
            rewardCoins: 150, 
            rewardExp: 75,
            creator: 'Max', 
            expires: '2026-06-15', 
            claims: [], 
            status: 'active',
            category: 'fitness',
            requiredProof: 'screenshot'
        },
        { 
            id: 'b3', 
            title: '☕ Besök ett café', 
            description: 'Fota dig själv på ett café med en kopp kaffe.', 
            rewardCoins: 200, 
            rewardExp: 100,
            creator: 'MY PET', 
            expires: '2026-07-01', 
            claims: [], 
            status: 'active',
            category: 'social',
            requiredProof: 'image'
        },
        { 
            id: 'b4', 
            title: '🎮 Spela in med din pet', 
            description: 'Fota din pet (gosedjur eller teckning) på en cool plats.', 
            rewardCoins: 300, 
            rewardExp: 150,
            creator: 'Clara', 
            expires: '2026-06-20', 
            claims: [], 
            status: 'active',
            category: 'creative',
            requiredProof: 'image'
        },
        { 
            id: 'b5', 
            title: '💪 Träna i 30 min', 
            description: 'Visa bevis på att du tränat i minst 30 minuter.', 
            rewardCoins: 250, 
            rewardExp: 125,
            creator: 'Leo', 
            expires: '2026-06-10', 
            claims: [], 
            status: 'active',
            category: 'fitness',
            requiredProof: 'image'
        },
        { 
            id: 'b6', 
            title: '📚 Läs en bok i 1 timme', 
            description: 'Fota dig själv läsande med boken synlig.', 
            rewardCoins: 180, 
            rewardExp: 90,
            creator: 'Nova', 
            expires: '2026-06-25', 
            claims: [], 
            status: 'active',
            category: 'learning',
            requiredProof: 'image'
        }
    ];

    let userClaims = [];

    // Ladda bounties från storage
    function loadBounties() {
        const saved = Storage.load(Storage.KEYS.BOUNTIES);
        if (saved) {
            bounties = saved;
        }
        userClaims = Storage.load('user_claims', []);
        return bounties;
    }

    // Spara bounties
    function saveBounties() {
        Storage.save(Storage.KEYS.BOUNTIES, bounties);
        Storage.save('user_claims', userClaims);
    }

    // Skapa ny bounty
    function createBounty(title, description, rewardCoins, rewardExp, category = 'general') {
        if (!title || !description) return { success: false, message: 'Fyll i titel och beskrivning' };
        if (rewardCoins < 10 || rewardCoins > 10000) return { success: false, message: 'Belöning måste vara mellan 10-10000 coins' };
        
        const user = Storage.loadUser({});
        if (user.coins < rewardCoins) {
            return { success: false, message: `Du har inte tillräckligt med coins! Behöver ${rewardCoins} coins.` };
        }
        
        // Dra coins från skaparen
        user.coins -= rewardCoins;
        Storage.saveUser(user);
        
        const newBounty = {
            id: 'b' + Date.now(),
            title: title,
            description: description,
            rewardCoins: rewardCoins,
            rewardExp: rewardExp || 50,
            creator: user.name || 'Anonym',
            createdAt: new Date().toISOString(),
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            claims: [],
            status: 'active',
            category: category,
            requiredProof: 'image'
        };
        
        bounties.push(newBounty);
        saveBounties();
        
        if (window.updateUI) window.updateUI();
        
        return { success: true, message: `✅ Bounty "${title}" skapad!` };
    }

    // Claima bounty (lämna in bevis)
    function claimBounty(bountyId, proofImage, description) {
        const bounty = bounties.find(b => b.id === bountyId);
        if (!bounty) return { success: false, message: 'Bounty finns inte' };
        if (bounty.status !== 'active') return { success: false, message: 'Bounty är inte längre aktiv' };
        
        // Kolla om redan claimat
        const existingClaim = bounty.claims.find(c => c.userId === Storage.loadUser({}).id);
        if (existingClaim && existingClaim.status === 'pending') {
            return { success: false, message: 'Du har redan en claim som väntar på godkännande' };
        }
        
        const user = Storage.loadUser({});
        
        const newClaim = {
            id: 'c' + Date.now(),
            bountyId: bountyId,
            userId: user.id || 'user1',
            userName: user.name || 'Användare',
            proofImage: proofImage,
            description: description || '',
            submittedAt: new Date().toISOString(),
            status: 'pending' // pending, approved, rejected
        };
        
        bounty.claims.push(newClaim);
        userClaims.push(newClaim);
        saveBounties();
        
        return { success: true, message: '✅ Din claim är inskickad! Väntar på verifiering.' };
    }

    // Verifiera claim (godkänn eller avslå)
    function verifyClaim(bountyId, claimId, approved) {
        const bounty = bounties.find(b => b.id === bountyId);
        if (!bounty) return { success: false, message: 'Bounty finns inte' };
        
        const claim = bounty.claims.find(c => c.id === claimId);
        if (!claim) return { success: false, message: 'Claim finns inte' };
        
        if (approved) {
            claim.status = 'approved';
            
            // Ge belöning
            const user = Storage.loadUser({});
            user.coins = (user.coins || 0) + bounty.rewardCoins;
            Storage.saveUser(user);
            
            PetSystem.addExp(bounty.rewardExp);
            
            // Uppdatera user claims
            const userClaim = userClaims.find(uc => uc.id === claimId);
            if (userClaim) userClaim.status = 'approved';
            
            // Kolla achievements
            const completedCount = bounties.reduce((count, b) => {
                return count + b.claims.filter(c => c.userId === (user.id || 'user1') && c.status === 'approved').length;
            }, 0);
            
            if (completedCount >= 10) {
                Achievements.checkAchievements({ ...user, bountiesCompleted: bounties.flatMap(b => b.claims) });
            }
            
            saveBounties();
            if (window.updateUI) window.updateUI();
            
            return { success: true, message: `✅ Claim godkänd! ${claim.userName} fick ${bounty.rewardCoins} coins!` };
        } else {
            claim.status = 'rejected';
            const userClaim = userClaims.find(uc => uc.id === claimId);
            if (userClaim) userClaim.status = 'rejected';
            saveBounties();
            return { success: true, message: `❌ Claim avslogs.` };
        }
    }

    // Ta bort bounty
    function deleteBounty(bountyId) {
        const index = bounties.findIndex(b => b.id === bountyId);
        if (index === -1) return { success: false, message: 'Bounty finns inte' };
        
        const bounty = bounties[index];
        if (bounty.claims.length > 0) {
            return { success: false, message: 'Kan inte ta bort bounty med aktiva claims' };
        }
        
        bounties.splice(index, 1);
        saveBounties();
        
        return { success: true, message: 'Bounty borttagen' };
    }

    // Hämta användarens claims
    function getUserClaims() {
        const user = Storage.loadUser({});
        return userClaims.filter(c => c.userId === (user.id || 'user1'));
    }

    // Hämta godkända claims för användaren
    function getCompletedBounties() {
        const user = Storage.loadUser({});
        return bounties.flatMap(b => 
            b.claims.filter(c => c.userId === (user.id || 'user1') && c.status === 'approved')
        );
    }

    // Rendera bounties UI
    function renderBounties(container) {
        const user = Storage.loadUser({});
        const userCompleted = getCompletedBounties();
        const userPending = getUserClaims().filter(c => c.status === 'pending');
        
        container.innerHTML = `
            <div class="glass-card">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 20px; font-weight: bold;">🎯 AKTIVA BOUNTIES</span>
                    <span class="stat-badge">💰 ${user.coins || 0}</span>
                </div>
            </div>
            
            <div style="margin: 20px 0;">
                ${bounties.filter(b => b.status === 'active').map(bounty => `
                    <div class="bounty-card">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="font-weight: bold; font-size: 16px;">${bounty.title}</div>
                            <div style="color: #39FF14;">+${bounty.rewardCoins}💰 +${bounty.rewardExp}⚡</div>
                        </div>
                        <div style="font-size: 12px; color: #888; margin: 8px 0;">${bounty.description}</div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="font-size: 10px; color: #555;">Skapad av: ${bounty.creator} · Exp: ${bounty.expires}</div>
                            <button class="btn-primary" style="padding: 8px 16px; font-size: 12px;" onclick="BountiesSystem.openClaimModal('${bounty.id}')">
                                🎯 Gör uppdrag
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div style="margin: 20px 0;">
                <div style="font-weight: bold; margin-bottom: 12px;">📋 MINA UPPDRAG</div>
                ${userPending.length === 0 && userCompleted.length === 0 ? 
                    '<div class="glass-card" style="text-align: center; color: #888;">Inga uppdrag än</div>' : 
                    `
                        ${userPending.map(claim => {
                            const bounty = bounties.find(b => b.id === claim.bountyId);
                            return `
                                <div class="glass-card" style="border-left: 3px solid #ff9900;">
                                    <div style="display: flex; justify-content: space-between;">
                                        <span style="font-weight: bold;">${bounty?.title || 'Uppdrag'}</span>
                                        <span class="claim-status status-pending">⏳ Väntar</span>
                                    </div>
                                    <div style="font-size: 11px; color: #888;">Inskickat: ${new Date(claim.submittedAt).toLocaleDateString()}</div>
                                </div>
                            `;
                        }).join('')}
                        ${userCompleted.map(claim => {
                            const bounty = bounties.find(b => b.id === claim.bountyId);
                            return `
                                <div class="glass-card" style="border-left: 3px solid #39FF14;">
                                    <div style="display: flex; justify-content: space-between;">
                                        <span style="font-weight: bold;">${bounty?.title || 'Uppdrag'}</span>
                                        <span class="claim-status status-approved">✅ Godkänd</span>
                                    </div>
                                    <div style="font-size: 11px; color: #39FF14;">+${bounty?.rewardCoins || 0} coins, +${bounty?.rewardExp || 0} XP</div>
                                </div>
                            `;
                        }).join('')}
                    `
                }
            </div>
            
            <button class="btn-primary" onclick="BountiesSystem.openCreateModal()">➕ SKAPA NYTT UPPDRAG</button>
        `;
    }

    // Öppna claim modal
    function openClaimModal(bountyId) {
        const bounty = bounties.find(b => b.id === bountyId);
        if (!bounty) return;
        
        // Skapa image upload input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (ev) => {
                const proofImage = ev.target.result;
                const description = prompt('Beskriv ditt bevis (valfritt):', 'Jag gjorde uppdraget!');
                const result = claimBounty(bountyId, proofImage, description || '');
                alert(result.message);
                if (result.success && window.renderCurrentView) window.renderCurrentView();
            };
            reader.readAsDataURL(file);
        };
        input.click();
    }

    // Öppna create bounty modal
    function openCreateModal() {
        const title = prompt('Vad heter uppdraget?', '📸 Fota något coolt');
        if (!title) return;
        const description = prompt('Beskriv vad man ska göra:', 'Fota och ladda upp bevis');
        if (!description) return;
        const reward = parseInt(prompt('Belöning i coins (10-10000):', '100'));
        if (isNaN(reward)) return;
        
        const result = createBounty(title, description, reward, Math.floor(reward / 2));
        alert(result.message);
        if (result.success && window.renderCurrentView) window.renderCurrentView();
    }

    return {
        loadBounties,
        createBounty,
        claimBounty,
        verifyClaim,
        deleteBounty,
        getUserClaims,
        getCompletedBounties,
        renderBounties,
        openClaimModal,
        openCreateModal,
        bounties
    };
})();

window.BountiesSystem = BountiesSystem;