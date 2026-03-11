# Modern Sentry Ad Blocker 🛡️

Modern Sentry is a lightweight, privacy-focused Chromium extension built on Manifest V3. It combines a dynamic network blocking engine with aggressive cosmetic DOM filtering to provide a seamless, tracker-free browsing experience. 

## 🚀 Features

* **Dynamic Threat Engine:** Utilizes the `declarativeNetRequest` API to silently block up to 29,000 known adware, malware, and telemetry domains at the network level.
* **Live Tracker Telemetry:** A built-in terminal UI that displays the real-time domains attempting to track your session.
* **Element Zapper (Sniper Mode):** A manual DOM-manipulation tool. Click the crosshairs to permanently zap and hide un-blockable cookie banners, sticky headers, or newsletter popups.
* **Per-Site Kill Switch:** Instantly whitelist any website that breaks under strict blocking policies. 
* **YouTube Visual Cloak:** Bypasses basic ad-block detection by cloaking ads visually and forcing playback to 16x speed for immediate resolution.

## ⚙️ The Automation Workflow (DevSecOps)

To comply with Manifest V3 restrictions on background script execution, this extension does not parse raw text files locally. Instead, we utilize a cloud-based CI/CD pipeline to aggregate threat intelligence:

1. **The Feeds:** The project monitors public threat feeds (Peter Lowe's Ad/Tracking List and StevenBlack's Unified Hosts).
2. **The Aggregator (`build_rules.py`):** A custom Python script fetches these lists, strips out duplicates, and formats the output into a highly strict, browser-ready Manifest V3 `dynamic_rules.json` file.
3. **GitHub Actions (`update_rules.yml`):** Every night at midnight (UTC), a GitHub-hosted Ubuntu runner spins up, executes the Python aggregator, and automatically commits the freshest 29,000 rules directly to the repository.
4. **The Extension Endpoint:** The extension's `background.js` service worker fetches this raw JSON URL from GitHub every 24 hours, feeding the updated rules straight into the browser's native C++ network engine for zero-latency blocking.

## 🛠️ Installation Instructions

### Method 1: Installing from Source (For Developers)
1. Clone this repository to your local machine.
2. Open your Chromium-based browser (Chrome, Edge, Brave, etc.).
3. Navigate to the extensions page (`chrome://extensions` or `edge://extensions`).
4. Enable **Developer mode** (usually a toggle in the top right).
5. Click **Load unpacked** and select the root directory of this repository.

### Method 2: Installing via ZIP (For General Users)
1. Download the latest `ModernSentry.zip` release.
2. Extract the `.zip` file into a permanent folder on your computer (e.g., `Documents/ModernSentry`).
3. Open your browser and navigate to `chrome://extensions`.
4. Enable **Developer mode**.
5. Click **Load unpacked** and select the extracted folder.
*Note: Do not delete the folder after installing, or the browser will lose the extension!*

## 📦 Packaging for Distribution
If you are compiling this extension to share with others, ensure you only zip the core browser files. Exclude backend logic to keep the extension lightweight.
**Include:** `manifest.json`, `background.js`, `content.js`, `popup.html`, `popup.js`, `dynamic_rules.json`, and the `icons/` directory.
**Exclude:** `build_rules.py`, `README.md`, `.github/`, and `.git/`.

## 📝 Usage Notes

* **Element Zapper Reversals:** If you accidentally zap a required page element, open the Modern Sentry dashboard and click the **↺ Reset Zaps** button to clear the cosmetic filter memory for the current session.
* **YouTube Anti-Adblock:** YouTube's detection algorithms update constantly. If your account is flagged, you may need to use an Incognito window or temporarily disable the shield until the session flag expires.

---
*Built for learning, privacy, and full control over network traffic.*