document.addEventListener('signTx', (event) => {
  const signData = event.detail;
  signData.type = 'sign';
  chrome.runtime.sendMessage(signData, (response) => {
    if (response) {
      if (response.error) {
        window.postMessage(response, '*');
      }
    }
  });
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'signedTx') {
    window.postMessage(message, '*');
  }
});

function confirmInstalled() {
  document.dispatchEvent(new CustomEvent('signPluginInstalled'));
}

document.addEventListener('signPluginCheck', () => {
  confirmInstalled();
});
