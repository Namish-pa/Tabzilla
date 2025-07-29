document.addEventListener('DOMContentLoaded', () => {
  // --- GET ELEMENTS ---
  // Views (the different "pages" of the popup)
  const mainView = document.getElementById('main-view');
  const timerView = document.getElementById('timer-view');
  const notesView = document.getElementById('notes-view');
  const blockerVIew = document.getElementById('blocker-view');

  // Main Menu Buttons
  const showTimerBtn = document.getElementById('show-timer-btn');
  const showNotesBtn = document.getElementById('show-notes-btn');
  const showBlockerBtn = document.getElementById('show-blocker-btn');
  
  // Back Buttons
  const backButtons = document.querySelectorAll('.back-btn');

  // Timer View Elements
  const presetBtns = document.querySelectorAll('.preset-btn');
  const timerDisplay = document.getElementById('timer-display');
  const startTimerBtn = document.getElementById('start-timer-btn');
  const customInputContainer = document.getElementById('custom-input-container');
  const customMinutesInput = document.getElementById('custom-minutes');
  const setCustomBtn = document.getElementById('set-custom-btn');

  // Notes View Elements
  const noteArea = document.getElementById('note-area');


  // --- NAVIGATION LOGIC ---
  // A function to hide all views and then show the one we want
  function showView(viewToShow) {
    if (viewToShow === mainView) {
        mainView.classList.remove('hidden');
        mainView.classList.add('view');    
    }
    document.querySelectorAll('.view').forEach(view => view.classList.add('hidden'));
    viewToShow.classList.remove('hidden');
   
  }

  // Add click listeners to the main menu buttons
  
  showTimerBtn.addEventListener('click', () => showView(timerView));
  showNotesBtn.addEventListener('click', () => showView(notesView));
  showBlockerBtn.addEventListener('click', () => showView(blockerVIew));
  
  // Add click listeners to all back buttons to return to the main menu
  backButtons.forEach(button => {
    button.addEventListener('click', () => showView(mainView));
  });


  // --- TIMER LOGIC ---

  // Function to format seconds into a MM:SS string
  function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  }

  // Function to update the timer display based on data from storage
  function updateTimerDisplay() {
    chrome.storage.local.get(['timer', 'isRunning', 'timerDuration'], (res) => {
      const timeRemaining = res.timerDuration - res.timer;
      timerDisplay.textContent = formatTime(timeRemaining);
      startTimerBtn.textContent = res.isRunning ? 'Stop Timer' : 'Start Timer';
    });
  }

  // Update the display immediately when the popup is opened,
  // and then set an interval to check every second.
  updateTimerDisplay();
  setInterval(updateTimerDisplay, 1000);

  // Handle clicks on the preset time buttons (30m, 1h, Custom)
  presetBtns.forEach(button => {
    button.addEventListener('click', () => {
      // Style the active button
      presetBtns.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const timeValue = button.dataset.time;
      if (timeValue === 'custom') {
        // If "Custom" is clicked, show the input field
        customInputContainer.classList.remove('hidden');
      } else {
        // Otherwise, hide the input field
        customInputContainer.classList.add('hidden');
        // Send a message to background.js to set the new time
        chrome.runtime.sendMessage({ cmd: 'SET_TIME', time: parseInt(timeValue) });
      }
    });
  });

  // Handle setting a custom time from the input field
  setCustomBtn.addEventListener('click', () => {
    const minutes = parseInt(customMinutesInput.value);
    // Check if the input is a valid number greater than 0
    if (minutes && minutes > 0) {
      chrome.runtime.sendMessage({ cmd: 'SET_TIME', time: minutes });
      customInputContainer.classList.add('hidden');
      customMinutesInput.value = '';
    }
  });

  // Handle the main Start/Stop button click
  startTimerBtn.addEventListener('click', () => {
    chrome.storage.local.get(['isRunning'], (res) => {
      if (res.isRunning) {
        // If it's running, send a command to stop
        chrome.runtime.sendMessage({ cmd: 'STOP_TIMER' });
      } else {
        // If it's not running, send a command to start
        chrome.runtime.sendMessage({ cmd: 'START_TIMER' });
      }
    });
  });


  // --- NOTES LOGIC ---
  // Load the saved note from storage when the popup opens
  chrome.storage.local.get(['note'], (res) => {
    noteArea.value = res.note || '';
  });

  // Save the note to storage every time the user types
  noteArea.addEventListener('keyup', () => {
    chrome.storage.local.set({ note: noteArea.value });
  });
});
