import Timer from './Timer.js';

new Timer(document.querySelector('.timer'));

// let startTime;
// let endTime;
// let timerInterval;
// let isRunning = false;
// let duration = 5 * 1000;

// const timerEl = document.getElementById('countdown');
// const startBtn = document.getElementById('start');
// const resetBtn = document.getElementById('reset');
// const timeInput = document.getElementById('time-input');
// const countdown = document.getElementById('countdown');

// countdown.addEventListener('click', () => {
//   if (isRunning) return;
//   countdown.style.display = 'none';
//   timeInput.value = '';
//   timeInput.style.display = 'block';
//   timeInput.focus();
// });

// timeInput.addEventListener('input', () => {
//   const digits = timeInput.value.replace(/\D/g, '').slice(-4);
//   let padded = digits.padStart(4, '0');
//   let minutes = padded.slice(0, 2);
//   let seconds = padded.slice(2);

//   timeInput.value = `${minutes}:${seconds}`;
// });

// timeInput.addEventListener('blur', setCustomTime);
// timeInput.addEventListener('keydown', (e) => {
//   if (e.key === 'Enter') {
//     setCustomTime();
//   }
// });

// startBtn.addEventListener('click', () => {
//   if (isRunning) return; // prevent double-start
//   startTime = Date.now();
//   endTime = startTime + duration;
//   isRunning = true;
//   update();
// });

// resetBtn.addEventListener('click', () => {
//   clearTimeout(timerInterval);
//   isRunning = false;
//   const mins = String(Math.floor(duration / 60000)).padStart(2, '0');
//   const secs = String(Math.floor((duration % 60000) / 1000)).padStart(2, '0');
//   timerEl.textContent = `${mins}:${secs}`;

// });

// function setCustomTime() {
//   const parts = timeInput.value.split(':');
//   if (parts.length === 2) {
//     const minutes = parseInt(parts[0]);
//     const seconds = parseInt(parts[1]);

//     if (!isNaN(minutes) && !isNaN(seconds)) {
//       const totalMs = (minutes * 60 + seconds) * 1000;
//       duration = totalMs;
//       timerEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
//     }
//   }
//   timeInput.style.display = 'none';
//   countdown.style.display = 'block';
// }

// function update() {
//     const now = Date.now();
//     const timeLeft = endTime - now;

//   if (timeLeft <= 0) {
//       clearTimeout(timerInterval);
//       timerEl.textContent = '00:00';
//       isRunning = false;
//       return;
//     }

//     let minutes = Math.floor(timeLeft / 60000);
//     let seconds = Math.floor((timeLeft % 60000) / 1000);

//     minutes = String(minutes).padStart(2, '0');
//     seconds = String(seconds).padStart(2, '0');

//     timerEl.textContent = `${minutes}:${seconds}`;
//     timerInterval = setTimeout(update, 100);
// }
