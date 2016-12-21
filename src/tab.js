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
    document.addEventListener('keydown', this.onKeyDown, false);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown);
  }

  onKeyDown = (event) => {
    if (!this.props.selected) {
      return;
    }

    if (event.key === 'Enter') {
      this.goToTabUrl();
      return;
    }

    if (event.key === 'm') {
      this.toggleMute();
      return;
    }
  }

  componentWillReceiveProps(nextProps) {
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

  toggleMute = () => {
    const muted = this.state.tab.mutedInfo.muted ? false : true;
    chrome.tabs.update(this.state.tab.id, {muted});
  }

  onToggleMute = (event) => {
    event.preventDefault();
    this.toggleMute();
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
