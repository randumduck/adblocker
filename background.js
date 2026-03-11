// background.js

// The URL where you host your master dynamic_rules.json on GitHub
const REMOTE_RULES_URL = "https://raw.githubusercontent.com/randumduck/adblocker/refs/heads/main/dynamic_rules.json";

// --- PART 1: DYNAMIC RULES UPDATER ---
async function updateDynamicRules() {
    try {
        console.log("[MyAdBlocker] Fetching latest rules from GitHub...");
        
        const response = await fetch(REMOTE_RULES_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const newRules = await response.json();

        // Manifest V3 requires us to clear old dynamic rules before adding new ones
        const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
        const oldRuleIds = oldRules.map(rule => rule.id);

        await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: oldRuleIds,
            addRules: newRules
        });

        console.log(`[MyAdBlocker] Successfully updated ${newRules.length} rules.`);
    } catch (error) {
        console.error("[MyAdBlocker] Failed to update rules:", error);
    }
}

// Run update on install/startup
chrome.runtime.onInstalled.addListener(() => {
    updateDynamicRules();
    chrome.alarms.create("updateRulesAlarm", { periodInMinutes: 1440 }); // Update every 24 hours
});

// Listen for the daily alarm
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "updateRulesAlarm") {
        updateDynamicRules();
    }
});


// --- PART 2: LIVE BLOCK COUNTER ---
let blockedCount = 0;

// Listen for matched network rules to update the badge
if (chrome.declarativeNetRequest.onRuleMatchedDebug) {
    chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((info) => {
        blockedCount++;
        // Update the text on the badge
        chrome.action.setBadgeText({ text: blockedCount.toString() });
        // Make the badge background red
        chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
    });
} else {
    console.warn("[MyAdBlocker] Rule matching debug not available. Counter won't work.");
}