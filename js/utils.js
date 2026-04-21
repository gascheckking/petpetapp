// ============ PETVERSE UTILITIES ============
// Version 1.0 - Hjälpfunktioner

const Utils = (function() {
    // Generera unikt ID
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Formatera tid
    function formatTimeAgo(date) {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return `${seconds} sek sedan`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} min sedan`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} tim sedan`;
        const days = Math.floor(hours / 24);
        return `${days} dagar sedan`;
    }

    // Formatera nummer
    function formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }

    // Slumpa mellan min och max
    function randomRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Fördröjning (Promise)
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Kolla om idag är samma som datum
    function isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }

    // Hämta dagens datum som string
    function getTodayString() {
        const today = new Date();
        return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    }

    // Deep clone objekt
    function deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    // Debounce funktion
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Throttle funktion
    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Kapitalisera första bokstaven
    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    // Trunkera text
    function truncate(str, length) {
        if (str.length <= length) return str;
        return str.substring(0, length) + '...';
    }

    // Escape HTML
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    // Ladda bild som Promise
    function loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });
    }

    // Spela upp ljud (om Audio API finns)
    function playSound(soundName) {
        try {
            const audio = new Audio(`/assets/sounds/${soundName}.mp3`);
            audio.volume = 0.3;
            audio.play().catch(e => console.log('Audio not supported'));
        } catch(e) { console.log('Audio error'); }
    }

    // Vibrera (om stöds)
    function vibrate(duration = 50) {
        if (navigator.vibrate) {
            navigator.vibrate(duration);
        }
    }

    // Dela via Web Share API
    async function share(data) {
        if (navigator.share) {
            try {
                await navigator.share(data);
                return true;
            } catch(e) { return false; }
        }
        return false;
    }

    // Kopiera till clipboard
    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch(e) { return false; }
    }

    // Hämta parameter från URL
    function getUrlParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    // Exponera publika funktioner
    return {
        generateId,
        formatTimeAgo,
        formatNumber,
        randomRange,
        delay,
        isToday,
        getTodayString,
        deepClone,
        debounce,
        throttle,
        capitalize,
        truncate,
        escapeHtml,
        loadImage,
        playSound,
        vibrate,
        share,
        copyToClipboard,
        getUrlParam
    };
})();

// Gör tillgänglig globalt
window.Utils = Utils;