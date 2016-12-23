class Background {
  constructor() {
    this.listeners = {};

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (!message.background) {
        return;
      }
      console.log('Background: got message:', message);
      switch (message.action) {
        case 'findAudibleTabs':
          return sendResponse(this.findAudibleTabs());
        case 'openPopup':
          return sendResponse(this.onPopupOpen());
        case 'closePopup':
          return sendResponse(this.onPopupClose());
        default:
          throw new Error(
            `Background got an unexpected action: ${message.action}`);
      }
    });
  }

  onPopupOpen() {
    return this.addListeners({
      onCreated: this.onTabCreated,
      onUpdated: this.onTabsUpdated,
      onRemoved: this.onTabRemoved,
    });
  }

  onPopupClose() {
    return this.removeListeners();
  }

  sendToPopup(message) {
    const id = undefined;
    const options = undefined;
    chrome.runtime.sendMessage(
      id,
      {
        popup: true,
        ...message,
      },
      options,
      () => {
        if (chrome.runtime.lastError) {
          console.log(
            'background: got error:',
            chrome.runtime.lastError);
        }
      }
    );
  }

  visitListeners(visit) {
    Object.keys(this.listeners).forEach(eventName => {
      const callback = this.listeners[eventName];
      if (!callback) {
        throw new Error(
          `eventName "${eventName}" is not a valid listener callback; ` +
          `value=${callback}`);
      }
      const event = chrome.tabs[eventName];
      if (!event) {
        throw new Error(
          `chrome.tabs["${eventName}"] is not a valid event; value=${event}`);
      }
      visit({event, callback});
    });
  }

  addListeners(listeners) {
    this.listeners = listeners;
    this.visitListeners(({event, callback}) => {
      event.addListener(callback);
    });
  }

  removeListeners() {
    this.visitListeners(({event, callback}) => {
      event.removeListener(callback);
    });
  }

  onTabCreated = (tab) => {
    console.log(`background: Tab ${tab.id} was created`);
    this.sendToPopup({
      action: 'onTabCreated',
      data: tab,
    });
  }

  onTabsUpdated = (tabId, changeInfo, tab) => {
    console.log(`background: Tab ${tab.id} was updated`, changeInfo);
    this.sendToPopup({
      action: 'onTabsUpdated',
      data: {tab, changeInfo},
    });
  }

  onTabRemoved = (tabId) => {
    console.log(`background: Tab ${tabId} was removed`);
    this.sendToPopup({
      action: 'onTabRemoved',
      data: tabId,
    });
  }

  findAudibleTabs = () => {
    chrome.tabs.query({audible: true}, tabs => {
      this.sendToPopup({
        action: 'findAudibleTabs',
        data: tabs,
      });
    });
  }

  listen() {
    console.log('background: listening for info about audible websites');
  }
}

const background = new Background();
background.listen();
