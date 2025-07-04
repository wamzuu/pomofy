// Initialize all managers
const timerState = new TimerState();
const faviconManager = new FaviconManager(timerState);
const uiManager = new UIManager(timerState, faviconManager);

// storage listener
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.pomofySettings) {
    timerState.applySettingsUpdate(changes.pomofySettings.newValue);
  }
});

// Connect timer state to UI updates
timerState.notifyUIUpdate = () => {
  uiManager.updateAll();
};
timerState.uiManager = uiManager;

function createTimerButton(volumeButton) {
  const timerContainer = document.createElement('div');
  timerContainer.id = 'pomofy-container';
  timerContainer.style.display = 'inline-flex';
  timerContainer.style.alignItems = 'center';
  //timerContainer.style.marginRight = '3px';

  const timerButton = document.createElement('button');
  timerButton.id = 'pomofy-button';
  timerButton.style.background = 'transparent';
  timerButton.style.border = 'none';
  timerButton.style.color = '#b3b3b3';
  timerButton.style.cursor = 'pointer';
  timerButton.style.transition = 'color 0.2s ease';
  timerButton.style.padding = '1px';

  timerButton.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center;">
      <svg width="16" height="16" viewBox="0 0 16 16" style="margin-bottom: 2px;">
        <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5" fill="none"/>
        <line x1="8" y1="8" x2="8" y2="4" stroke="currentColor" stroke-width="1.5"/>
        <line x1="8" y1="8" x2="11" y2="8" stroke="currentColor" stroke-width="1.5"/>
      </svg>
      <span style="
  font-size: 10px;
  text-align: center;
  font-variant-numeric: tabular-nums;
">${timerState.formatTime(timerState.remainingSeconds)}</span>
    </div>
  `;

  // Hover effects
  timerButton.addEventListener('mouseenter', () => {
    timerButton.style.color = '#ffffff';
  });

  timerButton.addEventListener('mouseleave', () => {
    timerButton.style.color = '#b3b3b3';
  });

  // Popup toggle
  timerButton.addEventListener('click', (e) => {
    e.stopPropagation();
    uiManager.togglePopup(timerContainer);
  });

  // Close popup on outside click
  document.addEventListener('click', (e) => {
    if (
      uiManager.popupVisible &&
      uiManager.popup &&
      !uiManager.popup.contains(e.target) &&
      !timerContainer.contains(e.target)
    ) {
      uiManager.hidePopup();
    }
  });

  // Inject into Spotify
  timerContainer.appendChild(timerButton);
  const targetContainer = volumeButton.parentNode;
  targetContainer.parentNode.insertBefore(timerContainer, targetContainer);

  console.log('Pomofy timer injected');
}

function findInjectionPoint() {
  const volumeButton = document.querySelector(
    'button[aria-describedby="volume-icon"]'
  );
  if (volumeButton) {
    createTimerButton(volumeButton);
  }
}

// Injection logic
const checkForPlaybar = setInterval(() => {
  const volumeButton = document.querySelector(
    'button[aria-describedby="volume-icon"]'
  );

  if (volumeButton) {
    clearInterval(checkForPlaybar);
    createTimerButton(volumeButton);
  }
}, 1000);

setTimeout(() => {
  clearInterval(checkForPlaybar);
}, 30000);

// Initialize tutorial manager
let tutorialManager;

setTimeout(() => {
  tutorialManager = new TutorialManager(timerState, uiManager);

  // Make it globally accessible for development
  window.tutorialManager = tutorialManager;
  window.restartTutorial = () => tutorialManager.restartTutorial();
}, 1000);
