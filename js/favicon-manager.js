class FaviconManager {
  constructor(timerState) {
    this.timerState = timerState;
    this.lastFaviconState = null;
    this.setStaticFavicon('grey');
  }

  updateFavicon() {
    const currentState = this.getFaviconState();

    if (currentState !== this.lastFaviconState) {
      console.log('Changing favicon to:', currentState);
      if (currentState === 'running') {
        this.setStaticFavicon('green');
      } else if (currentState === 'break') {
        this.setStaticFavicon('blue');
      } else if (currentState === 'complete') {
        this.setStaticFavicon('red');
      } else if (currentState === 'paused' || currentState === 'stopped') {
        this.setStaticFavicon('grey');
      }
      this.lastFaviconState = currentState;
    }
  }

  getFaviconState() {
    switch (this.timerState.currentState) {
      case TimerStates.RUNNING:
        // Check if current session is a break based on label
        const currentSessionType =
          this.timerState.sessions[this.timerState.currentSessionIndex];
        const label = this.timerState.sessionTypes[currentSessionType].label;
        return label === 'BREAK' || label === 'LONG BREAK'
          ? 'break'
          : 'running';
      case TimerStates.SESSION_COMPLETE:
      case TimerStates.CYCLE_COMPLETE:
        return 'complete';
      case TimerStates.PAUSED:
        return 'paused';
      case TimerStates.STOPPED:
      default:
        return 'stopped';
    }
  }

  setStaticFavicon(color) {
    const existingFavicons = document.querySelectorAll("link[rel*='icon']");
    existingFavicons.forEach((favicon) => favicon.remove());

    const link = document.createElement('link');
    link.rel = 'shortcut icon';
    link.type = 'image/png';

    const colorMap = {
      green: 'spotify-green.png',
      blue: 'spotify-blue.png',
      red: 'spotify-red.png',
      grey: 'spotify-grey.png',
    };

    const faviconUrl = chrome.runtime.getURL(
      `images/favicons/${colorMap[color]}`
    );
    console.log('Favicon URL:', faviconUrl);
    link.href = faviconUrl;
    document.head.appendChild(link);
  }

  restoreOriginalFavicon() {
    // For now, just use grey instead of original Spotify favicon
    this.setStaticFavicon('grey');
  }
}
