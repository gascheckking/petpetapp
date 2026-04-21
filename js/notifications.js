// ============ PETVERSE NOTIFICATIONS ============
// Version 1.0 - Hantering av notiser och toasts

const Notifications = (function() {
    let notificationQueue = [];
    let isShowing = false;
    let notificationContainer = null;

    // Skapa container för notiser
    function createContainer() {
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.style.position = 'fixed';
            notificationContainer.style.bottom = '100px';
            notificationContainer.style.left = '20px';
            notificationContainer.style.right = '20px';
            notificationContainer.style.zIndex = '1000';
            document.body.appendChild(notificationContainer);
        }
        return notificationContainer;
    }

    // Visa en notis
    function show(message, type = 'info', duration = 3000) {
        const container = createContainer();
        
        const colors = {
            success: '#39FF14',
            error: '#ff3333',
            info: '#39FF14',
            warning: '#ff9900',
            achievement: '#ff3333'
        };
        
        const icon = {
            success: '✅',
            error: '❌',
            info: 'ℹ️',
            warning: '⚠️',
            achievement: '🏆'
        };
        
        const notification = document.createElement('div');
        notification.className = 'notification-toast';
        notification.style.background = 'rgba(0,0,0,0.95)';
        notification.style.backdropFilter = 'blur(20px)';
        notification.style.borderRadius = '30px';
        notification.style.padding = '15px 20px';
        notification.style.marginBottom = '10px';
        notification.style.borderLeft = `4px solid ${colors[type] || colors.info}`;
        notification.style.animation = 'slideUp 0.3s ease-out';
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="font-size: 24px;">${icon[type] || icon.info}</div>
                <div style="flex: 1; font-size: 14px; color: #fff;">${message}</div>
                <button style="background: none; border: none; color: #888; font-size: 18px; cursor: pointer;" onclick="this.parentElement.parentElement.remove()">✕</button>
            </div>
        `;
        
        container.appendChild(notification);
        
        // Spela upp ljud för vissa notiser
        if (type === 'achievement') {
            Utils.playSound('achievement');
            Utils.vibrate(100);
        } else if (type === 'success') {
            Utils.playSound('success');
            Utils.vibrate(50);
        }
        
        // Ta bort efter duration
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideUp 0.3s ease-out reverse';
                setTimeout(() => {
                    if (notification.parentElement) notification.remove();
                }, 300);
            }
        }, duration);
    }

    // Förhandsgranska notis (för utveckling)
    function preview() {
        show('Det här är en testnotis!', 'info', 2000);
    }

    // Rensa alla notiser
    function clearAll() {
        if (notificationContainer) {
            notificationContainer.innerHTML = '';
        }
    }

    // Visa streak-påminnelse
    function showStreakReminder(streak) {
        if (streak === 0) {
            show('🔥 Starta din streak idag! Gör ett uppdrag eller möt en vän.', 'warning', 5000);
        } else if (streak === 7) {
            show('🎉 7 dagars streak! Du är på fire! 🔥', 'achievement', 4000);
        } else if (streak === 30) {
            show('👑 LEGEND! 30 dagars streak! Du är en sann mästare!', 'achievement', 5000);
        }
    }

    // Visa level up notis
    function showLevelUp(level) {
        show(`🎉 LEVEL UP! Din pet är nu level ${level}! Nya abilities upplåsta!`, 'success', 4000);
    }

    // Visa bounty notis
    function showBountyComplete(bountyName, reward) {
        show(`🎯 Uppdrag slutfört: ${bountyName}! Du fick ${reward} coins!`, 'success', 4000);
    }

    // Visa mötesnotis
    function showMeetingReminder() {
        show('📍 Glöm inte att träffa vänner IRL idag för extra XP!', 'info', 5000);
    }

    // Schema för dagliga påminnelser
    function scheduleDailyReminders() {
        // Kolla om det är dags för påminnelse
        const lastReminder = Storage.load('last_reminder_date');
        const today = Utils.getTodayString();
        
        if (lastReminder !== today) {
            // Skicka påminnelse vid specifika tider
            const now = new Date();
            const hour = now.getHours();
            
            if (hour === 9 || hour === 12 || hour === 18) {
                showMeetingReminder();
                Storage.save('last_reminder_date', today);
            }
        }
    }

    // Request permission för push notiser (web)
    async function requestPushPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                show('Notiser är aktiverade! Du får dagliga påminnelser.', 'success', 3000);
            }
            return permission === 'granted';
        }
        return false;
    }

    // Skicka push notis (om tillåtet)
    function sendPushNotification(title, body) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body, icon: '/assets/icon.png' });
        }
    }

    return {
        show,
        preview,
        clearAll,
        showStreakReminder,
        showLevelUp,
        showBountyComplete,
        showMeetingReminder,
        scheduleDailyReminders,
        requestPushPermission,
        sendPushNotification
    };
})();

window.Notifications = Notifications;