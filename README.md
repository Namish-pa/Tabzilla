# Chrome Extension: Tabzilla

> 🚧 A work-in-progress Chrome extension that detoxifies your browser when you want to lock in.

![WIP Badge](https://img.shields.io/badge/status-WIP-yellow)

---

## 📌 Overview

This is a Chrome Extension currently under development. It is designed to help the user focus while working by removing distractions. When focus mode is active, the user is alleviated from all distractions that could hinder their work potential as well as add strategic timers to avoid burnout.

The extension is being built with pure HTML, CSS, and JavaScript — no frameworks or dependencies.

---

## ✨ Planned Features

- [ ] A pomodoro timer with custom time settings
- [ ] Post-it notes
- [ ] Add sites to block when focus mode is on
- [ ] Filter content on YouTube to avoid distracting videos

---

## 📁 Project Structure

```bash
Tabzilla/
├── manifest.json          # Extension configuration
├── background.js          # (Optional) Background scripts
├── content.js             # Code injected into web pages
├── popup.html             # UI shown when clicking the extension icon
├── popup.js               # Logic for the popup UI
├── styles.css             # Optional styles
├── README.md              # This file
└── icons/                 # Extension icon(s)
```

---

## 🧪 How to Run / Load Locally

To install and test this Chrome extension locally:

0. Clone the repo using git clone
1. Open Google Chrome and go to `chrome://flags/`
2. Search for `allow legacy manifest versions` and enable it
3. Go to `chrome://extensions/`
4. In the top right, enable **Developer mode**
5. Click the **Load unpacked** button
6. Select the folder containing the extension's files (where `manifest.json` is located)
7. The extension should now appear in your toolbar
