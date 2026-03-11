// background.js

// The URL where you host your master rules.json (e.g., your GitHub repo)
// For testing, you can leave this blank or point it to a test JSON URL.
const REMOTE_RULES_URL = "https://github.com/randumduck/adblocker/blob/915abdb6c587beb2c43d62ae5439e8a8343ebd5e/dynamic_rules.json";

// Function to fetch and update rules
async function updateDynamicRules() {
    try {
        console.log("[MyAdBlocker] Fetching latest rules...");
        
        // Fetch the secure JSON file from your trusted server
        const response = await fetch(REMOTE_RULES_URL);
        const newRules = await response.json();

        // Manifest V3 requires us to clear old dynamic rules before adding new ones
        const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
        const oldRuleIds = oldRules.map(rule => rule.id);

        // Apply the update
        await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: oldRuleIds,
            addRules: newRules
        });

        console.log(`[MyAdBlocker] Successfully updated ${newRules.length} rules.`);
    } catch (error) {
        console.error("[MyAdBlocker] Failed to update rules:", error);
    }
}

// 1. Run the update when the extension is first installed
chrome.runtime.onInstalled.addListener(() => {
    updateDynamicRules();
    // Set an alarm to check for updates every 24 hours (1440 minutes)
    chrome.alarms.create("updateRulesAlarm", { periodInMinutes: 1440 });
});

// 2. Listen for the alarm to trigger the update
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "updateRulesAlarm") {
        updateDynamicRules();
    }
});