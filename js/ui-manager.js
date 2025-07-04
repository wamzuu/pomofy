// js/ui-manager.js
class UIManager {
  constructor(timerState, faviconManager) {
    this.timerState = timerState;
    this.faviconManager = faviconManager;
    this.popup = null;
    this.popupVisible = false;
    this.originalTitle = document.title;
  }

  // Update all UI elements
  updateAll() {
    this.updateDisplay();
    this.updateControls();
    this.updateProgressDots();
    this.updatePageTitle();
    this.faviconManager.updateFavicon();
  }

  updateDisplay() {
    // Update popup display
    const minutesEl = document.querySelector('.minutes');
    const secondsEl = document.querySelector('.seconds');

    if (minutesEl) {
      minutesEl.textContent = Math.floor(this.timerState.remainingSeconds / 60)
        .toString()
        .padStart(2, '0');
    }
    if (secondsEl) {
      secondsEl.textContent = (this.timerState.remainingSeconds % 60)
        .toString()
        .padStart(2, '0');
    }

    // Update icon display
    const iconTime = document.querySelector('#pomofy-button span');
    if (iconTime) {
      iconTime.textContent = this.timerState.formatTime(
        this.timerState.remainingSeconds
      );
    }
  }

  updateControls() {
    const startButton = document.querySelector('.start-pause-btn');
    if (!startButton) return;

    if (
      this.timerState.currentSessionIndex >= this.timerState.sessions.length
    ) {
      startButton.textContent = 'New Cycle';
    } else if (this.timerState.interval === null) {
      if (this.timerState.isState(TimerStates.SESSION_COMPLETE)) {
        startButton.textContent = 'Continue';
      } else {
        startButton.textContent = 'Start';
      }
    } else {
      startButton.textContent = 'Pause';
    }
  }

  updateSessionLabel() {
    const labelEl = document.querySelector('.indicator');
    if (labelEl) {
      labelEl.textContent = this.timerState.getCurrentSessionLabel();
    }
  }

  updatePageTitle() {
    if (!this.timerState.currentSettings.ui.showInTitle) {
      document.title = this.originalTitle;
      return; // Don't update title if setting is off
    }

    if (this.timerState.interval && this.timerState.remainingSeconds > 0) {
      const sessionType = this.timerState.getCurrentSessionLabel();
      document.title = `${this.timerState.formatTime(
        this.timerState.remainingSeconds
      )}`;
    } else if (
      this.timerState.isState(TimerStates.SESSION_COMPLETE) ||
      this.timerState.isState(TimerStates.CYCLE_COMPLETE)
    ) {
      document.title = `Complete`;
    } else if (
      this.timerState.isState(TimerStates.STOPPED) ||
      this.timerState.isState(TimerStates.PAUSED)
    ) {
      // Timer is stopped or paused - show the current time
      document.title = `${this.timerState.formatTime(
        this.timerState.remainingSeconds
      )}`;
    }
  }

  generateProgressDots() {
    const dotsContainer = document.querySelector('.progress-dots');
    if (!dotsContainer) return;

    dotsContainer.innerHTML = '';

    this.timerState.sessions.forEach((session, index) => {
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
      if (index < this.timerState.currentSessionIndex) {
        dot.style.backgroundColor = '#1db954';
        dot.style.animation = '';
      } else if (index === this.timerState.currentSessionIndex) {
        dot.style.backgroundColor = '#ffffff';
        if (this.timerState.interval === null) {
          dot.style.animation = '';
        } else {
          dot.style.animation = 'pulse 2s ease-in-out infinite';
        }
      } else {
        dot.style.backgroundColor = '#535353';
        dot.style.animation = '';
      }
    });
  }

  regenerateProgressDots() {
    if (this.popup && this.popupVisible) {
      this.generateProgressDots();
    }
  }

