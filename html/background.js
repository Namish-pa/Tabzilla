// This script runs in the background and manages the timer's state.

// 1. Set default values when the extension is installed.
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    timer: 0,
    isRunning: false,
    timerDuration: 30 * 60, // Default to 30 minutes
    note: '',
  });
});

// 2. Listen for commands from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.cmd === 'START_TIMER') {
    chrome.storage.local.set({ isRunning: true });
    // Create an alarm that fires every second
    chrome.alarms.create('pomodoroTimer', { periodInMinutes: 1 / 60 });
  } else if (request.cmd === 'STOP_TIMER') {
    chrome.storage.local.set({ isRunning: false });
    chrome.alarms.clear('pomodoroTimer');
  } else if (request.cmd === 'RESET_TIMER') {
    // When resetting, we also need to know what the original duration was
    chrome.storage.local.get(['timerDuration'], (res) => {
        chrome.storage.local.set({ isRunning: false, timer: 0 });
    });
    chrome.alarms.clear('pomodoroTimer');
  } else if (request.cmd === 'SET_TIME') {
    // This command comes from the preset buttons
    chrome.storage.local.set({ timerDuration: request.time * 60, timer: 0, isRunning: false });
    chrome.alarms.clear('pomodoroTimer');
  }
});

// 3. Listen for the alarm to fire
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'pomodoroTimer') {
    chrome.storage.local.get(['timer', 'isRunning', 'timerDuration'], (res) => {
      if (res.isRunning) {
        let newTime = res.timer + 1;
        if (newTime >= res.timerDuration) {
          // Timer finished! Reset and send a notification.
          chrome.storage.local.set({ isRunning: false, timer: 0 });
          chrome.alarms.clear('pomodoroTimer');
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'images/icon128.png', // Make sure you have an icon here
            title: 'Time for a break!',
            message: 'Your focus session is over. Take a 5-minute break.'
          });
        } else {
          // Increment the timer by one second
          chrome.storage.local.set({ timer: newTime });
        }
      }
    });
  }
});
