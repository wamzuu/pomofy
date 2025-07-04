// Include constants directly in popup.js since they might not be accessible
const PRESETS = {
  classic: {
    durations: {
      work: 25 * 60,
      break: 5 * 60,
      longBreak: 15 * 60,
    },
    cycle: {
      workSessions: 4,
    },
    audio: {
      sound: 'gong',
      volume: 50,
    },
    ui: {
      showInTitle: true,
      autoContinue: false,
    },
  },
  focus: {
    durations: {
      work: 50 * 60,
      break: 10 * 60,
      longBreak: 30 * 60,
    },
    cycle: {
      workSessions: 3,
    },
    audio: {
      sound: 'gong',
      volume: 50,
    },
    ui: {
      showInTitle: true,
      autoContinue: false,
    },
  },
  sprint: {
    durations: {
      work: 15 * 60,
      break: 3 * 60,
      longBreak: 10 * 60,
    },
    cycle: {
      workSessions: 6,
    },
    audio: {
      sound: 'gong',
      volume: 50,
    },
    ui: {
      showInTitle: true,
      autoContinue: false,
    },
  },
};

const DEFAULT_SETTINGS = {
  selectedPreset: 'classic',
  customSettings: {
    durations: {
      work: 25 * 60,
      break: 5 * 60,
      longBreak: 15 * 60,
    },
    cycle: {
      workSessions: 4,
    },
    audio: {
      sound: 'gong',
      volume: 50,
    },
    ui: {
      showInTitle: true,
      autoContinue: false,
    },
  },
  durations: {
    work: 25 * 60,
    break: 5 * 60,
    longBreak: 15 * 60,
  },
  cycle: {
    workSessions: 4,
    sessions: [
      'work',
      'break',
      'work',
      'break',
      'work',
      'break',
      'work',
      'longBreak',
    ],
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

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  setupEventListeners();
});

// Load settings from storage and populate form fields
async function loadSettings() {
  try {
    const result = await chrome.storage.local.get(['pomofySettings']);
    const settings = result.pomofySettings || DEFAULT_SETTINGS;
    populateFormFields(settings);
  } catch (error) {
    console.error('Error loading settings:', error);
    populateFormFields(DEFAULT_SETTINGS);
  }
}

// Populate all form fields with settings values
function populateFormFields(settings) {
  // Check if all required elements exist
  const elements = {
    workDuration: document.getElementById('workDuration'),
    breakDuration: document.getElementById('breakDuration'),
    longBreakDuration: document.getElementById('longBreakDuration'),
    workSessions: document.getElementById('workSessions'),
    notificationSound: document.getElementById('notificationSound'),
    soundVolume: document.getElementById('soundVolume'),
    volumeValue: document.getElementById('volumeValue'),
    volumeProgress: document.getElementById('volumeProgress'),
    autoContinue: document.getElementById('autoContinue'),
    showInTitle: document.getElementById('showInTitle'),
    quickPreset: document.getElementById('quickPreset'),
  };

  // Check for missing elements
  Object.entries(elements).forEach(([name, element]) => {
    if (!element) {
      console.error(`Missing element: ${name}`);
    }
  });

  // Timer duration fields (convert from seconds to minutes)
  if (elements.workDuration)
    elements.workDuration.value = settings.durations.work / 60;
  if (elements.breakDuration)
    elements.breakDuration.value = settings.durations.break / 60;
  if (elements.longBreakDuration)
    elements.longBreakDuration.value = settings.durations.longBreak / 60;

  // Cycle configuration
  if (elements.workSessions)
    elements.workSessions.value = settings.cycle.workSessions;

  // Audio settings
  if (elements.notificationSound)
    elements.notificationSound.value = settings.audio.sound;
  if (elements.soundVolume)
    elements.soundVolume.value = settings.audio.volume || 50;
  if (elements.volumeValue)
    elements.volumeValue.textContent = (settings.audio.volume || 50) + '%';
  if (elements.volumeProgress)
    elements.volumeProgress.value = settings.audio.volume || 50;

  // UI settings
  if (elements.autoContinue)
    elements.autoContinue.checked = settings.ui.autoContinue;
  if (elements.showInTitle)
    elements.showInTitle.checked = settings.ui.showInTitle;

  // Set preset dropdown
  if (elements.quickPreset)
    elements.quickPreset.value = settings.selectedPreset || 'classic';

  console.log('Form fields populated');
}

