// js/content.js - Add this at the top, before your other functions
class TimerState {
  constructor() {
    // Your session configuration
    this.sessionTypes = {
      work: { duration: 25 * 60, label: 'WORK' },
      break: { duration: 5 * 60, label: 'BREAK' },
      longBreak: { duration: 15 * 60, label: 'LONG BREAK' },
    };

    this.sessions = [
      'work',
      'break',
      'work',
      'break',
      'work',
      'break',
      'work',
      'longBreak',
    ];

    // Timer state
    this.interval = null;
    this.currentSessionIndex = 0;
    this.remainingSeconds = this.sessionTypes[this.sessions[0]].duration;
    this.resetRemaining = this.remainingSeconds;
    this.resetClicked = false;

    // Audio
    this.completionSound = null;
    this.setupAudio();
  }

  setupAudio() {
    const audioUrl = chrome.runtime.getURL('audio/gong.wav');
    this.completionSound = new Audio(audioUrl);
    this.completionSound.volume = 0.7;
  }

  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  }

  getCurrentSessionLabel() {
    const currentSessionType = this.sessions[this.currentSessionIndex];
    return this.sessionTypes[currentSessionType].label;
  }

  start() {
    this.interval = setInterval(() => {
      this.remainingSeconds--;
      this.updateDisplay();

      if (this.remainingSeconds === 0) {
        this.stop();
        this.nextSession();

        if (this.currentSessionIndex < this.sessions.length) {
          this.updateDisplay();
        } else {
          this.updateControls();
        }
      }
    }, 1000);
    this.updateControls();
    this.updateProgressDots();
  }

  stop() {
    clearInterval(this.interval);
    this.interval = null;
    this.updateControls();
    this.updateProgressDots();
  }

  nextSession() {
    // Play completion sound
    if (this.completionSound) {
      this.completionSound.play().catch((error) => {
        console.log('Audio play failed:', error);
      });
    }

    this.currentSessionIndex++;
    if (this.currentSessionIndex < this.sessions.length) {
      const currentSessionType = this.sessions[this.currentSessionIndex];
      this.remainingSeconds = this.sessionTypes[currentSessionType].duration;
      this.resetRemaining = this.remainingSeconds;
      this.updateSessionLabel();
    }
  }

  resetCycle() {
    this.currentSessionIndex = 0;
    const currentSessionType = this.sessions[0];
    this.remainingSeconds = this.sessionTypes[currentSessionType].duration;
    this.resetRemaining = this.remainingSeconds;
    this.stop();
    this.updateDisplay();
    this.updateSessionLabel();
    this.updateControls();
    this.updateProgressDots();

    this.resetClicked = false;
  }

  updateDisplay() {
    // Update popup display
    const minutesEl = document.querySelector('.minutes');
    const secondsEl = document.querySelector('.seconds');

    if (minutesEl)
      minutesEl.textContent = Math.floor(this.remainingSeconds / 60)
        .toString()
        .padStart(2, '0');
    if (secondsEl)
      secondsEl.textContent = (this.remainingSeconds % 60)
        .toString()
        .padStart(2, '0');

    // Update icon display
    const iconTime = document.querySelector('#pomofy-button span');
    if (iconTime) iconTime.textContent = this.formatTime(this.remainingSeconds);
  }

  updateControls() {
    const startButton = document.querySelector('.start-pause-btn');
    if (!startButton) return;

    if (this.currentSessionIndex >= this.sessions.length) {
      startButton.textContent = 'New Cycle';
    } else if (this.interval === null) {
      startButton.textContent = 'Start';
    } else {
      startButton.textContent = 'Pause';
    }
  }

  updateSessionLabel() {
    const labelEl = document.querySelector('.indicator');
    if (labelEl) labelEl.textContent = this.getCurrentSessionLabel();
  }

  generateProgressDots() {
    const dotsContainer = document.querySelector('.progress-dots');
    if (!dotsContainer) return;

    // Clear existing dots
    dotsContainer.innerHTML = '';

    this.sessions.forEach((session, index) => {
      const dot = document.createElement('div');
      dot.classList.add('dot');
      dot.style.width = '8px';
      dot.style.height = '8px';
      dot.style.borderRadius = '50%';
      dot.style.backgroundColor = '#535353';
      dot.style.transition = 'background-color 0.2s ease';
      dot.dataset.index = index;
      dotsContainer.appendChild(dot);
    });

    this.updateProgressDots();
  }

  updateProgressDots() {
    const dots = document.querySelectorAll('.progress-dots div');

    dots.forEach((dot, index) => {
      if (index < this.currentSessionIndex) {
        // Completed sessions
        dot.style.backgroundColor = '#1db954';
        dot.style.animation = '';
      } else if (index === this.currentSessionIndex) {
        // Current session
        dot.style.backgroundColor = '#ffffff';
        if (this.interval === null) {
          dot.style.animation = '';
        } else {
          dot.style.animation = 'pulse 2s ease-in-out infinite';
        }
      } else {
        // Future sessions
        dot.style.backgroundColor = '#535353';
        dot.style.animation = '';
      }
    });
  }
}

