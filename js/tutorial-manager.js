// Final SimpleTutorialManager with refined screenshots
class TutorialManager {
  constructor(timerState, uiManager) {
    this.timerState = timerState;
    this.uiManager = uiManager;
    this.tutorialStep = 0;
    this.overlay = null;
    this.tutorialCard = null;
    this.isActive = false;

    console.log('Tutorial Manager Created');
    this.checkFirstTime();
  }

  checkFirstTime() {
    // Check localStorage for tutorial completion
    const tutorialCompleted = localStorage.getItem('pomofyTutorialCompleted');
    console.log('before ' + localStorage.getItem('pomofyTutorialCompleted'));

    if (tutorialCompleted === 'true') {
      console.log('Tutorial already completed, skipping');
    } else {
      console.log('First time user detected, will start tutorial');
      this.waitForTimerInjection();
    }
  }

  waitForTimerInjection() {
    console.log('Waiting for timer injection...');
    let attempts = 0;
    const maxAttempts = 60; // 30 seconds

    const checkForTimer = setInterval(() => {
      attempts++;
      const timerButton = document.querySelector('#pomofy-button');

      if (timerButton) {
        clearInterval(checkForTimer);
        console.log('Timer button found, starting tutorial in 2 seconds...');
        setTimeout(() => this.startTutorial(), 2000);
      } else if (attempts >= maxAttempts) {
        clearInterval(checkForTimer);
        console.error('Timer button not found after 30 seconds');
      }
    }, 500);
  }

  startTutorial() {
    if (this.isActive) return;

    console.log(
      'Tutorial starting now!' + localStorage.getItem('pomofyTutorialCompleted')
    );
    this.isActive = true;

    this.createOverlay();
    this.showStep(0);
  }

