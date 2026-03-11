// content.js - Complete Version

console.log("[MyAdBlocker] Content script actively scanning...");

// ---------------------------------------------------------------------
// PART 1: Cosmetic Filtering (Hiding Empty Ad Boxes)
// ---------------------------------------------------------------------
const cosmeticSelectors = [
  '#at-top',                 
  'div[id^="div-gpt-ad"]',   
  '.ad-container',           
  '.google-ad',               
  'iframe[title="Advertisement"]' 
];

function applyCosmeticFiltering() {
  cosmeticSelectors.forEach(selector => {
    const adElements = document.querySelectorAll(selector);
    adElements.forEach(element => {
      if (element.style.display !== 'none') {
        element.setAttribute('style', 'display: none !important;');
      }
    });
  });
}

// Run immediately, then check every 1.5 seconds for lazy-loaded ads
applyCosmeticFiltering();
setInterval(applyCosmeticFiltering, 1500);


// ---------------------------------------------------------------------
// PART 2: Stealth YouTube "Soft Skip"
// ---------------------------------------------------------------------
function stealthYouTubeSkip() {
  if (!window.location.hostname.includes('youtube.com')) return;

  const videoPlayer = document.querySelector('video.html5-main-video');
  const adContainer = document.querySelector('.ad-showing');
  
  const skipButton = document.querySelector('.ytp-ad-skip-button') || document.querySelector('.ytp-ad-skip-button-modern');
  const overlayClose = document.querySelector('.ytp-ad-overlay-close-button');

  // 1. Mute the ad instantly
  if (adContainer && videoPlayer && !videoPlayer.muted) {
    videoPlayer.muted = true;
    console.log("[MyAdBlocker] Ad detected: Audio muted.");
  }

  // 2. Click skip the millisecond it exists
  if (skipButton) {
    skipButton.click();
    console.log("[MyAdBlocker] Bypassed ad successfully.");
  }

  // 3. Close bottom banner overlays
  if (overlayClose) {
    overlayClose.click();
  }
}

// Check frequently on YouTube
if (window.location.hostname.includes('youtube.com')) {
  setInterval(stealthYouTubeSkip, 400); 
}