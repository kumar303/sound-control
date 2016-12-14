import React from 'react';
import ReactDOM from 'react-dom';

import Tab from './tab';

class Popup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      audibleTabs: [],
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
  }

  componentWillUnmount() {
    this.removeListeners();
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
    console.log(`Tab ${tab.id} was updated`);
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
    let items = this.state.audibleTabs;
    if (!items.length) {
      items.push('There are currently no websites playing sound');
    } else {
      items = items.map(tab => <Tab tab={tab} />);
    }
    return (
      <ul>
        {items.map(item => <li>{item}</li>)}
      </ul>
    );
  }
}

ReactDOM.render(<Popup/>, document.getElementById('app'));
