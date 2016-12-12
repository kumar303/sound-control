import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';

class Tab extends React.Component {
  static propTypes = {
    tab: PropTypes.object,
  }

  onClickUrl = (event) => {
    event.preventDefault();
    chrome.tabs.update(this.props.tab.id, {active: true}, () => {
      window.close();
    });
  }

  onToggleMute = (event) => {
    event.preventDefault();
    const muted = this.props.tab.mutedInfo.muted ? false : true;
    chrome.tabs.update(this.props.tab.id, {muted});
  }

  render() {
    const {url, mutedInfo} = this.props.tab;

    let buttonCls;
    let buttonTitle;
    if (mutedInfo.muted) {
      buttonCls = 'muted';
      buttonTitle = 'unmute';
    } else {
      buttonCls = 'unmuted';
      buttonTitle = 'mute';
    }

    return (
      <div className="Tab">
        <a onClick={this.onClickUrl}>{url}</a>
        <button onClick={this.onToggleMute} title={buttonTitle}
          className={buttonCls}></button>
      </div>
    );
  }
}

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
