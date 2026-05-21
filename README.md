# PvZGE Sync Browser Extension 🌻🎮

[![Svelte 5](https://img.shields.io/badge/Svelte-5-ff3e00?style=for-the-badge&logo=svelte&logoColor=white)](https://svelte.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Esbuild](https://img.shields.io/badge/Esbuild-0.28-ffcf00?style=for-the-badge&logo=esbuild&logoColor=black)](https://esbuild.github.io)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-4285f4?style=for-the-badge&logo=google-chrome&logoColor=white)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)](https://opensource.org/licenses/ISC)

An open-source browser extension that enables automatic cloud synchronization, automatic resource collection, and offline backup for **Plants vs. Zombies Gardenless Edition (PvZGE)** on the official website [play.pvzge.com](https://play.pvzge.com).

This project is built using **Svelte 5 (Runes)**, **TypeScript**, **Sass/SCSS**, bundled with **Esbuild**, and runs beautifully on both Google Chrome and Mozilla Firefox.

---

## ⚡ Key Features

### 1. 🔄 Automatic Cloud Sync (GitHub Gist)
* **Prevent Data Loss:** Automatically compares local and cloud saves to prevent accidental overwrites of newer progress.
* **Auto-Save Timer:** Periodically uploads your save file to the cloud at customizable intervals (e.g., every 5, 10, 30 minutes...).
* **Timestamp Integrity:** Preserves the correct timestamps inside the save data to prevent in-game clock issues or event resets.
* **Conflict Resolution:** Displays a clear side-by-side comparison screen if local and cloud saves differ, allowing you to choose which save to keep.

### 2. ☀️ Auto-Collect Utility
Automatically collects Suns, Gold/Silver Coins, and items appearing on the lawn to let you focus fully on your strategic defense.

### 3. 💾 Offline Backup & Restore
Download your active game save directly as a `.json` file to your computer, or import an existing save file to restore your progress instantly without internet.

### 4. 🌐 Multilingual Support
Easily toggle between **English 🇬🇧** and **Tiếng Việt 🇻🇳**.

### 5. 🎨 Stunning Glassmorphism UI
A gorgeous, modern glass-morphic popup user interface, fully responsive and optimized for both desktop and mobile-sized browser extensions.

---

## 🛠️ Installation Guide

Once built, the production files are compiled into the `/dist` directory. You can load this unpacked directory into your browser:

### 1. Google Chrome & Chromium-based Browsers (Edge, Brave, Opera, Coccoc...)
1. Run the build script and ensure you have the `dist/chrome` folder (or extract `dist/chrome.zip`).
2. Open Chrome and navigate to [chrome://extensions/](chrome://extensions/).
3. Enable **Developer mode** using the toggle switch in the top-right corner.
4. Click the **Load unpacked** button in the top-left corner.
5. Select the `dist/chrome` folder on your computer.
6. Pin the extension icon to your toolbar and enjoy!

### 2. Mozilla Firefox
#### Method 1: Temporary Installation (For Development - resets when browser closes)
1. Open Firefox and navigate to [about:debugging#/runtime/this-firefox](about:debugging#/runtime/this-firefox).
2. Click the **Load Temporary Add-on...** button.
3. Select the `manifest.json` file inside the `dist/firefox` folder.

#### Method 2: Permanent Installation (Requires Firefox Developer Edition or Firefox Nightly)
1. Navigate to `about:config` in Firefox.
2. Search for `xpinstall.signatures.required` and double-click to set it to `false`.
3. Go to [about:addons](about:addons), click the gear icon in the top-right, and select **Install Add-on From File...**.
4. Choose the `dist/firefox.zip` file to install it permanently.

---

## 🔑 How to Generate a GitHub Token

To securely connect your game save with the cloud, the extension utilizes your personal GitHub Gists. Follow these simple steps:

1. **Sign In:** Log in to your [GitHub](https://github.com) account.
2. **Quick Token Creation:** Click this link to open the pre-configured token generation page: [Quick GitHub Token Generation (Gist)](https://github.com/settings/tokens/new?description=PVZGE%20Sync&scopes=gist).
3. **Configure:**
   * **Note:** Enter a description (e.g., `PvZGE Save`).
   * **Expiration:** Select **No expiration** to prevent future sync failures.
   * **Scopes:** Ensure the **gist** scope checkbox is checked (this is the only permission required).
4. **Generate:** Scroll to the bottom and click the green **Generate token** button.
5. **Save Settings:** Copy the generated token string (starts with `ghp_`). Open the extension, click **Settings**, paste it into the GitHub Token field, and click **Save**.

> [!WARNING]
> **IMPORTANT SECURITY NOTE:** Never share your GitHub Token with anyone else. The extension only stores it locally in your browser's secure storage and communicates directly with GitHub APIs. No middleman or third-party servers are used.

---

## 📂 Project Structure

```text
pvzge-sync/
├── .github/              # GitHub Actions workflows configuration
├── dist/                 # Compiled production outputs (Chrome & Firefox)
├── src/                  # Main extension source code
│   ├── components/       # UI Components (Svelte 5)
│   ├── domains/          # Core Domain Logic
│   │   ├── game/         # Save reader/writer & schema validation
│   │   ├── github/       # GitHub Gist API client
│   │   └── sync/         # Save comparison & sync manager
│   ├── extension/        # Extension Entrypoints
│   │   ├── background.ts # Background script managing alarms, sync schedules
│   │   └── content.ts    # Content script injected into play.pvzge.com (Auto Collect & storage hooks)
│   ├── icons/            # Asset icons in multiple sizes
│   ├── images/           # Images & diagrams used in the user guide
│   ├── locales/          # Localization JSON files (en.json, vi.json)
│   ├── shared/           # Common utilities, constants, and i18n states
│   ├── views/            # Main views (Home view, Settings view, Guide view, Notice dialogs)
│   ├── guide.html        # Detailed user guide page
│   ├── manifest.json     # Extension configuration (Manifest V3)
│   └── popup.html        # Main popup HTML anchor
├── build.js              # esbuild node compiler & platform post-processor
├── version.mjs           # Automatic versioning bumping script
├── package.json          # Node dependencies & npm commands definition
└── tsconfig.json         # TypeScript configuration
```

---

## 🏗️ Development & Build Commands

### 1. Install Dependencies
Before developing or building, install the required packages:
```bash
npm install
```

### 2. Build the Extension
Compile, bundle, and package the production zip archives:
```bash
node build.js
```

> [!NOTE]
> **What the `build.js` compiler does under the hood:**
> 1. **Lint Checks:** Runs ESLint (`eslint src`) to verify code formatting and standards.
> 2. **Type Safety:** Executes `svelte-check` to validate TypeScript in Svelte files.
> 3. **SCSS Compilation:** Uses the `sass` compiler to convert `src/styles/app.scss` into clean CSS stylesheets for both platforms.
> 4. **esbuild Bundling:** Bundles and minifies TypeScript and Svelte 5 runes at lightning-fast speed.
> 5. **Asset Copying:** Copies HTML, assets, images, and icons to their respective platform destinations.
> 6. **Firefox Manifest Normalization:** Adjusts `manifest.json` for Firefox compatibility (converts service worker to standard background script, injects the Gecko identifier `pvzge-sync@uongsuadaubung.github.io`, and removes Chrome-only flags).
> 7. **Zip Packaging:** Creates `chrome.zip` and `firefox.zip` in `/dist` for easy distribution.

### 3. Version Bumping
Automatically update version strings across `package.json`, `package-lock.json`, and `src/manifest.json`:
```bash
# Bump patch version (e.g., 0.7.0 -> 0.7.1)
node version.mjs --patch

# Bump minor version (e.g., 0.7.0 -> 0.8.0)
node version.mjs --minor

# Bump major version (e.g., 0.7.0 -> 1.0.0)
node version.mjs --major
```

---

Have fun playing **play.pvzge.com**! If you need help, click the **User Guide** button directly in the extension to view illustrated steps. 🌻🔥
