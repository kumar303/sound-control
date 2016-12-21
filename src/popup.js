import React from 'react';
import ReactDOM from 'react-dom';

import Tab from './tab';

class Popup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      audibleTabs: [],
      selectedTab: 0,
      goToSelectedTab: false,
    };
    this.listeners = {};
  }

  componentDidMount() {
    this.findAudibleTabs();

    this.addListeners({
      onCreated: this.onTabCreated,
      onUpdated: this.onTabsUpdated,
      onRemoved: this.onTabRemoved,
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
    this.removeListeners();
    document.removeEventListener('keydown', this.onKeyDown);
  }

  onKeyDown = (event) => {
    //console.log(event, 'keyName', event.key);
    const {selectedTab, audibleTabs} = this.state;

    if (event.key === 'Enter') {
      this.setState({goToSelectedTab: true});
      return;
    }

    let newSelectedTab;

    if (event.key === 'ArrowUp') {
      newSelectedTab = selectedTab - 1;
    } else if (event.key === 'ArrowDown') {
      newSelectedTab = selectedTab + 1;
    }

    if (newSelectedTab === undefined) {
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
    console.log(`Tab ${tab.id} was created`);
    this.findAudibleTabs();
  }

  onTabsUpdated = (tabId, changeInfo, tab) => {
    console.log(`Tab ${tab.id} was updated`, changeInfo);
    this.findAudibleTabs();
  }

  onTabRemoved = (tabId) => {
    console.log(`Tab ${tabId} was removed`);
    this.findAudibleTabs();
  }

  findAudibleTabs = () => {
    chrome.tabs.query({audible: true}, tabs => {
      this.setState({audibleTabs: tabs});
    });
  }

  render() {
    const {goToSelectedTab, audibleTabs, selectedTab} = this.state;
    let items = audibleTabs;
    if (!items.length) {
      items.push(
        <div className="no-sounds">
          There are currently no websites playing sound
        </div>
      );
    } else {
      const useSelectedStyle = audibleTabs.length > 1;
      items = items.map((tab, index) => {
        const isSelected = index === selectedTab;
        const goToUrl = goToSelectedTab && isSelected;
        return (
          <Tab tab={tab}
            selected={isSelected} goToUrl={goToUrl}
            useSelectedStyle={useSelectedStyle} />
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
