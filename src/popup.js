import React from 'react';
import ReactDOM from 'react-dom';

class Popup extends React.Component {
  render() {
    return <p>This is something, indeed</p>;
  }
}

// function refreshTabList(tabs) {
//   var list = document.querySelector("ul#audible-tabs");
//   document.body.removeChild(list);
//
//   list = document.createElement("ul");
//   list.setAttribute("id", "audible-tabs");
//
//   for (var tab of tabs) {
//     var item = document.createElement("li");
//     item.textContent = `ex.${tab.id} - ${tab.url}`;
//     item.onclick = function() {
//       chrome.tabs.update(tab.id, {active: true});
//     };
//
//     list.appendChild(item);
//   }
//
//   document.body.appendChild(list);
// }
//
// chrome.tabs.query({audible: true}, function (tabs) {
//   refreshTabList(tabs);
// });

ReactDOM.render(<Popup/>, document.getElementById('app'));
