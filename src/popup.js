/* @flow */
import React from 'react';
import ReactDOM from 'react-dom';

import Tab from './tab';
import type {BrowserTab} from './tab';
import type {TabListMessage} from './background';

class Popup extends React.Component {
  state: {
    tabs?: Array<BrowserTab>,
    selectedTab: number,
  };

  constructor(props) {
    super(props);
    this.state = {
      tabs: undefined,
      selectedTab: 0,
    };

    window.addEventListener('unload', this.onWindowUnload);
  }

  componentDidMount() {
    console.log('popup: componentDidMount()');

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (!message.popup) {
        return;
      }
      console.log('Popup: got message:', message);
      switch (message.action) {
        case 'tabListChanged':
          return sendResponse(this.onTabListChanged(message));
        default:
          throw new Error(
            `Popup got an unexpected action: ${message.action}`);
      }
    });

    this.sendToBackground({action: 'openPopup'})
      .then(() => {
        this.getTabs();
      });

    setTimeout(() => {
      console.log('focusing to get key events!');
      // The focus is a Firefox workaround for:
      // https://bugzilla.mozilla.org/show_bug.cgi?id=1324255
      document.querySelector('body').focus();
    }, 100);
    document.addEventListener('keydown', this.onKeyDown, false);
  }

  componentWillUnmount() {
    console.log('popup: componentWillUnmount');
    this.sendToBackground({
      action: 'closePopup',
    });

    document.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('unload', this.onWindowUnload);
  }

  onWindowUnload = () => {
    console.log('popup: onWindowUnload');
    this.componentWillUnmount();
  }

  sendToBackground(message) {
    const id = undefined;
    const options = undefined;
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        id,
        {
          background: true,
          ...message,
        },
        options,
        (result) => {
          if (chrome.runtime.lastError) {
            console.log(
              'popup: ignoring sendMessage error:',
              chrome.runtime.lastError);
          } else {
            resolve(result);
          }
        }
      );
    });
  }

  onKeyDown = (event: KeyboardEvent) => {
    const {selectedTab, tabs} = this.state;
    let newSelectedTab;

    if (event.shiftKey && event.key === 'M') {
      // A capital M will toggle mute/unmute all
      return this.toggleMuteAll();
    }

    if (event.key === 'ArrowUp') {
      newSelectedTab = selectedTab - 1;
    } else if (event.key === 'ArrowDown') {
      newSelectedTab = selectedTab + 1;
    } else {
      return;
    }

    if (!tabs) {
      throw new Error(
        'cannot react to keyboard events before tabs have been set');
    }

    if (newSelectedTab >= tabs.length) {
      newSelectedTab = tabs.length - 1; // last one
    } else if (newSelectedTab < 0) {
      newSelectedTab = 0; // first one
    }
    console.log('Changing selected tab to', newSelectedTab);
    this.setState({selectedTab: newSelectedTab});
  }

  onTabListChanged = (message: TabListMessage) => {
    const {tabs} = message.data;
    console.log(`popup: onTabListChanged:`, tabs);
    this.setState({tabs});
  }

  getTabs = () => {
    console.log('popup: getTabs');
    this.sendToBackground({action: 'getTabs'})
      .then((tabs: Array<BrowserTab>) => {
        console.log('popup: got response to getTabs', tabs);
        this.setState({tabs});
      });
  }

  allTabsAreMuted() {
    const {tabs} = this.state;
    if (!tabs) {
      return false;
    }
    return tabs.every(
      tab => !tab.audible || (tab.mutedInfo && tab.mutedInfo.muted));
  }

  toggleMuteAll() {
    const {tabs} = this.state;
    if (!tabs) {
      throw new Error('tabs have not been set in state yet');
    }
    // If all tabs are muted, we will unmute-all, otherwise mute-all.
    tabs.forEach(tab => {
      if (!tab.audible) {
        return;
      }
      chrome.tabs.update(tab.id, {muted: !this.allTabsAreMuted()}, () => {
        if (chrome.runtime.lastError) {
          console.log(
            `popup: onToggleMuteAll ${tab.id} error:`,
            chrome.runtime.lastError);
        }
      });
    });
  }

  onToggleMuteAll = (event: Event) => {
    event.preventDefault();
    this.toggleMuteAll();
  }

  renderTabItems() {
    const {tabs, selectedTab} = this.state;
    if (!tabs) {
      throw new Error('cannot render tabs before they have been set');
    }

    const useSelectedStyle = tabs.length > 1;

    const items = tabs.map((tab, index) => {
      const selected = index === selectedTab;
      return (
        <Tab tab={tab}
          selected={selected} useSelectedStyle={useSelectedStyle} />
      );
    });

    const muteAllPrompt =
      this.allTabsAreMuted() ? 'Unmute all' : 'Mute all';

    items.push(
      <div className="global-control">
        <button onClick={this.onToggleMuteAll}>{muteAllPrompt}</button>
      </div>
    );

    return items;
  }

  render() {
    const {tabs} = this.state;
    let items = [];

    if (tabs === undefined) {
      items.push(
        <div className="no-sounds">
          Loading...
        </div>
      );
    } else if (!tabs.length) {
      items.push(
        <div className="no-sounds">
          There are currently no websites playing sound
        </div>
      );
    } else {
      items = this.renderTabItems();
    }

    return (
      <ul className="Popup">
        {items.map(item => <li>{item}</li>)}
      </ul>
    );
  }
}

ReactDOM.render(<Popup/>, document.getElementById('app'));
