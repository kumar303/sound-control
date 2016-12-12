import React, {PropTypes} from 'react';

export default class Tab extends React.Component {
  static propTypes = {
    tab: PropTypes.object,
  }

  constructor(props) {
    super(props);
    this.state = {tab: props.tab};
  }

  componentDidMount() {
    chrome.tabs.onUpdated.addListener(this.onUpdated);
  }

  componentWillUnmount() {
    chrome.tabs.onUpdated.removeListener(this.onUpdated);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.tab && nextProps.tab !== this.props.tab) {
      this.setState({tab: nextProps.tab});
    }
  }

  onUpdated = (tabId, changeInfo, tab) => {
    if (tabId !== this.state.tab.id) {
      return;
    }
    console.log(`Tab ${tab.id} was updated`);
    this.setState({tab});
  }

  onClickUrl = (event) => {
    event.preventDefault();
    chrome.tabs.update(this.state.tab.id, {active: true}, () => {
      window.close();
    });
  }

  onToggleMute = (event) => {
    event.preventDefault();
    const muted = this.state.tab.mutedInfo.muted ? false : true;
    chrome.tabs.update(this.state.tab.id, {muted});
  }

  render() {
    const {url, mutedInfo} = this.state.tab;

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