  // Create timer popup
  createPopup() {
    const popup = document.createElement('div');
    popup.id = 'pomofy-popup';
    popup.style.display = 'none';
    popup.style.position = 'fixed';
    popup.style.bottom = '88px';
    popup.style.backgroundColor = '#121212';
    popup.style.borderRadius = '10px';
    popup.style.padding = '24px';
    popup.style.width = '320px';
    popup.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';
    popup.style.zIndex = '100000';
    popup.style.fontFamily =
      '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

    popup.innerHTML = this.getPopupHTML();
    this.addPopupEventListeners(popup);
    this.addPopupStyles();

    document.body.appendChild(popup);
    this.generateProgressDots();

    return popup;
  }

  getPopupHTML() {
    return `
        <div class="session-header">
          <div class="progress-dots"></div>
          <h3 class="indicator">${this.timerState.getCurrentSessionLabel()}</h3>
        </div>
  
        <div class="timer-wrapper">
          <div class="timer-display">
            <span class="minutes">${Math.floor(
              this.timerState.remainingSeconds / 60
            )
              .toString()
              .padStart(2, '0')}</span>
            <span class="colon">:</span>
            <span class="seconds">${(this.timerState.remainingSeconds % 60)
              .toString()
              .padStart(2, '0')}</span>
          </div>
        </div>
  
        <div class="controls">
          <button class="timer-btn start-pause-btn">${
            this.timerState.interval ? 'Pause' : 'Start'
          }</button>
          <button class="timer-btn reset-btn">Reset</button>
        </div>
      `;
  }

  addPopupEventListeners(popup) {
    const startButton = popup.querySelector('.start-pause-btn');
    const resetButton = popup.querySelector('.reset-btn');

    startButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.handleStartPause();
    });

    resetButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.handleReset(resetButton);
    });

    popup.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  // These will be called by content.js
  handleStartPause() {
    if (
      this.timerState.currentSessionIndex >= this.timerState.sessions.length
    ) {
      this.timerState.resetCycle();
      this.timerState.start();
    } else if (this.timerState.interval === null) {
      this.timerState.start();
    } else {
      this.timerState.stop();
    }
    this.updateAll();
  }

  handleReset(resetButton) {
    if (!this.timerState.resetClicked) {
      this.timerState.resetClicked = true;
      resetButton.style.backgroundColor = '#e22134';
      resetButton.style.color = 'white';
      resetButton.textContent = 'Reset All';

      this.timerState.remainingSeconds = this.timerState.resetRemaining;
      this.timerState.stop();
      this.updateAll();

      setTimeout(() => {
        this.timerState.resetClicked = false;
        resetButton.style.backgroundColor = 'transparent';
        resetButton.style.color = '#b3b3b3';
        resetButton.textContent = 'Reset';
      }, 3000);
    } else {
      this.timerState.resetCycle();
      resetButton.style.backgroundColor = 'transparent';
      resetButton.style.color = '#b3b3b3';
      resetButton.textContent = 'Reset';
      this.updateAll();
    }
  }

  addPopupStyles() {
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
    flex-wrap: wrap;
    max-width: 130px;
  }
  
  .dot {
    width: 8px;
    height: 8px;
    background-color: #535353;
    border-radius: 50%;
    transition: background-color 0.2s ease;
    flex-shrink: 0;
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
    margin: -15px;
    padding: 32px;
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
    transition: background-color 0.5s ease;
    background-color: transparent;
    border-radius: 10px;
    line-height: 1;
    padding: 10px;
    cursor: pointer;
  }

  .timer-display:hover {
    background-color: #1F1F1F;
  }
  
  .minutes,
  .seconds {
    font-variant-numeric: tabular-nums;
    min-width: 1.2em;
    text-align: center;
    align-items: center;
  }
  
  /* =================================
     CONTROLS & BUTTONS
     ================================= */
  .controls {
    display: flex;
    justify-content: center;
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
  }

  togglePopup(container) {
    if (!this.popup) {
      this.popup = this.createPopup();
    }

    this.popupVisible = !this.popupVisible;
    this.popup.style.display = this.popupVisible ? 'block' : 'none';

    if (this.popupVisible) {
      const rect = container.getBoundingClientRect();
      this.popup.style.right = `${
        window.innerWidth - (rect.left + rect.width)
      }px`;
    }
  }

  hidePopup() {
    this.popupVisible = false;
    if (this.popup) {
      this.popup.style.display = 'none';
    }
  }
}
