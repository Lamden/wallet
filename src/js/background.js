import '../img/icon-128.png'
import '../img/icon-34.png'

chrome.runtime.onMessage.addListener((message) => {
    console.log(message)
    if (message.type === 'expand') {
        chrome.tabs.create({ url: '/popup.html' });
    }
  });

  chrome.runtime.onConnect.addListener(function (externalPort) {
    externalPort.onDisconnect.addListener(function () {
      console.log("onDisconnect")
      alert ("onDisconnect")
    })
  
    console.log("onConnect")
    alert ("onConnect")
  })