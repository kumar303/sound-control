import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';

class AudibleTab extends React.Component {
  static propTypes = {
    tab: PropTypes.object,
  }

  onClick = (event) => {
    event.preventDefault();
    chrome.tabs.update(this.props.tab.id, {active: true}, () => {
      window.close();
    });
  }

  render() {
    const {url} = this.props.tab;
    return (
      <a onClick={this.onClick}>{url}</a>
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
      items.push('There are currently no audible tabs');
    } else {
      items = items.map(tab => <AudibleTab tab={tab} />);
    }
    return (
      <ul>
        {items.map(item => <li>{item}</li>)}
      </ul>
    );
  }
}

ReactDOM.render(<Popup/>, document.getElementById('app'));
