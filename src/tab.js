import url from 'url';

import React, {PropTypes} from 'react';

export default class Tab extends React.Component {
  static propTypes = {
    selected: PropTypes.bool,
    useSelectedStyle: PropTypes.bool,
    tab: PropTypes.object,
  }

  static defaultProps = {
    selected: false,
    useSelectedStyle: true,
  }

  constructor(props) {
    super(props);
    this.state = {tab: props.tab};
  }

  componentDidMount() {
    chrome.runtime.onMessage.addListener(this.onMessage);
  }

  componentWillUnmount() {
    chrome.runtime.onMessage.removeListener(this.onMessage);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.tab && nextProps.tab !== this.props.tab) {
      this.setState({tab: nextProps.tab});
    }
  }

  onMessage = (message, sender, sendResponse) => {
    const {selected} = this.props;
    if (selected && message.keyCommand === 'select') {
      console.log('Selecting tab', this.props.tab.id);
      this.goToTabUrl();
    }
  }

  goToTabUrl() {
    chrome.tabs.update(this.state.tab.id, {active: true}, () => {
      window.close();
    });
  }

  onClickUrl = (event) => {
    event.preventDefault();
    this.goToTabUrl();
  }

  onToggleMute = (event) => {
    event.preventDefault();
    const muted = this.state.tab.mutedInfo.muted ? false : true;
    chrome.tabs.update(this.state.tab.id, {muted});
  }

  onKeyDown = (event) => {
    event.preventDefault();
    const enterKeyCode = 13;
    console.log('Key pressed:', event.keyCode);
    if (event.keyCode === enterKeyCode) {
      this.onClickUrl();
    }
  }

  render() {
    const {selected, useSelectedStyle} = this.props;
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
    const classNames = ['Tab'];
    if (selected && useSelectedStyle) {
      classNames.push('selected');
    }

    return (
      <div className={classNames.join(' ')}>
        <a  ref={(ref) => { this.tabAnchor = ref; }}
            onKeyUp={this.onKeyDown} onClick={this.onClickUrl}>
          {tab.title}<span>{urlHost}</span>
        </a>
        <button onClick={this.onToggleMute} title={buttonTitle}
          className={buttonCls}></button>
      </div>
    );
  }
}
