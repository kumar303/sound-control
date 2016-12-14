import url from 'url';

import React, {PropTypes} from 'react';

export default class Tab extends React.Component {
  static propTypes = {
    tab: PropTypes.object,
  }

  constructor(props) {
    super(props);
    this.state = {tab: props.tab};
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.tab && nextProps.tab !== this.props.tab) {
      this.setState({tab: nextProps.tab});
    }
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
    const {tab} = this.state;

    let buttonCls;
    let buttonTitle;
    if (tab.mutedInfo.muted) {
      buttonCls = 'muted';
      buttonTitle = 'unmute';
    } else {
      buttonCls = 'unmuted';
      buttonTitle = 'mute';
    }

    const urlHost = url.parse(tab.url).hostname;

    return (
      <div className="Tab">
        <a onClick={this.onClickUrl}>{tab.title}<span>{urlHost}</span></a>
        <button onClick={this.onToggleMute} title={buttonTitle}
          className={buttonCls}></button>
      </div>
    );
  }
}
