import React from 'react';
import ReactDOM from 'react-dom';

import Tab from './tab';

class Popup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      audibleTabs: [],
    };
  }

  componentDidMount() {
    chrome.tabs.query({audible: true}, tabs => {
      this.setState({audibleTabs: tabs});
    });
  }

  render() {
    let items = this.state.audibleTabs;
    if (!items.length) {
      items.push('There are currently no tabs playing sound');
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
