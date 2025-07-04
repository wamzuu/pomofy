class FaviconManager {
  constructor(timerState) {
    this.timerState = timerState;
    this.lastFaviconState = null;
    this.setCustomFavicon('paused');
  }

  updateFavicon() {
    const currentState = this.getFaviconState();

    if (currentState !== this.lastFaviconState) {
      console.log('Changing favicon to:', currentState);
      this.setCustomFavicon(currentState);
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
        return label === 'BREAK' || label === 'LONG BREAK' ? 'break' : 'work';
      case TimerStates.SESSION_COMPLETE:
      case TimerStates.CYCLE_COMPLETE:
        return 'complete';
      case TimerStates.PAUSED:
        return 'paused';
      case TimerStates.STOPPED:
      default:
        return 'paused'; // Use paused icon for stopped state too
    }
  }

  setCustomFavicon(state) {
    const existingFavicons = document.querySelectorAll("link[rel*='icon']");
    existingFavicons.forEach((favicon) => favicon.remove());

    const link = document.createElement('link');
    link.rel = 'shortcut icon';
    link.type = 'image/svg+xml';

    // Create SVG based on state
    const svg = this.createFaviconSVG(state);
    const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
    const svgUrl = URL.createObjectURL(svgBlob);

    link.href = svgUrl;
    document.head.appendChild(link);

    console.log('Custom SVG favicon set for state:', state);
  }

  createFaviconSVG(state) {
    const svgTemplates = {
      work: `
        <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 4.5 L6 11.5 L11 8 Z" fill="#1db954"/>
        </svg>
      `,
      break: `
        <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 4.5 L6 11.5 L11 8 Z" fill="#1e90ff"/>
        </svg>
      `,
      paused: `
        <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          <rect x="5.5" y="4.5" width="1.5" height="7" fill="#b3b3b3"/>
          <rect x="9" y="4.5" width="1.5" height="7" fill="#b3b3b3"/>
        </svg>
      `,
      complete: `
        <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          <rect x="5" y="5" width="6" height="6" fill="#ff4444"/>
        </svg>
      `,
    };

    return svgTemplates[state] || svgTemplates.paused;
  }

  restoreOriginalFavicon() {
    // Set to paused state as default
    this.setCustomFavicon('paused');
  }
}