// Create global timer instance
const timerState = new TimerState();

function createTimerButton(volumeButton) {
  // container for timer button
  const timerContainer = document.createElement('div');
  timerContainer.id = 'pomofy-container';
  timerContainer.style.display = 'inline-flex';
  timerContainer.style.alignItems = 'center';

  // create timer button
  const timerButton = document.createElement('button');
  timerButton.id = 'pomofy-button';
  timerButton.style.background = 'transparent';
  timerButton.style.border = 'none';
  timerButton.style.color = '#b3b3b3';
  timerButton.style.cursor = 'pointer';
  timerButton.style.transition = 'color 0.2s ease';

  // Add your timer icon and time display
  timerButton.innerHTML = `
  <div style="display: flex; flex-direction: column; align-items: center;">
    <svg width="16" height="16" viewBox="0 0 16 16" style="margin-bottom: 2px;">
      <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5" fill="none"/>
      <line x1="8" y1="8" x2="8" y2="4" stroke="currentColor" stroke-width="1.5"/>
      <line x1="8" y1="8" x2="11" y2="8" stroke="currentColor" stroke-width="1.5"/>
    </svg>
    <span style="font-size: 10px;">25:00</span>
  </div>
`;

  // Add hover effect
  timerButton.addEventListener('mouseenter', () => {
    timerButton.style.color = '#ffffff';
  });

  timerButton.addEventListener('mouseleave', () => {
    timerButton.style.color = '#b3b3b3';
  });

  let popup = null;
  let popupVisible = false;

  timerButton.addEventListener('click', (e) => {
    e.stopPropagation();

    // Create popup if it doesn't exist
    if (!popup) {
      popup = createTimerPopup();
    }

    // Toggle popup visibility
    popupVisible = !popupVisible;
    popup.style.display = popupVisible ? 'block' : 'none';

    if (popupVisible) {
      // Position popup relative to button
      const rect = timerContainer.getBoundingClientRect();
      popup.style.right = `${window.innerWidth - (rect.left + rect.width)}px`;
    }
  });

  document.addEventListener('click', (e) => {
    if (
      popupVisible &&
      popup &&
      !popup.contains(e.target) &&
      !timerContainer.contains(e.target)
    ) {
      popupVisible = false;
      popup.style.display = 'none';
    }
  });

  // Assemble and inject
  timerContainer.appendChild(timerButton);
  const targetContainer = volumeButton.parentNode;
  targetContainer.parentNode.insertBefore(timerContainer, targetContainer);
}
// Update the main function
function findInjectionPoint() {
  const volumeButton = document.querySelector(
    'button[aria-describedby="volume-icon"]'
  );

  if (volumeButton) createTimerButton(volumeButton);
}

