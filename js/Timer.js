export default class Timer {
  constructor(root) {
    root.innerHTML = Timer.getHTML();

    this.el = {
      minutes: root.querySelector('.minutes'),
      seconds: root.querySelector('.seconds'),
      control: root.querySelector('.control'),
      reset: root.querySelector('.reset'),
      timer: root.querySelector('.timer-part'),
      input: root.querySelector('.timer-input'),
      indicator: root.querySelector('.indicator'),
      progressDots: root.querySelector('.progress-dots'),
    };

    this.sessionTypes = {
      work: { duration: 5, label: 'WORK' },
      break: { duration: 3, label: 'BREAK' },
      longBreak: { duration: 10, label: 'LONG BREAK' },
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

    this.interval = null;
    this.currentSessionIndex = 0;
    const currentSessionType = this.sessions[this.currentSessionIndex];
    this.remainingSeconds = this.sessionTypes[currentSessionType].duration;
    this.resetRemaining = this.sessionTypes[currentSessionType].duration;

    this.generateProgressDots();
    this.updateProgressDots();
    this.updateInterfaceTime();

    this.el.control.addEventListener('click', () => {
      if (this.interval === null) {
        this.start();
      } else {
        this.stop();
      }
    });

    this.resetClicked = false;

    this.el.reset.addEventListener('click', () => {
      if (!this.resetClicked) {
        this.resetClicked = true;
        this.el.reset.style.backgroundColor = '#e22134';
        this.el.reset.style.color = 'white';
        this.el.reset.innerHTML = 'Reset All';
        this.remainingSeconds = this.resetRemaining;
        this.stop();
        this.updateInterfaceTime();
        setTimeout(() => {
          this.resetClicked = false;
          this.el.reset.style.backgroundColor = '';
          this.el.reset.style.color = '';
          this.el.reset.textContent = 'Reset';
        }, 3000);
      } else {
        this.resetCycle();
      }
    });
  }

  generateProgressDots() {
    const dotsContainer = document.querySelector('.progress-dots');
    this.sessions.forEach((session, index) => {
      const dot = document.createElement('div');
      dot.classList.add('dot');
      dot.dataset.index = index;
      dotsContainer.appendChild(dot);
    });
  }

  updateProgressDots() {
    const dots = this.el.progressDots.querySelectorAll('.dot');

    dots.forEach((dot, index) => {
      dot.classList.remove('active', 'completed');

      if (index < this.currentSessionIndex) {
        dot.classList.add('completed');
      } else if (index == this.currentSessionIndex) {
        dot.classList.add('active');
        if (this.interval == null) {
          dot.classList.add('paused');
        } else {
          dot.classList.remove('paused');
        }
      }
    });
  }

  resetCycle() {
    this.currentSessionIndex = 0;
    const currentSessionType = this.sessions[0];
    this.remainingSeconds = this.sessionTypes[currentSessionType].duration;
    this.resetRemaining = this.remainingSeconds;
    this.stop();
    this.updateInterfaceTime();
    this.updateSessionIndicator();
    this.updateInterfaceControls();

    this.resetClicked = false;
    this.el.reset.style.backgroundColor = '';
    this.el.reset.style.color = '';
    this.el.reset.textContent = 'Reset';
  }

  updateInterfaceTime() {
    const minutes = Math.floor(this.remainingSeconds / 60);
    const seconds = this.remainingSeconds % 60;

    this.el.minutes.textContent = minutes.toString().padStart(2, '0');
    this.el.seconds.textContent = seconds.toString().padStart(2, '0');
  }

  updateInterfaceControls() {
    if (this.currentSessionIndex >= this.sessions.length) {
      // Cycle complete
      this.el.control.innerHTML = `Start`;
      this.el.control.classList.add('start');
      this.el.control.classList.remove('stop');
    } else if (this.interval === null) {
      this.el.control.innerHTML = `Start`;
      this.el.control.classList.add('start');
      this.el.control.classList.remove('stop');
    } else {
      this.el.control.innerHTML = `Pause`;
      this.el.control.classList.add('stop');
      this.el.control.classList.remove('start');
    }
  }

  start() {
    this.interval = setInterval(() => {
      this.remainingSeconds--;
      this.updateInterfaceTime();
      if (this.remainingSeconds == 0) {
        this.stop();
        this.nextSession();
        if (this.currentSessionIndex < this.sessions.length) {
          this.updateInterfaceTime();
          this.updateProgressDots();
        } else {
          this.updateInterfaceControls();
        }
      }
    }, 1000);
    this.updateInterfaceControls();
    this.updateProgressDots();
  }
  stop() {
    clearInterval(this.interval);
    this.interval = null;
    this.updateInterfaceControls();
    this.updateProgressDots();
  }

  sessionStop() {
    clearInterval(this.interval);
    this.interval = null;
    this.updateProgressDots();
  }

  nextSession() {
    this.currentSessionIndex++;
    if (this.currentSessionIndex < this.sessions.length) {
      const currentSessionType = this.sessions[this.currentSessionIndex];
      this.remainingSeconds = this.sessionTypes[currentSessionType].duration;
      this.resetRemaining = this.remainingSeconds;
      this.updateSessionIndicator();
      this.updateProgressDots();
    }
  }

  updateSessionIndicator() {
    const currentSessionType = this.sessions[this.currentSessionIndex];
    const label = this.sessionTypes[currentSessionType].label;
    this.el.indicator.textContent = label;
  }

  static getHTML() {
    return `
            
            <div class="session-header">
              <div class="progress-dots">
                <!-- 8 dots generated dynamically -->
              </div>
              <h3 class="indicator">WORK</h3>
            </div>
            <div class='timer-wrapper'>
              <div class="timer-part" id="timer-part">
                  <span class="minutes">00</span>
                  <span>:</span>
                  <span class="seconds">00</span>
              </div>
            </div>

            
        
            <div class="controls">
                <button class="timer-btn control start" id="start">Start</button>
                <button class="timer-btn reset" id="reset">Reset</button>
            </div>
        `;
  }
}

{
  /* <div class="sound-page">
  <button id="prev-page" class="page-arrow">
    ◀
  </button>
  <div class="sound-grid">
    <div class="sound-tile" data-sound="rain">
      Rain
    </div>
    <div class="sound-tile" data-sound="fire">
      Fire
    </div>
    <div class="sound-tile" data-sound="wind">
      Wind
    </div>
    <div class="sound-tile" data-sound="waves">
      Waves
    </div>
  </div>
  <button id="next-page" class="page-arrow">
    ▶
  </button>
</div>; */
}