  createOverlay() {
    // Remove existing overlay if any
    const existingOverlay = document.querySelector('#pomofy-tutorial-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }

    // Simple flat overlay
    this.overlay = document.createElement('div');
    this.overlay.id = 'pomofy-tutorial-overlay';
    this.overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 1000000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
      `;

    document.body.appendChild(this.overlay);
    console.log('Overlay created');
  }

  showStep(step) {
    const steps = [
      {
        title: 'Welcome to Pomofy',
        content:
          "Your Pomodoro timer is now integrated into Spotify. Let's show you how to use it.",
        imageType: null,
      },
      {
        title: 'Find Your Timer',
        content:
          "Look for the timer button in Spotify's player bar. It shows your current session time and gives you quick access to all controls.",
        imageType: 'timer-button',
      },
      {
        title: 'Control Your Sessions',
        content:
          'Click the timer to open the full interface. Start sessions, track progress with dots, and manage your Pomodoro cycles.',
        imageType: 'timer-popup',
      },
      {
        title: 'Timer States',
        content:
          'The timer changes color based on your session: Green for work sessions, blue for breaks, grey when paused, and red when complete.',
        imageType: 'timer-states',
      },
      {
        title: "You're Ready!",
        content:
          'The timer appears in your browser tab title and favicon changes help you stay focused. Click the extension icon in your toolbar to customize settings.',
        imageType: null,
      },
    ];

    const currentStep = steps[step];
    if (!currentStep) {
      this.completeTutorial();
      return;
    }

    this.createTutorialCard(currentStep, step, steps.length);
  }

  createTutorialCard(stepData, stepIndex, totalSteps) {
    // Remove existing card
    if (this.tutorialCard) {
      this.tutorialCard.remove();
    }

    // Create tutorial card
    this.tutorialCard = document.createElement('div');
    this.tutorialCard.style.cssText = `
        background-color: #121212;
        border-radius: 10px;
        padding: 24px;
        width: 380px;
        position: relative;
      `;

    const progressPercent = ((stepIndex + 1) / totalSteps) * 100;

    this.tutorialCard.innerHTML = `
        <!-- Progress header -->
        <div style="
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        ">
          <div style="
            flex: 1;
            height: 2px;
            background-color: #535353;
            border-radius: 1px;
            overflow: hidden;
          ">
            <div style="
              width: ${progressPercent}%;
              height: 100%;
              background-color: #1db954;
              transition: width 0.3s ease;
            "></div>
          </div>
          <button id="tutorial-skip" style="
            flex-shrink: 0;
            background: none;
            border: none;
            color: #535353;
            cursor: pointer;
            font-size: 16px;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: color 0.2s ease;
          ">×</button>
        </div>
  
        <!-- Step header -->
        <div style="
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        ">
          <div style="
            background-color: #1db954;
            color: black;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 14px;
            flex-shrink: 0;
          ">${stepIndex + 1}</div>
          
          <h3 style="
            color: #1db954;
            font-weight: 300;
            margin: 0;
            font-size: 16px;
          ">${stepData.title}</h3>
        </div>
  
        <!-- Content -->
        <div style="
          color: #b3b3b3;
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: ${stepData.imageType ? '16px' : '24px'};
        ">
          ${stepData.content}
        </div>
  
        <!-- Screenshot -->
        ${
          stepData.imageType
            ? this.getImageHTML(stepData.imageType, stepData.title)
            : ''
        }
  
        <!-- Controls -->
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-top: 20px;
        ">
          <div style="
            color: #535353;
            font-size: 12px;
          ">
            ${stepIndex + 1} of ${totalSteps}
          </div>
          
          <div style="display: flex; gap: 8px;">
            ${
              stepIndex > 0
                ? `
              <button id="tutorial-back" style="
                background-color: transparent;
                color: #b3b3b3;
                border: 1px solid #535353;
                padding: 8px 16px;
                border-radius: 500px;
                cursor: pointer;
                font-size: 12px;
                font-weight: 700;
                transition: all 0.2s ease;
              ">Back</button>
            `
                : ''
            }
            
            <button id="tutorial-next" style="
              background-color: #1db954;
              color: black;
              border: none;
              padding: 8px 16px;
              border-radius: 500px;
              cursor: pointer;
              font-size: 12px;
              font-weight: 700;
              transition: background-color 0.2s ease;
              min-width: 60px;
            ">
              ${stepIndex === totalSteps - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      `;

    this.overlay.appendChild(this.tutorialCard);
    this.addEventListeners();
  }

  getImageHTML(imageType, alt) {
    let imageContent = '';

    switch (imageType) {
      case 'timer-button':
        // Spotify navbar with timer button
        imageContent = `
            <div style="
              background-color: #000000;
              border-radius: 6px;
              padding: 12px;
              margin-bottom: 16px;
              min-height: 60px;
              display: flex;
              gap: 16px;
              align-items: center;
              justify-content: center;
            ">
              <!-- Left -->
              <div style="display: flex; align-items: center; gap: 12px;">
                <!-- Now Playing -->
                <svg viewBox="0 0 16 16" width="16" height="16" style="color: #b3b3b3;">
                  <path fill="currentColor" d="M11.196 8 6 5v6z"></path>
                  <path fill="currentColor" d="M15.002 1.75A1.75 1.75 0 0 0 13.252 0h-10.5a1.75 1.75 0 0 0-1.75 1.75v12.5c0 .966.783 1.75 1.75 1.75h10.5a1.75 1.75 0 0 0 1.75-1.75zm-1.75-.25a.25.25 0 0 1 .25.25v12.5a.25.25 0 0 1-.25.25h-10.5a.25.25 0 0 1-.25-.25V1.75a.25.25 0 0 1 .25-.25z"></path>
                </svg>
  
                <!-- Lyrics -->
                <svg viewBox="0 0 16 16" width="16" height="16" style="color: #b3b3b3;">
                  <path fill="currentColor" d="M13.426 2.574a2.831 2.831 0 0 0-4.797 1.55l3.247 3.247a2.831 2.831 0 0 0 1.55-4.797M10.5 8.118l-2.619-2.62L4.74 9.075 2.065 12.12a1.287 1.287 0 0 0 1.816 1.816l3.06-2.688 3.56-3.129zM7.12 4.094a4.331 4.331 0 1 1 4.786 4.786l-3.974 3.493-3.06 2.689a2.787 2.787 0 0 1-3.933-3.933l2.676-3.045z"></path>
                </svg>
  
                <!-- Queue/List -->
                <svg viewBox="0 0 16 16" width="16" height="16" style="color: #b3b3b3;">
                  <path fill="currentColor" d="M15 15H1v-1.5h14zm0-4.5H1V9h14zm-14-7A2.5 2.5 0 0 1 3.5 1h9a2.5 2.5 0 0 1 0 5h-9A2.5 2.5 0 0 1 1 3.5m2.5-1a1 1 0 0 0 0 2h9a1 1 0 1 0 0-2z"></path>
                </svg>
  
                <!-- Connect -->
                <svg viewBox="0 0 16 16" width="16" height="16" style="color: #b3b3b3;">
                  <path fill="currentColor" d="M6 2.75C6 1.784 6.784 1 7.75 1h6.5c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0 1 14.25 15h-6.5A1.75 1.75 0 0 1 6 13.25zm1.75-.25a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h6.5a.25.25 0 0 0 .25-.25V2.75a.25.25 0 0 0-.25-.25zm-6 0a.25.25 0 0 0-.25.25v6.5c0 .138.112.25.25.25H4V11H1.75A1.75 1.75 0 0 1 0 9.25v-6.5C0 1.784.784 1 1.75 1H4v1.5zM4 15H2v-1.5h2z"></path>
                  <path fill="currentColor" d="M13 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0m-1-5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"></path>
                </svg>
              </div>
              <!-- Timer button (highlighted) -->
              <div style="
                border: 2px solid #1db954;
                border-radius: 4px;
                padding: 8px; 4px;
                background-color: rgba(29, 185, 84, 0.1);
              ">
                <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
                  <svg width="16" height="16" viewBox="0 0 16 16" style="color: #1db954;">
                    <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5" fill="none"/>
                    <line x1="8" y1="8" x2="8" y2="4" stroke="currentColor" stroke-width="1.5"/>
                    <line x1="8" y1="8" x2="11" y2="8" stroke="currentColor" stroke-width="1.5"/>
                  </svg>
                  <span style="color: #1db954; font-size: 10px; font-family: monospace;">25:00</span>
                </div>
              </div>
              <!-- Right -->
              <div style="display: flex; align-items: center; gap: 12px;">
                <!-- Volume -->
                <svg viewBox="0 0 16 16" width="16" height="16" style="color: #b3b3b3;">
                  <path fill="currentColor" d="M9.741.85a.75.75 0 0 1 .375.65v13a.75.75 0 0 1-1.125.65l-6.925-4a3.64 3.64 0 0 1-1.33-4.967 3.64 3.64 0 0 1 1.33-1.332l6.925-4a.75.75 0 0 1 .75 0zm-6.924 5.3a2.14 2.14 0 0 0 0 3.7l5.8 3.35V2.8zm8.683 6.087a4.502 4.502 0 0 0 0-8.474v1.65a3 3 0 0 1 0 5.175z"></path>
                </svg>
                <div style="position: relative;">
                  <div style="width: 80px; height: 4px; background-color: #535353; border-radius: 3px;"></div>
                  <div style="position: absolute; top:0; width: 64px; height: 4px; background-color: white; border-radius: 3px;"></div>
                </div>
              </div>
            </div>
          `;
        break;

      case 'timer-states':
        // Browser tabs with different favicons
        imageContent = `
            <div style="
              margin: auto;
              width: 90%;
              background-color: #1f1f1f;
              border-radius: 6px;
              padding: 16px;
              min-height: 100px;
              margin-bottom: 16px;
            ">
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <!-- Work session tab -->
                <div style="display: flex; gap: 10px; align-items: center; color: #1db954">
                  <span style="min-width: 130px;">Work:</span>
                  <div style="
                    background-color: #3C3C3C;
                    border-radius: 8px 8px 0 0;
                    padding: 8px 12px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex: 1;
                  ">
                    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" style="height: 16px;">
          <path d="M6 4.5 L6 11.5 L11 8 Z" fill="#1db954"/>
        </svg>
                    <span style="color: #ffffff; font-size: 11px; font-weight: 500;">24:35</span>
                  </div>
                </div>
                
                <!-- Break session tab -->
                <div style="display: flex; gap: 10px; align-items: center; color: #1e90ff">
                  <span style="min-width: 130px;">Break:</span>
                  <div style="
                    background-color: #3C3C3C;
                    border-radius: 8px 8px 0 0;
                    padding: 8px 12px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex: 1;
                  ">
                    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" style="height: 16px;">
          <path d="M6 4.5 L6 11.5 L11 8 Z" fill="#1e90ff"/>
        </svg>
                    <span style="color: #ffffff; font-size: 11px; font-weight: 500;">04:23</span>
                  </div>
                </div>
  
                <!-- Pause tab -->
                <div style="display: flex; gap: 10px; align-items: center; color: #b3b3b3">
                  <span style="min-width: 130px;">Pause:</span>
                  <div style="
                    background-color: #3C3C3C;
                    border-radius: 8px 8px 0 0;
                    padding: 8px 12px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex: 1;
                  ">
                    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" style="height: 16px;">
          <rect x="5.5" y="4.5" width="1.5" height="7" fill="#b3b3b3"/>
          <rect x="9" y="4.5" width="1.5" height="7" fill="#b3b3b3"/>
        </svg>
                    <span style="color: #ffffff; font-size: 11px; font-weight: 500;">24:57</span>
                  </div>
                </div>
                
                <!-- Complete session tab -->
                <div style="display: flex; gap: 10px; align-items: center; color: #ff4444">
                  <span style="min-width: 130px;">Complete:</span>
                  <div style="
                    background-color: #3C3C3C;
                    border-radius: 8px 8px 0 0;
                    padding: 8px 12px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex: 1;
                  ">
                    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" style="height: 16px;">
          <rect x="5" y="5" width="6" height="6" fill="#ff4444"/>
        </svg>
                    <span style="color: #ffffff; font-size: 11px; font-weight: 500;">Complete</span>
                  </div>
                </div>
              </div>
            </div>
          `;
        break;

      case 'timer-popup':
        // Popup interface
        imageContent = `
            <div style="
              margin: auto;
              width: 90%;
              background-color: #1f1f1f;
              border-radius: 6px;
              padding: 16px;
              min-height: 100px;
              margin-bottom: 16px;
            ">
              <!-- Popup interface -->
              <div style="
                background-color: #121212;
                border-radius: 8px;
                padding: 24px;
                font-size: 12px;
                position: relative;
              ">
                <!-- Progress dots -->
                <div style="display: flex; gap: 8px; margin-bottom: 8px; align-items: center;">
                  <div style="width: 8px; height: 8px; background-color: #1db954; border-radius: 50%;"></div>
                  <div style="width: 8px; height: 8px; background-color: #1db954; border-radius: 50%;"></div>
                  <div style="width: 8px; height: 8px; background-color: #ffffff; border-radius: 50%;"></div>
                  <div style="width: 8px; height: 8px; background-color: #535353; border-radius: 50%;"></div>
                  <div style="width: 8px; height: 8px; background-color: #535353; border-radius: 50%;"></div>
                  <div style="width: 8px; height: 8px; background-color: #535353; border-radius: 50%;"></div>
                  <span style="color: #1db954; margin-left: auto; font-weight: 300; font-size: 15px;">WORK</span>
                </div>
                
                <!-- Timer display -->
                <div style="text-align: center; margin: -15px; padding: 32px;">
                  <span style="color: #ffffff; font-size: 64px; font-weight: 700;">25:00</span>
                </div>
                
                <!-- Controls -->
                <div style="display: flex; gap: 12px; justify-content: center;">
                  <button style="
                    padding: 12px 24px;
                    background-color: #1db954;
                    color: black;
                    border: none;
                    border-radius: 500px;
                    font-size: 14px;
                    font-weight: 700;
                    min-width: 108px;
                  ">Start</button>
                  <button style="
                    background-color: transparent;
                    color: #b3b3b3;
                    border: 1px solid #535353;
                    padding: 12px 24px;
                    border-radius: 500px;
                    font-size: 14px;
                    font-weight: 700;
                    min-width: 108px;
                  ">Reset</button>
                </div>
              </div>
            </div>
          `;
        break;

      default:
        imageContent = `
            <div style="
              width: 100%;
              height: 100px;
              background-color: #1f1f1f;
              border-radius: 6px;
              margin-bottom: 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #535353;
              font-size: 12px;
            ">
              ${alt || 'Screenshot'}
            </div>
          `;
    }

    return imageContent;
  }

  addEventListeners() {
    const nextBtn = this.tutorialCard.querySelector('#tutorial-next');
    const backBtn = this.tutorialCard.querySelector('#tutorial-back');
    const skipBtn = this.tutorialCard.querySelector('#tutorial-skip');

    nextBtn.addEventListener('click', () => this.nextStep());
    if (backBtn) backBtn.addEventListener('click', () => this.prevStep());
    skipBtn.addEventListener('click', () => this.completeTutorial());

    // Hover effects
    nextBtn.addEventListener('mouseenter', () => {
      nextBtn.style.backgroundColor = '#1ed760';
    });
    nextBtn.addEventListener('mouseleave', () => {
      nextBtn.style.backgroundColor = '#1db954';
    });

    if (backBtn) {
      backBtn.addEventListener('mouseenter', () => {
        backBtn.style.backgroundColor = 'transparent';
        backBtn.style.color = '#ffffff';
        backBtn.style.borderColor = '#b3b3b3';
      });
      backBtn.addEventListener('mouseleave', () => {
        backBtn.style.backgroundColor = 'transparent';
        backBtn.style.color = '#b3b3b3';
        backBtn.style.borderColor = '#535353';
      });
    }

    skipBtn.addEventListener('mouseenter', () => {
      skipBtn.style.color = '#ffffff';
    });
    skipBtn.addEventListener('mouseleave', () => {
      skipBtn.style.color = '#535353';
    });
  }

  nextStep() {
    this.tutorialStep++;
    this.showStep(this.tutorialStep);
  }

  prevStep() {
    this.tutorialStep--;
    this.showStep(this.tutorialStep);
  }

  completeTutorial() {
    localStorage.setItem('pomofyTutorialCompleted', 'true');
    console.log('Tutorial completed');
    this.isActive = false;

    // Clean up
    if (this.overlay) this.overlay.remove();
    if (this.tutorialCard) this.tutorialCard.remove();

    // Show completion message
    this.showCompletionMessage();
  }

  showCompletionMessage() {
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #1db954;
        color: black;
        padding: 12px 16px;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 600;
        z-index: 1000000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      `;
    message.textContent = '🎉 Tutorial completed! Happy focusing!';

    document.body.appendChild(message);

    setTimeout(() => {
      message.style.opacity = '0';
      message.style.transition = 'opacity 0.3s ease';
      setTimeout(() => message.remove(), 300);
    }, 3000);
  }
}
