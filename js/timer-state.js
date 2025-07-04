class TimerState {
  constructor() {
    this.sessionTypes = null;
    this.sessions = null;

    // Timer State
    this.interval = null;
    this.resetClicked = false;
    this.currentState = TimerStates.STOPPED;

    // Audio
    this.completionSound = null;
    this.currentVolume = 0.5;
    this.setupAudio();

    this.loadSettings();
  }

  async loadSettings() {
    // Load from storage or use defaults
    const saved = await chrome.storage.local.get(['pomofySettings']);

    if (saved.pomofySettings && saved.pomofySettings.selectedPreset) {
      this.applySettings(saved.pomofySettings);
    } else {
      this.applyDefaultSettings();
      chrome.storage.local.set({ pomofySettings: DEFAULT_SETTINGS });
    }

    this.currentSessionIndex = 0;
    this.remainingSeconds = this.getCurrentSessionDuration();
    this.resetRemaining = this.remainingSeconds;

    // Now we can set the initial remaining time
    this.notifyUIUpdate();
  }

  applyDefaultSettings() {
    this.sessionTypes = SessionTypes;
    this.sessions = DefaultSessions;

    // Store current settings for future reference
    this.currentSettings = DEFAULT_SETTINGS;

    // Apply default volume
    this.updateAudioVolume(DEFAULT_SETTINGS.audio.volume);
  }

  applySettings(savedSettings) {
    this.sessionTypes = {
      work: {
        duration: savedSettings.durations.work,
        label: 'WORK',
      },
      break: {
        duration: savedSettings.durations.break,
        label: 'BREAK',
      },
      longBreak: {
        duration: savedSettings.durations.longBreak,
        label: 'LONG BREAK',
      },
    };
    if (savedSettings.cycle && savedSettings.cycle.sessions) {
      this.sessions = savedSettings.cycle.sessions;
    } else {
      // Fallback: build sessions array from workSessions count
      this.sessions = this.buildSessionsFromWorkCount(
        savedSettings.cycle.workSessions
      );
    }
    if (savedSettings.audio && savedSettings.audio.volume !== undefined) {
      this.updateAudioVolume(savedSettings.audio.volume);
    }

    this.currentSettings = savedSettings;
  }

  // Apply new settings and restart timer if needed
  applySettingsUpdate(newSettings) {
    // Apply new settings
    this.applySettings(newSettings);

    if (this.interval !== null) {
      console.log(
        'Timer is running - keeping current session but applying new settings'
      );
      // Just update the UI, don't reset session
      this.notifyUIUpdate();
      return;
    }

    // Reset to first session with new durations
    this.currentSessionIndex = 0;
    this.remainingSeconds = this.getCurrentSessionDuration();
    this.resetRemaining = this.remainingSeconds;

    // Update all UI
    this.notifyUIUpdate();

    if (this.uiManager) {
      this.uiManager.regenerateProgressDots();
    }
  }

  buildSessionsFromWorkCount(workSessionCount) {
    // Build the classic pattern: work-break repeated, then longBreak
    const sessions = [];

    for (let i = 0; i < workSessionCount; i++) {
      sessions.push('work');
      if (i < workSessionCount - 1) {
        sessions.push('break');
      }
    }
    sessions.push('longBreak');

    return sessions;
  }

  getCurrentSessionDuration() {
    if (!this.sessions || !this.sessionTypes) {
      return 25 * 60; // Safe fallback
    }

    const currentSessionType = this.sessions[this.currentSessionIndex];
    return this.sessionTypes[currentSessionType].duration;
  }

  setState(newState) {
    if (this.currentState !== newState) {
      this.currentState = newState;
    }
  }

  isState(state) {
    return this.currentState === state;
  }

  setupAudio() {
    const audioUrl = chrome.runtime.getURL('audio/gong.wav');
    this.completionSound = new Audio(audioUrl);

    // Set initial volume to stored value or default
    this.completionSound.volume = this.currentVolume;

    // event listeners to ensure volume is set when audio loads
    this.completionSound.addEventListener('canplaythrough', () => {
      this.completionSound.volume = this.currentVolume;
      console.log('Audio loaded, volume set to:', this.currentVolume);
    });

    this.completionSound.addEventListener('loadeddata', () => {
      this.completionSound.volume = this.currentVolume;
      console.log('Audio data loaded, volume set to:', this.currentVolume);
    });
  }

  updateAudioVolume(volume) {
    console.log('updateAudioVolume called with:', volume);

    // Store the volume value
    this.currentVolume = volume / 100; // Convert 0-100 to 0.0-1.0

    // Update the audio object if it exists
    if (this.completionSound) {
      this.completionSound.volume = this.currentVolume;
      console.log('Audio volume updated to:', this.currentVolume);
    }
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
    this.setState(TimerStates.RUNNING);
    this.interval = setInterval(() => {
      this.remainingSeconds--;
      this.notifyUIUpdate();

      if (this.remainingSeconds === 0) {
        this.nextSession();

        // Only stop if auto-continue is OFF or we're at the end of cycle
        if (
          !this.currentSettings.ui.autoContinue ||
          this.currentSessionIndex >= this.sessions.length
        ) {
          this.setState(TimerStates.SESSION_COMPLETE);
          this.stop();
        }

        if (this.currentSessionIndex >= this.sessions.length) {
          this.setState(TimerStates.CYCLE_COMPLETE);
        }

        this.notifyUIUpdate();
      }
    }, 1000);
  }

  stop() {
    clearInterval(this.interval);
    this.interval = null;

    if (this.isState(TimerStates.RUNNING)) {
      this.setState(TimerStates.PAUSED);
    }
  }

  nextSession() {
    if (this.completionSound) {
      this.completionSound.volume = this.currentVolume;
      this.completionSound.play().catch((error) => {
        console.log('Audio play failed:', error);
      });
    }

    this.currentSessionIndex++;
    if (this.currentSessionIndex < this.sessions.length) {
      const currentSessionType = this.sessions[this.currentSessionIndex];
      this.remainingSeconds = this.sessionTypes[currentSessionType].duration;
      this.resetRemaining = this.remainingSeconds;
    }
  }

  resetCycle() {
    this.setState(TimerStates.STOPPED);
    this.currentSessionIndex = 0;
    const currentSessionType = this.sessions[0];
    this.remainingSeconds = this.sessionTypes[currentSessionType].duration;
    this.resetRemaining = this.remainingSeconds;
    this.stop();
    this.resetClicked = false;
    this.notifyUIUpdate();
  }

  notifyUIUpdate() {}
}
