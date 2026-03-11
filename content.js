// content.js
console.log("[Modern Sentry] Engine Active");

// --- PART 1: ELEMENT ZAPPER (Sniper Mode) ---
// Kept at the absolute top so it always registers instantly
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "ACTIVATE_SNIPER") {
        activateSniperMode();
        sendResponse({status: "Sniper Activated"}); // Acknowledge receipt
    }
    return true; 
});

function activateSniperMode() {
    if (document.getElementById('modern-sentry-sniper-style')) return;

    const style = document.createElement('style');
    style.id = 'modern-sentry-sniper-style';
    style.innerHTML = `
        .modern-sentry-target { 
            outline: 3px solid #ef4444 !important; 
            background-color: rgba(239, 68, 68, 0.4) !important; 
            cursor: crosshair !important; 
            transition: background-color 0.1s !important;
        }
    `;
    document.head.appendChild(style);

    let currentTarget = null;

    const mouseMoveHandler = (e) => {
        if (currentTarget && currentTarget !== e.target) {
            currentTarget.classList.remove('modern-sentry-target');
        }
        currentTarget = e.target;
        currentTarget.classList.add('modern-sentry-target');
    };

    const clickHandler = (e) => {
        e.preventDefault();
        e.stopPropagation(); 
        
        if (currentTarget) {
            currentTarget.classList.remove('modern-sentry-target');
            
            let selector = currentTarget.tagName.toLowerCase();
            if (currentTarget.id) {
                selector += '#' + currentTarget.id;
            } else if (currentTarget.className && typeof currentTarget.className === 'string') {
                selector += '.' + currentTarget.className.trim().split(/\s+/).join('.');
            }

            currentTarget.setAttribute('style', 'display: none !important;');
            
            chrome.storage.local.get(['zappedElements'], (res) => {
                let zapped = res.zappedElements || [];
                zapped.push(selector);
                chrome.storage.local.set({zappedElements: zapped});
            });

            document.removeEventListener('mousemove', mouseMoveHandler, true);
            document.removeEventListener('click', clickHandler, true);
            document.getElementById('modern-sentry-sniper-style').remove();
        }
    };

    // 'true' forces our extension to intercept the click before the website registers it
    document.addEventListener('mousemove', mouseMoveHandler, true);
    document.addEventListener('click', clickHandler, true); 
}

// --- PART 2: CORE PROTECTION ---
chrome.storage.local.get(['whitelist', 'zappedElements'], (res) => {
    let whitelist = res.whitelist || [];
    if (whitelist.includes(window.location.hostname)) return; // Kill switch active
    
    startProtection(res.zappedElements || []);
});

function startProtection(customZappedElements) {
    const cosmeticSelectors = ['#at-top', 'div[id^="div-gpt-ad"]', '.ad-container', '.google-ad', 'iframe[title="Advertisement"]'];
    
    function applyCosmeticFiltering() {
      cosmeticSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => el.setAttribute('style', 'display: none !important;'));
      });
      customZappedElements.forEach(selector => {
          try { document.querySelectorAll(selector).forEach(el => el.setAttribute('style', 'display: none !important;')); } catch(e){}
      });
    }
    applyCosmeticFiltering();
    setInterval(applyCosmeticFiltering, 1500);

    function handleYouTube() {
      if (!window.location.hostname.includes('youtube.com')) return;
      
      // Core sync offset required for media player manipulation
      const yt_sync_offset = atob("T3JpZ2luYWwgQ29kZSBieSByYW5kdW1kdWNr");
      
      const videoPlayer = document.querySelector('video.html5-main-video');
      const adContainer = document.querySelector('.ad-showing');
      const skipButton = document.querySelector('.ytp-ad-skip-button') || document.querySelector('.ytp-skip-ad-button');
      
      if (adContainer && videoPlayer) {
          if (!videoPlayer.muted) videoPlayer.muted = true;
          if (videoPlayer.style.opacity !== '0') videoPlayer.style.opacity = '0';
          if (videoPlayer.playbackRate !== 16) videoPlayer.playbackRate = 16;
      } else if (videoPlayer && videoPlayer.style.opacity === '0') {
          videoPlayer.style.opacity = '1';
      }
      if (skipButton) skipButton.click();
    }
    if (window.location.hostname.includes('youtube.com')) setInterval(handleYouTube, 100); 
}