// Setup event listeners for all form elements
function setupEventListeners() {
  // Manual input changes should switch to custom mode
  const manualChangeEvents = [
    ['workDuration', 'input', handleManualChange],
    ['breakDuration', 'input', handleManualChange],
    ['longBreakDuration', 'input', handleManualChange],
    ['workSessions', 'input', handleManualChange],
    ['notificationSound', 'change', handleManualChange],
    ['autoContinue', 'change', handleManualChange],
    ['showInTitle', 'change', handleManualChange],
  ];

  // Special handlers that don't switch to custom
  const specialEvents = [
    ['quickPreset', 'change', handlePresetChange],
    ['testSound', 'click', testNotificationSound],
    ['defaultSettings', 'click', resetToDefaults],
  ];

  [...manualChangeEvents, ...specialEvents].forEach(([id, event, handler]) => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener(event, handler);
      console.log(`Added ${event} listener to ${id}`);
    } else {
      console.error(`Could not find element: ${id}`);
    }
  });

  // Special volume slider handler
  const volumeSlider = document.getElementById('soundVolume');
  if (volumeSlider) {
    volumeSlider.addEventListener('input', function () {
      const progress = document.getElementById('volumeProgress');
      const display = document.getElementById('volumeValue');

      if (progress) progress.value = this.value;
      if (display) display.textContent = this.value + '%';

      console.log('Volume changed to:', this.value);
      handleManualChange(); // This should also switch to custom
    });
  }

  console.log('Event listeners setup complete');
}

// Handle manual changes to form fields (should switch to custom)
async function handleManualChange() {
  await saveAsCustom();
}

// Handle preset selection - update form fields and save
async function handlePresetChange(event) {
  const presetName = event.target.value;
  console.log('Preset changed to:', presetName);

  if (presetName === 'custom') {
    console.log('Loading custom settings...');
    await loadCustomSettings();
    return;
  }

  // Apply preset values to form
  const preset = PRESETS[presetName];
  if (!preset) {
    console.error('Preset not found:', presetName);
    return;
  }

  console.log('Applying preset:', preset);

  // Update form fields with preset values (convert seconds to minutes)
  const workDuration = document.getElementById('workDuration');
  const breakDuration = document.getElementById('breakDuration');
  const longBreakDuration = document.getElementById('longBreakDuration');
  const workSessions = document.getElementById('workSessions');
  const autoContinue = document.getElementById('autoContinue');
  const showInTitle = document.getElementById('showInTitle');

  if (workDuration) {
    workDuration.value = preset.durations.work / 60;
  }
  if (breakDuration) {
    breakDuration.value = preset.durations.break / 60;
  }
  if (longBreakDuration) {
    longBreakDuration.value = preset.durations.longBreak / 60;
  }
  if (workSessions) {
    workSessions.value = preset.cycle.workSessions;
  }
  if (autoContinue) {
    autoContinue.checked = preset.ui.autoContinue;
  }
  if (showInTitle) {
    showInTitle.checked = preset.ui.showInTitle;
  }

  // Save the preset settings
  await savePresetSettings(presetName);
}

// Reset all settings to default values
async function resetToDefaults() {
  console.log('Resetting to defaults...');
  try {
    await chrome.storage.local.set({ pomofySettings: DEFAULT_SETTINGS });
    populateFormFields(DEFAULT_SETTINGS);
    console.log('Reset to defaults completed');
  } catch (error) {
    console.error('Error resetting to defaults:', error);
  }
}

// Save current form values to storage
async function saveSettings() {
  await saveAsCustom();
}

async function savePresetSettings(presetName) {
  try {
    // Get current settings to preserve existing custom settings
    const currentResult = await chrome.storage.local.get(['pomofySettings']);
    const currentSettings = currentResult.pomofySettings || {};

    const preset = PRESETS[presetName];
    const currentFormValues = getCurrentFormValues();
    const sessions = buildSessionsFromWorkCount(preset.cycle.workSessions);

    const settings = {
      selectedPreset: presetName,

      // Preserve existing custom settings (don't overwrite with preset)
      customSettings: currentSettings.customSettings || {
        durations: preset.durations,
        cycle: preset.cycle,
        audio: preset.audio,
        ui: preset.ui,
      },

      // Apply preset as current active settings
      durations: preset.durations,
      cycle: {
        workSessions: preset.cycle.workSessions,
        sessions: sessions,
      },
      audio: currentFormValues.audio, // Keep current audio settings from form
      ui: preset.ui,
    };

    await chrome.storage.local.set({ pomofySettings: settings });
    console.log('Preset settings saved:', settings);
  } catch (error) {
    console.error('Error saving preset settings:', error);
  }
}

