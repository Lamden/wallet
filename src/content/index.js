document.addEventListener('signTx', (event) => {
  const signData = event.detail;
  signData.type = 'sign';
  chrome.runtime.sendMessage(signData, (response) => {
    if (response) {
      if (response.error) {
        document.dispatchEvent(new CustomEvent('signedTx', { detail: response }));
      }
    }
  });
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'signedTx') {
    document.dispatchEvent(new CustomEvent('signedTx', { detail: message }));
  }
});
