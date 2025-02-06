chrome.commands.onCommand.addListener(function (command) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tabId = tabs[0]?.id ? tabs[0].id : 0;
    chrome.tabs.sendMessage(tabId, { action: command }, function (response) {
      // noop
    });
  });
});
