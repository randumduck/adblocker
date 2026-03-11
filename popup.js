// popup.js
document.addEventListener('DOMContentLoaded', () => {
    const countElement = document.getElementById('block-count');
    const threatList = document.getElementById('threat-list');
    const killSwitch = document.getElementById('kill-switch');
    const btnSniper = document.getElementById('btn-sniper');
    const btnClearZaps = document.getElementById('btn-clear-zaps'); // New Reset Button
    
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');

    function updateStatusUI(isActive) {
        if (isActive) {
            statusDot.className = 'pulse-dot active';
            statusText.innerText = 'Shield Active';
        } else {
            statusDot.className = 'pulse-dot inactive';
            statusText.innerText = 'Shield Disabled';
        }
    }

    function renderThreats(threats) {
        if (!threats || threats.length === 0) return;
        threatList.innerHTML = '';
        threats.forEach(domain => {
            threatList.innerHTML += `<div>[BLOCKED] ${domain}</div>`;
        });
    }

    chrome.storage.local.get(['totalBlocked', 'threatLog'], (result) => {
        countElement.innerText = (result.totalBlocked || 0).toLocaleString();
        renderThreats(result.threatLog);
    });

    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local') {
            if (changes.totalBlocked) countElement.innerText = changes.totalBlocked.newValue.toLocaleString();
            if (changes.threatLog) renderThreats(changes.threatLog.newValue);
        }
    });

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        let currentTab = tabs[0];
        let currentUrl = new URL(currentTab.url);
        let domain = currentUrl.hostname;
        
        chrome.storage.local.get(['whitelist'], (res) => {
            let whitelist = res.whitelist || [];
            let isWhitelisted = whitelist.includes(domain);
            killSwitch.checked = !isWhitelisted; 
            updateStatusUI(!isWhitelisted);      
        });

        killSwitch.addEventListener('change', (e) => {
            let shieldIsNowOn = e.target.checked;
            updateStatusUI(shieldIsNowOn);
            
            chrome.storage.local.get(['whitelist'], (res) => {
                let whitelist = res.whitelist || [];
                if (shieldIsNowOn) {
                    whitelist = whitelist.filter(item => item !== domain);
                } else {
                    if (!whitelist.includes(domain)) whitelist.push(domain);
                }
                chrome.storage.local.set({whitelist: whitelist});
                setTimeout(() => { chrome.tabs.reload(currentTab.id); }, 500);
            });
        });

        btnSniper.addEventListener('click', () => {
            if (currentTab.url.startsWith('chrome://') || currentTab.url.startsWith('edge://')) return;
            chrome.tabs.sendMessage(currentTab.id, { action: "ACTIVATE_SNIPER" }, () => {
                if (!chrome.runtime.lastError) window.close(); 
            });
        });

        // NEW: Reset Zaps Logic
        btnClearZaps.addEventListener('click', () => {
            // Overwrite the zapped memory with an empty array
            chrome.storage.local.set({zappedElements: []}, () => {
                btnClearZaps.innerText = "Cleared!";
                setTimeout(() => { 
                    btnClearZaps.innerText = "↺ Reset"; 
                    chrome.tabs.reload(currentTab.id); // Reload to bring elements back
                }, 800);
            });
        });
    });
});