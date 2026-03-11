// content.js - Stealth Visual Cloak Version

console.log("[MyAdBlocker] Content script actively scanning...");

// ---------------------------------------------------------------------
// PART 1: General Cosmetic Filtering (Hiding Empty Ad Boxes)
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

// Run immediately, then check periodically for lazy-loaded ads
applyCosmeticFiltering();
setInterval(applyCosmeticFiltering, 1500);


// ---------------------------------------------------------------------
// PART 2: Stealth Visual Cloak (Evading YouTube Detection)
// ---------------------------------------------------------------------
function cloakYouTubeAds() {
  if (!window.location.hostname.includes('youtube.com')) return;

  const videoPlayer = document.querySelector('video.html5-main-video');
  const adContainer = document.querySelector('.ad-showing');
  
  // YouTube frequently changes the class name of the skip button
  const skipButton = document.querySelector('.ytp-ad-skip-button') || document.querySelector('.ytp-ad-skip-button-modern');
  const overlayClose = document.querySelector('.ytp-ad-overlay-close-button');

  if (adContainer && videoPlayer) {
    // 1. Mute the ad audio instantly
    if (!videoPlayer.muted) {
        videoPlayer.muted = true;
    }
    
    // 2. Cloak it: Turn the video screen completely transparent so you don't see the ad
    if (videoPlayer.style.opacity !== '0') {
        videoPlayer.style.opacity = '0';
    }
  } else if (videoPlayer) {
    // 3. Un-cloak it: Ensure the main video is visible when the ad is over
    if (videoPlayer.style.opacity === '0') {
        videoPlayer.style.opacity = '1';
    }
  }

  // 4. Gently click the skip button only if it naturally appears
  if (skipButton) {
    skipButton.click();
    console.log("[MyAdBlocker] Clicked natural skip button.");
  }

  // 5. Close bottom banner overlays
  if (overlayClose) {
    overlayClose.click();
  }
}

// Run the check frequently
if (window.location.hostname.includes('youtube.com')) {
  setInterval(cloakYouTubeAds, 500); 
}