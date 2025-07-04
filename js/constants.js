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

// Default Settings
const DEFAULT_SETTINGS = {
  durations: {
    work: 25 * 60,
    break: 5 * 60,
    longBreak: 15 * 60,
  },
  cycle: {
    workSessions: 4,
    sessions: DefaultSessions,
  },
  audio: {
    sound: 'gong',
    volume: 50,
  },
  ui: {
    showInTitle: true,
    autoContinue: false,
  },
};