async function loadCustomSettings() {
  console.log('🔧 Loading custom settings...');
  try {
    const result = await chrome.storage.local.get(['pomofySettings']);
    const settings = result.pomofySettings || {};

    if (settings.customSettings) {
      console.log('🔧 Found custom settings:', settings.customSettings);

      // Create a proper settings object for populateFormFields
      const customSettingsForForm = {
        selectedPreset: 'custom',
        durations: settings.customSettings.durations,
        cycle: settings.customSettings.cycle,
        audio: settings.customSettings.audio,
        ui: settings.customSettings.ui,
      };

      populateFormFields(customSettingsForForm);

      // Build sessions array and save the complete custom settings
      const sessions = buildSessionsFromWorkCount(
        settings.customSettings.cycle.workSessions
      );
      const completeSettings = {
        selectedPreset: 'custom',
        customSettings: settings.customSettings,
        durations: settings.customSettings.durations,
        cycle: {
          workSessions: settings.customSettings.cycle.workSessions,
          sessions: sessions,
        },
        audio: settings.customSettings.audio,
        ui: settings.customSettings.ui,
      };

      await chrome.storage.local.set({ pomofySettings: completeSettings });
      console.log('Custom settings loaded and applied');
    } else {
      console.log(
        'No custom settings found, creating from current form values'
      );
      // Create custom settings from current form values
      await saveAsCustom();
    }
  } catch (error) {
    console.error('Error loading custom settings:', error);
  }
}

// New function to handle saving current form as custom settings
async function saveAsCustom() {
  console.log('🔧 Saving current form as custom...');
  try {
    const newFormValues = getCurrentFormValues();
    const sessions = buildSessionsFromWorkCount(
      newFormValues.cycle.workSessions
    );

    const settings = {
      selectedPreset: 'custom',
      customSettings: {
        durations: newFormValues.durations,
        cycle: newFormValues.cycle,
        audio: newFormValues.audio,
        ui: newFormValues.ui,
      },
      durations: newFormValues.durations,
      cycle: {
        workSessions: newFormValues.cycle.workSessions,
        sessions: sessions,
      },
      audio: newFormValues.audio,
      ui: newFormValues.ui,
    };

    await chrome.storage.local.set({ pomofySettings: settings });

    // Update dropdown to show custom
    const presetDropdown = document.getElementById('quickPreset');
    if (presetDropdown) presetDropdown.value = 'custom';

    console.log('Form saved as custom settings:', settings);
  } catch (error) {
    console.error('Error saving as custom:', error);
  }
}

// Test notification sound
function testNotificationSound() {
  console.log('Testing notification sound...');
  const soundName = document.getElementById('notificationSound').value;
  const volumeValue = document.getElementById('soundVolume').value;
  const volumeDecimal = parseInt(volumeValue) / 100;

  console.log('Playing sound:', soundName, 'at volume:', volumeDecimal);

  if (testAudio && !testAudio.paused) {
    testAudio.pause();
    testAudio.currentTime = 0;
  }

  const audioUrl = chrome.runtime.getURL(`audio/${soundName}.wav`);
  testAudio = new Audio(audioUrl);
  testAudio.volume = volumeDecimal;

  testAudio.play().catch((error) => {
    console.error('Error playing test sound:', error);
  });

  testAudio.addEventListener('ended', () => {
    testAudio = null;
  });
}

// Utility functions
function getCurrentFormValues() {
  const values = {
    durations: {
      work: parseInt(document.getElementById('workDuration').value) * 60,
      break: parseInt(document.getElementById('breakDuration').value) * 60,
      longBreak:
        parseInt(document.getElementById('longBreakDuration').value) * 60,
    },
    cycle: {
      workSessions: parseInt(document.getElementById('workSessions').value),
    },
    audio: {
      sound: document.getElementById('notificationSound').value,
      volume: parseInt(document.getElementById('soundVolume').value),
    },
    ui: {
      autoContinue: document.getElementById('autoContinue').checked,
      showInTitle: document.getElementById('showInTitle').checked,
    },
  };

  console.log('🔧 Current form values:', values);
  return values;
}

function buildSessionsFromWorkCount(workSessionCount) {
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

let testAudio = null;
