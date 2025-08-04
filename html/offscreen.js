// This script runs in the offscreen document to play audio
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'play_sound') {
    playSound();
  }
});

// This function now finds the audio element in offscreen.html and plays it.
function playSound() {
  const audioPlayer = document.getElementById('notification-sound');
  if (audioPlayer) {
    audioPlayer.volume = 0.5; // You can set the volume here
    audioPlayer.play();
  }
}
