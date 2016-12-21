import url from 'url';

import React, {PropTypes} from 'react';

export default class Tab extends React.Component {
  static propTypes = {
    selected: PropTypes.bool,
    useSelectedStyle: PropTypes.bool,
    tab: PropTypes.object,
    goToUrl: PropTypes.bool,
  }

  static defaultProps = {
    selected: false,
    useSelectedStyle: true,
  }

  constructor(props) {
    super(props);
    this.state = {tab: props.tab};
    if (props.goToUrl) {
      return this.goToTabUrl();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.goToUrl) {
      return this.goToTabUrl();
    }
    if (nextProps.tab && nextProps.tab !== this.props.tab) {
      this.setState({tab: nextProps.tab});
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
