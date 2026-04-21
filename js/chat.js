// ============ PETVERSE CHAT SYSTEM ============
// Version 1.0 - Live chat meddelanden

const ChatSystem = (function() {
    let messages = [];
    let activeUsers = [];
    let chatInterval = null;

    // Standard meddelanden
    const DEFAULT_MESSAGES = [
        { id: 'm1', userId: 'ella', userName: 'Ella', userAvatar: '👩‍🎤', message: 'Hej alla! Någon som vill mötas upp?', timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
        { id: 'm2', userId: 'max', userName: 'Max', userAvatar: '🧑‍🚀', message: 'Jag är i Shopping Plaza just nu!', timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString() },
        { id: 'm3', userId: 'clara', userName: 'Clara', userAvatar: '👩‍💻', message: 'Någon som vill battle?', timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString() }
    ];

    // Ladda meddelanden
    function loadMessages() {
        const saved = Storage.load('chat_messages');
        if (saved && saved.length > 0) {
            messages = saved;
        } else {
            messages = [...DEFAULT_MESSAGES];
            saveMessages();
        }
        return messages;
    }

    // Spara meddelanden
    function saveMessages() {
        // Behåll bara de senaste 200 meddelandena
        if (messages.length > 200) {
            messages = messages.slice(-200);
        }
        Storage.save('chat_messages', messages);
    }

    // Skicka meddelande
    function sendMessage(messageText) {
        if (!messageText || !messageText.trim()) return { success: false, message: 'Skriv ett meddelande' };
        if (messageText.length > 500) return { success: false, message: 'Meddelandet är för långt (max 500 tecken)' };
        
        const user = Storage.loadUser({});
        const pet = PetSystem.getPet();
        const petType = PetSystem.getPetType();
        
        const newMessage = {
            id: 'm' + Date.now(),
            userId: user.id || 'user1',
            userName: user.name || 'Användare',
            userAvatar: '👤',
            petEmoji: petType.emoji,
            message: Utils.escapeHtml(messageText.trim()),
            timestamp: new Date().toISOString()
        };
        
        messages.push(newMessage);
        saveMessages();
        
        // Spela upp ljud
        Utils.playSound('message');
        
        return { success: true, message: newMessage };
    }

    // Hämta meddelanden (senaste 50)
    function getRecentMessages(limit = 50) {
        return messages.slice(-limit);
    }

    // Rendera chatt
    function renderChat(container) {
        const recentMessages = getRecentMessages();
        const user = Storage.loadUser({});
        
        container.innerHTML = `
            <div class="chat-messages" id="chatMessagesList" style="height: 400px; overflow-y: auto; margin-bottom: 15px; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 20px;">
                ${recentMessages.map(msg => `
                    <div class="chat-message" style="padding: 8px 12px; margin-bottom: 8px; background: ${msg.userId === (user.id || 'user1') ? 'rgba(57,255,20,0.1)' : 'rgba(255,255,255,0.05)'}; border-radius: 15px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 20px;">${msg.userAvatar}</span>
                            <div style="flex: 1;">
                                <div style="display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap;">
                                    <span style="font-weight: bold; font-size: 13px;">${msg.userName}</span>
                                    <span style="font-size: 10px; color: #888;">${Utils.formatTimeAgo(msg.timestamp)}</span>
                                    ${msg.petEmoji ? `<span style="font-size: 10px;">${msg.petEmoji}</span>` : ''}
                                </div>
                                <div style="font-size: 14px;">${msg.message}</div>
                            </div>
                        </div>
                    </div>
                `).join('')}
                ${recentMessages.length === 0 ? '<div style="text-align: center; color: #888; padding: 20px;">Inga meddelanden än. Var först med att skriva!</div>' : ''}
            </div>
            
            <div class="chat-input-area" style="display: flex; gap: 10px;">
                <input type="text" id="chatInput" class="chat-input" placeholder="Skriv ett meddelande..." style="flex: 1; background: rgba(255,255,255,0.1); border: none; padding: 12px; border-radius: 25px; color: #fff;">
                <button class="btn-primary" id="sendChatBtn" style="padding: 10px 20px;">📤 Skicka</button>
            </div>
        `;
        
        // Scrolla till botten
        const messagesContainer = document.getElementById('chatMessagesList');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        
        // Lägg till event listeners
        const sendBtn = document.getElementById('sendChatBtn');
        const chatInput = document.getElementById('chatInput');
        
        if (sendBtn) {
            sendBtn.onclick = () => {
                const message = chatInput?.value;
                if (message) {
                    sendMessage(message);
                    if (chatInput) chatInput.value = '';
                    renderChat(container);
                }
            };
        }
        
        if (chatInput) {
            chatInput.onkeypress = (e) => {
                if (e.key === 'Enter') {
                    const message = chatInput.value;
                    if (message) {
                        sendMessage(message);
                        chatInput.value = '';
                        renderChat(container);
                    }
                }
            };
        }
    }

    // Öppna chat modal
    function openChat() {
        const modal = document.getElementById('chatModal');
        const content = document.getElementById('chatContent');
        if (modal && content) {
            renderChat(content);
            modal.classList.remove('hidden');
        }
    }

    // Stäng chat modal
    function closeChat() {
        const modal = document.getElementById('chatModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    // Uppdatera aktiva användare
    function updateActiveUsers() {
        // Simulera aktiva användare
        const baseUsers = [
            { name: 'Ella', avatar: '👩‍🎤', pet: '🐉' },
            { name: 'Max', avatar: '🧑‍🚀', pet: '🐺' },
            { name: 'Clara', avatar: '👩‍💻', pet: '🦊' },
            { name: 'Leo', avatar: '🧑‍🎤', pet: '🐱' }
        ];
        
        // Slumpa antal aktiva
        const randomCount = Math.floor(Math.random() * baseUsers.length) + 1;
        activeUsers = baseUsers.slice(0, randomCount);
        
        // Uppdatera UI om det finns en aktiv chat
        const activeUsersContainer = document.getElementById('activeUsersList');
        if (activeUsersContainer) {
            activeUsersContainer.innerHTML = activeUsers.map(u => `
                <div style="display: flex; align-items: center; gap: 5px; font-size: 12px;">
                    <span>${u.avatar}</span>
                    <span>${u.name}</span>
                    <span>${u.pet}</span>
                    <span style="color: #39FF14;">●</span>
                </div>
            `).join('');
        }
    }

    // Starta automatisk uppdatering av chat (simulering)
    function startAutoRefresh(container) {
        if (chatInterval) clearInterval(chatInterval);
        
        chatInterval = setInterval(() => {
            // Uppdatera bara om chatten är öppen
            const modal = document.getElementById('chatModal');
            if (modal && !modal.classList.contains('hidden')) {
                renderChat(container);
            }
        }, 5000);
    }

    // Stoppa auto refresh
    function stopAutoRefresh() {
        if (chatInterval) {
            clearInterval(chatInterval);
            chatInterval = null;
        }
    }

    return {
        loadMessages,
        sendMessage,
        getRecentMessages,
        renderChat,
        openChat,
        closeChat,
        updateActiveUsers,
        startAutoRefresh,
        stopAutoRefresh
    };
})();

window.ChatSystem = ChatSystem;