function createTimerPopup() {
  const popup = document.createElement('div');
  popup.id = 'pomofy-popup';
  popup.style.display = 'none';
  popup.style.position = 'fixed';
  popup.style.bottom = '88px'; // Above Spotify's playbar
  popup.style.backgroundColor = '#121212';
  popup.style.borderRadius = '20px';
  popup.style.padding = '24px';
  popup.style.width = '320px';
  popup.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';
  popup.style.zIndex = '100000';
  popup.style.fontFamily =
    '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

  // Add your timer HTML (simplified version for now)
  popup.innerHTML = `<div class="session-header">
    <div class="progress-dots"></div>
    <h3 class="indicator">${timerState.getCurrentSessionLabel()}</h3>
  </div>

  <div class="timer-wrapper">
    <div class="timer-display">
      <span class="minutes">${Math.floor(timerState.remainingSeconds / 60)
        .toString()
        .padStart(2, '0')}</span>
      <span class="colon">:</span>
      <span class="seconds">${(timerState.remainingSeconds % 60)
        .toString()
        .padStart(2, '0')}</span>
    </div>
  </div>

  <div class="controls">
    <button class="timer-btn start-pause-btn">${
      timerState.interval ? 'Pause' : 'Start'
    }</button>
    <button class="timer-btn reset-btn">Reset</button>
  </div>
  `;

  // Add button event listeners
  const startButton = popup.querySelector('.start-pause-btn');
  const resetButton = popup.querySelector('.reset-btn');

  startButton.addEventListener('click', (e) => {
    e.stopPropagation();

    if (timerState.currentSessionIndex >= timerState.sessions.length) {
      timerState.resetCycle();
      timerState.start();
    } else if (timerState.interval === null) {
      timerState.start();
    } else {
      timerState.stop();
    }
  });

  resetButton.addEventListener('click', (e) => {
    e.stopPropagation();

    if (!timerState.resetClicked) {
      // First click - show warning
      timerState.resetClicked = true;
      resetButton.style.backgroundColor = '#e22134';
      resetButton.style.color = 'white';
      resetButton.textContent = 'Reset All';

      // Reset current session
      timerState.remainingSeconds = timerState.resetRemaining;
      timerState.stop();
      timerState.updateDisplay();

      // Auto-revert after 3 seconds
      setTimeout(() => {
        timerState.resetClicked = false;
        resetButton.style.backgroundColor = 'transparent';
        resetButton.style.color = '#b3b3b3';
        resetButton.textContent = 'Reset';
      }, 3000);
    } else {
      // Second click - reset entire cycle
      timerState.resetCycle();

      // Reset button styling
      resetButton.style.backgroundColor = 'transparent';
      resetButton.style.color = '#b3b3b3';
      resetButton.textContent = 'Reset';
    }
  });

  // Prevent popup clicks from bubbling up
  popup.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  document.body.appendChild(popup);

  timerState.generateProgressDots();

  const style = document.createElement('style');
  style.textContent = `
/* =================================
   MAIN TIMER CONTAINER
   ================================= */
.pomofy-popup {
  width: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* =================================
   SESSION HEADER
   ================================= */
.session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 24px;
}

.indicator {
  color: #1db954;
  font-weight: 300;
  margin: 0;
}

/* =================================
   PROGRESS DOTS
   ================================= */
.progress-dots {
  display: flex;
  gap: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  background-color: #535353;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.dot.active {
  background-color: white;
  animation: pulse 2s ease-in-out infinite;
}

.dot.active.paused {
  animation: none;
}

.dot.completed {
  background-color: #1db954;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

/* =================================
   TIMER DISPLAY
   ================================= */
.timer-wrapper {
  position: relative;
  margin-bottom: 24px;
  text-align: center;
}

.timer-display {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 700;
  color: #ffffff;
  font-size: 64px;
  letter-spacing: -1px;
  gap: 4px;
}

.minutes,
.seconds {
  font-variant-numeric: tabular-nums;
  min-width: 1.2em;
  text-align: center;
}

/* =================================
   CONTROLS & BUTTONS
   ================================= */
.controls {
  display: flex;
  gap: 12px;
}

.timer-btn {
  padding: 12px 24px;
  background-color: #1db954;
  color: black;
  border: none;
  border-radius: 500px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  transition: background-color 0.5s ease;
  text-transform: none;
  min-width: 118px;
}

.timer-btn:hover {
  background-color: #1ed760;
}

.timer-btn.reset-btn {
  background-color: transparent;
  color: #b3b3b3;
  border: 1px solid #535353;
  transition: background-color 0.5s ease, border-color 0.5s ease, color 0.5s ease;
}

.timer-btn.reset-btn:hover {
  background-color: transparent;
  color: #ffffff;
  border-color: #b3b3b3;
}
`;
  document.head.appendChild(style);

  return popup;
}

const checkForPlaybar = setInterval(() => {
  const volumeButton = document.querySelector(
    'button[aria-describedby="volume-icon"]'
  );

  if (volumeButton) {
    clearInterval(checkForPlaybar);
    createTimerButton(volumeButton);
  }
}, 1000);

// Stop checking after 30 seconds
setTimeout(() => {
  clearInterval(checkForPlaybar);
}, 30000);
