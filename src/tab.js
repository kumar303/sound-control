/* @flow */
import url from 'url';

import React, {PropTypes} from 'react';

export type BrowserTab = {
  id: number,
  windowId: number,
  title: string,
  url: string,
  audible: boolean,
  mutedInfo?: {
    muted: boolean,
  },
};

type TabProps = {
  selected: boolean,
  useSelectedStyle: boolean,
  tab: BrowserTab,
};

export default class Tab extends React.Component {
  props: TabProps;

  state: {
    tab: BrowserTab,
  };

  static defaultProps = {
    selected: false,
    useSelectedStyle: true,
  };

  constructor(props: TabProps) {
    super(props);
    this.state = {tab: props.tab};
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown, false);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown);
  }

  onKeyDown = (event: KeyboardEvent) => {
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

  componentWillReceiveProps(nextProps: TabProps) {
    if (nextProps.tab && nextProps.tab !== this.props.tab) {
      this.setState({tab: nextProps.tab});
    }
  }

  goToTabUrl() {
    const {tab} = this.state;
    chrome.tabs.update(tab.id, {active: true});
    // If it's in another window, focus it.
    chrome.windows.update(tab.windowId, {focused: true}, () => {
      // Close the Sound Control popup.
      window.close();
    });
  }

  onClickUrl = (event: Event) => {
    event.preventDefault();
    this.goToTabUrl();
  }

  toggleMute = () => {
    const {tab} = this.state;
    const muted = (tab.mutedInfo && tab.mutedInfo.muted) ? false : true;
    chrome.tabs.update(tab.id, {muted});
  }

  onToggleMute = (event: Event) => {
    event.preventDefault();
    this.toggleMute();
  }

  getMuteControl() {
    const {tab} = this.state;
    let buttonCls;
    let buttonTitle;
    if (tab.mutedInfo && tab.mutedInfo.muted) {
      buttonCls = 'muted';
      buttonTitle = 'unmute';
    } else {
      buttonCls = 'unmuted';
      buttonTitle = 'mute';
    }
    return (
      <button onClick={this.onToggleMute} title={buttonTitle}
        className={buttonCls}></button>
    );
  }

  render() {
    const {selected, useSelectedStyle} = this.props;
    const {tab} = this.state;

    let info;
    if (tab.audible) {
      info = this.getMuteControl();
    } else {
      info = <span className="no-sound">No sound</span>;
    }

    const urlHost = url.parse(tab.url).hostname;
    const classNames = ['Tab'];
    if (selected && useSelectedStyle) {
      classNames.push('selected');
    }

    return (
      <div className={classNames.join(' ')}>
        <a onKeyUp={this.onKeyDown} onClick={this.onClickUrl}>
          {tab.title}<span>{urlHost}</span>
        </a>
        {info}
      </div>
    );
  }
}
