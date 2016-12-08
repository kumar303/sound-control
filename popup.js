// Change the page style by applying an additional stylesheet to the webpage loaded in the tab.
function doActionCSS() {
  chrome.tabs.insertCSS({file: '/change-page.css'});
}

// Run additional javascript code on the webpage loaded in the tab.
function doActionReset() {
  chrome.tabs.executeScript({file: '/change-page.js'});
  window.close();
}

// Connect the buttons in the popup with the above functions.
document.querySelector('#action-css').onclick = doActionCSS;
document.querySelector('#action-reset').onclick = doActionReset

function refreshTabList(tabs) {
  var list = document.querySelector("ul#audible-tabs");
  document.body.removeChild(list);

  list = document.createElement("ul");
  list.setAttribute("id", "audible-tabs");

  for (var tab of tabs) {
    var item = document.createElement("li");
    item.textContent = `ex.${tab.id} - ${tab.url}`;
    item.onclick = function() {
      chrome.tabs.update(tab.id, {active: true});
    };

    list.appendChild(item);
  }

  document.body.appendChild(list);
}

chrome.tabs.query({audible: true}, function (tabs) {
  refreshTabList(tabs);
});
