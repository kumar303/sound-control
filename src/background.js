chrome.commands.onCommand.addListener((command) => {
  console.log('got command:', command);
  chrome.runtime.sendMessage({keyCommand: command});
});
