import React from 'react';
import ReactDOM from 'react-dom';

import Tab from './tab';

class Popup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      audibleTabs: undefined,
      selectedTab: 0,
    };

    chrome.runtime.onMessage.addListener((message) => {
      if (!message.popup) {
        return;
      }
      console.log('Popup: got message:', message);
      switch (message.action) {
        case 'findAudibleTabs':
          return this.findAudibleTabs(message);
        case 'onTabCreated':
          return this.onTabCreated(message);
        case 'onTabsUpdated':
          return this.onTabsUpdated(message);
        case 'onTabRemoved':
          return this.onTabRemoved(message);
        default:
          throw new Error(
            `Popup got an unexpected action: ${message.action}`);
      }
    });

    window.addEventListener('unload', this.onWindowUnload);
  }

  componentDidMount() {
    this.sendToBackground({action: 'openPopup'})
      .then(() => {
        console.log('popup: openPopup message received');
        this.sendToBackground({
          action: 'findAudibleTabs',
        });
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
            resolve();
          }
        }
      );
    });
  }

  onKeyDown = (event) => {
    const {selectedTab, audibleTabs} = this.state;
    let newSelectedTab;

    if (event.key === 'ArrowUp') {
      newSelectedTab = selectedTab - 1;
    } else if (event.key === 'ArrowDown') {
      newSelectedTab = selectedTab + 1;
    } else {
      return;
    }

    if (newSelectedTab >= audibleTabs.length) {
      newSelectedTab = audibleTabs.length - 1; // last one
    } else if (newSelectedTab < 0) {
      newSelectedTab = 0; // first one
    }
    console.log('Changing selected tab to', newSelectedTab);
    this.setState({selectedTab: newSelectedTab});
  }

  onTabCreated = (message) => {
    const tab = message.data;
    console.log(`popup: Tab ${tab.id} was created`);
    this.sendToBackground({
      action: 'findAudibleTabs',
    });
  }

  onTabsUpdated = (message) => {
    const {tab, changeInfo} = message.data;
    console.log(`popup: Tab ${tab.id} was updated`, changeInfo);
    this.sendToBackground({
      action: 'findAudibleTabs',
    });
  }

  onTabRemoved = (message) => {
    const tabId = message.data;
    console.log(`popup: Tab ${tabId} was removed`);
    this.sendToBackground({
      action: 'findAudibleTabs',
    });
  }

  findAudibleTabs = (message) => {
    console.log('popup: findAudibleTabs', message);
    this.setState({audibleTabs: message.data});
  }

  render() {
    const {audibleTabs, selectedTab} = this.state;
    let items = audibleTabs;
    if (items === undefined) {
      items = [
        <div className="no-sounds">
          Loading...
        </div>
      ];
    } else if (!items.length) {
      items.push(
        <div className="no-sounds">
          There are currently no websites playing sound
        </div>
      );
    } else {
      const useSelectedStyle = audibleTabs.length > 1;
      items = items.map((tab, index) => {
        const selected = index === selectedTab;
        return (
          <Tab tab={tab}
            selected={selected} useSelectedStyle={useSelectedStyle} />
        );
      });
    }

    return (
      <ul>
        {items.map(item => <li>{item}</li>)}
      </ul>
    );
  }
}

ReactDOM.render(<Popup/>, document.getElementById('app'));
