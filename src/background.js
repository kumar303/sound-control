class Background {
  constructor() {
    this.listeners = {};
    this.lastTab = null;
    this.tabList = [];

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (!message.background) {
        return;
      }
      console.log('Background: got message:', message);

      let readMessage;
      switch (message.action) {
        case 'getTabs':
          readMessage = this.getTabs();
          break;
        case 'openPopup':
          readMessage = this.onPopupOpen();
          break;
        case 'closePopup':
          readMessage = this.onPopupClose();
          break;
        default:
          throw new Error(
            `Background got an unexpected action: ${message.action}`);
      }

      readMessage.then(reply => sendResponse(reply))
        .catch(error => {
          console.error('Background: error reading message', error);
        });

      return true;
    });
  }

  onPopupOpen() {
    this.addListeners({
      onUpdated: this.onTabsUpdated,
      onRemoved: this.onTabRemoved,
    });
    return Promise.resolve();
  }

  onPopupClose() {
    this.removeListeners();
    return Promise.resolve();
  }

  sendToPopup(message) {
    return new Promise((resolve, reject) => {
      const id = undefined;
      const options = undefined;
      chrome.runtime.sendMessage(
        id,
        {
          popup: true,
          ...message,
        },
        options,
        (result) => {
          if (chrome.runtime.lastError) {
            console.log(
              'background: got error:', chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
          } else {
            resolve(result);
          }
        }
      );
    });
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

  onTabsUpdated = (tabId, changeInfo, tab) => {
    console.log(`background: Tab ${tab.id} was updated`, changeInfo);
    if (this.lastTab.id === tabId) {
      this.lastTab = tab;
    }
    this.tabList = this.tabList.map(
      oldTab => oldTab.id === tab.id ? tab : oldTab);

    this.sendToPopup({
      action: 'onTabsUpdated',
      data: {tab, changeInfo},
    });
  }

  onTabRemoved = (tabId) => {
    console.log(`background: Tab ${tabId} was removed`);
    if (this.lastTab.id === tabId) {
      this.lastTab = null;
    }

    this.tabList = this.tabList.filter(tab => tab.id !== tabId);

    this.sendToPopup({
      action: 'onTabRemoved',
      data: tabId,
    });
  }

  queryTabs(query) {
    return new Promise((resolve, reject) => {
      chrome.tabs.query(query, tabs => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        resolve(tabs);
      });
    });
  }

  getTabs = () => {
    return Promise.all([
      this.queryTabs({active: true, currentWindow: true}),
      this.queryTabs({audible: true}),
    ])
      .then(([activeTabs, audibleTabs]) => {
        const newTabList = [];
        if (this.lastTab) {
          // Put the last viewed site at the top of the list so you
          // can easily jump between what you're working on and what
          // you're listening to.
          newTabList.push(this.lastTab);
        }

        function addUniqueTabs(tabList) {
          const existingIds = new Set(newTabList.map(tab => tab.id));
          tabList.forEach(tab => {
            if (!existingIds.has(tab.id)) {
              newTabList.push(tab);
            }
          });
        }

        addUniqueTabs(audibleTabs);
        // Keep inaudible tabs around since the music may have just been paused
        addUniqueTabs(this.tabList);

        while (newTabList.length > 10) {
          newTabList.pop();
        }

        this.tabList = newTabList;
        this.lastTab = activeTabs[0];

        return this.tabList;
      })
      .catch((error) => {
        console.log('background: getTabs: error:', error);
      });
  }

  listen() {
    console.log('background: listening for info about audible websites');
  }
}

const background = new Background();
background.listen();
