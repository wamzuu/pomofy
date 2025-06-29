// Timer states for easy manipulation
const TimerStates = {
  STOPPED: 'stopped',
  RUNNING: 'running',
  PAUSED: 'paused',
  SESSION_COMPLETE: 'session_complete',
  CYCLE_COMPLETE: 'cycle_complete',
};

// Types of sessions for pomo timer
const SessionTypes = {
  work: { duration: 25 * 60, label: 'WORK' },
  break: { duration: 5 * 60, label: 'BREAK' },
  longBreak: { duration: 15 * 60, label: 'LONG BREAK' },
};

// Default sessions config
const DefaultSessions = [
  'work',
  'break',
  'work',
  'break',
  'work',
  'break',
  'work',
  'longBreak',
];

// Testing session types
const TestTypes = {
  work: { duration: 10, label: 'WORK' },
  break: { duration: 5, label: 'BREAK' },
};

// Testing sessions config
const SessionTest = ['work', 'break'];
