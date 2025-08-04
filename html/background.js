// This script runs in the background and manages the timer's state.

// --- Offscreen Document Management ---
// This section ensures we can play audio reliably.
let creating; // A global promise to avoid creating multiple offscreen documents at once

// This function sets up the offscreen document if it doesn't already exist.
async function setupOffscreenDocument(path) {
  // Check if an offscreen document is already open.
  const offscreenUrl = chrome.runtime.getURL(path);
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [offscreenUrl]
  });

  if (existingContexts.length > 0) {
    return; // If it exists, we don't need to do anything.
  }

  // If a document is already in the process of being created, wait for it.
  if (creating) {
    await creating;
  } else {
    // Create the offscreen document.
    creating = chrome.offscreen.createDocument({
      url: path,
      reasons: ['AUDIO_PLAYBACK'],
      justification: 'To play a sound when the timer finishes.',
    });
    await creating;
    creating = null; // Reset the promise once creation is complete.
  }
}

// --- Event Listeners ---

// 1. Set default values when the extension is first installed.
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    timer: 0,
    isRunning: false,
    timerDuration: 10, // Default to 30 minutes
    note: '',
  });
});

// 2. Listen for commands from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.cmd === 'START_TIMER') {
    chrome.storage.local.set({ isRunning: true });
    chrome.alarms.create('pomodoroTimer', { periodInMinutes: 1 / 60 });
  } else if (request.cmd === 'STOP_TIMER') {
    chrome.storage.local.set({ isRunning: false });
    chrome.alarms.clear('pomodoroTimer');
  } else if (request.cmd === 'RESET_TIMER') {
    chrome.storage.local.get(['timerDuration'], (res) => {
        chrome.storage.local.set({ isRunning: false, timer: 0 });
    });
    chrome.alarms.clear('pomodoroTimer');
  } else if (request.cmd === 'SET_TIME') {
    chrome.storage.local.set({ timerDuration: request.time * 60, timer: 0, isRunning: false });
    chrome.alarms.clear('pomodoroTimer');
  }
});

// 3. Listen for the timer alarm to fire
// The 'async' keyword is important here, it allows us to use 'await' inside.
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'pomodoroTimer') {
    const res = await chrome.storage.local.get(['timer', 'isRunning', 'timerDuration']);
    
    if (res.isRunning) {
      let newTime = res.timer + 1;
      if (newTime >= res.timerDuration) {
        // --- TIMER FINISHED ---
        chrome.alarms.clear('pomodoroTimer');
        await chrome.storage.local.set({ isRunning: false, timer: 0 });
        
        // 1. Set up the offscreen document and send it a message to play the sound.
        // Make sure the path 'html/offscreen.html' matches your file structure.
        await setupOffscreenDocument('html/offscreen.html');
        chrome.runtime.sendMessage({ type: 'play_sound' });
        
        // 2. Show a desktop notification.
        chrome.notifications.create({
          type: 'basic',
          iconUrl: '2.jpg', // This path is relative to the root of your extension
          title: 'Focus session complete!',
          message: 'Time to take a well-deserved break.'
        });

      } else {
        // If the timer is not finished, just increment the time.
        await chrome.storage.local.set({ timer: newTime });
      }
    }
  }
});
