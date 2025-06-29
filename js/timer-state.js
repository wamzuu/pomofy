class TimerState {
  constructor() {
    this.sessionTypes = TestTypes;
    this.sessions = SessionTest;

    // Timer State
    this.interval = null;
    this.currentSessionIndex = 0;
    this.remainingSeconds = this.sessionTypes[this.sessions[0]].duration;
    this.resetRemaining = this.remainingSeconds;
    this.resetClicked = false;
    this.currentState = TimerStates.STOPPED;

    // Audio
    this.completionSound = null;
    this.setupAudio();
  }

  setState(newState) {
    if (this.currentState !== newState) {
      console.log(`State: ${this.currentState} → ${newState}`);
      this.currentState = newState;
    }
  }

  isState(state) {
    return this.currentState === state;
  }

  setupAudio() {
    const audioUrl = chrome.runtime.getURL('audio/gong.wav');
    this.completionSound = new Audio(audioUrl);
    this.completionSound.volume = 1;
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
        this.setState(TimerStates.SESSION_COMPLETE);
        this.stop();
        this.nextSession();

        if (this.currentSessionIndex < this.sessions.length) {
          this.notifyUIUpdate();
        } else {
          this.setState(TimerStates.CYCLE_COMPLETE);
          this.notifyUIUpdate();
        }
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
