/* global window */
import keyStorage from '../utils/key_storage';
import ethNetworks from '../utils/ethereum_networks';
import { stripHexPrefix } from '../utils/sign';

window.keyStorage = keyStorage;

function normalizeAddress(address, networkSymbol) {
  if (ethNetworks.includes(networkSymbol)) {
    return stripHexPrefix(address).toLowerCase();
  }

  return address;
}

let signData = {};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'sign') {
    const { network, rawTx, contract } = message;
    let { address } = message;

    if (ethNetworks.includes(network)) {
      address = normalizeAddress(address, network);
    }

    try {
      window.keyStorage.getPrivateKey(network, address);
    } catch (e) {
      sendResponse({ error: e.message });
      return;
    }

    signData = {
      address,
      contract,
      network,
      rawTx,
      tabId: sender.tab.id,
    };

    window.open('popup.html#confirm', 'confirmation_popup', 'width=620,height=700,status=no,scrollbars=yes,resizable=yes');
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'popup-ready') {
    sendResponse({ signData });
  }
});
