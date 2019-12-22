import '../img/icon-128.png'
import '../img/icon-34.png'

chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'expand') {
        chrome.tabs.create({ url: '/app.html' });
    }
  });