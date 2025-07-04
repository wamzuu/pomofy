chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({
      isFirstTime: true,
      tutorialStep: 0,
    });
    console.log(
      'Pomofy installed! Tutorial will start on first Spotify visit.'
    );
  }
});
