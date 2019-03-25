# Lamden Wallet

version number: 0.1.0

## Overview
Official Lamden wallet for the unique Lamden blockchain. Also features signing tools for the Lamden swaps. This wallet will be an 'all-in-one' plugin for Lamden dapp interaction and basic wallet functionality.

## Development
    git clone https://github.com/Lamden/wallet.git
    cd wallet
    npm install
    npm run build

##### Load the extension in Chrome & Opera
1. Open Chrome/Opera browser and navigate to chrome://extensions
2. Select "Developer Mode" and then click "Load unpacked extension..."
3. From the file browser, choose `wallet/build`


##### Load the extension in Firefox
1. Open Firefox browser and navigate to about:debugging
2. Click "Load Temporary Add-on" and from the file browser, choose `wallet/build/manifest.json`


#### Live reload
When you want to start developing the extension and want to enable live reload use

    npm run dev

## Testing

    npm test


## Communication
There is a possibility of communicating with the plugin using custom events.

### Check presence
To check if the plugin is installed dispatch an `signPluginCheck` event.

    document.dispatchEvent(new CustomEvent('signPluginCheck'));

The plugin will respond with `signPluginInstalled` event.

### Signing transaction
To sign transaction dispatch an `signTx` event with `network`, `address` and `rawTx`.

    document.dispatchEvent(new CustomEvent('signTx', {
      detail: {
          network: 'ETH',
          address: '999F348959E611F1E9eab2927c21E88E48e6Ef45',
          rawTx: '0xf86b8201...00000000000000000de0b6b3a7640000808080',
      },
    }));

The plugin will respond with `signedTx` event. If the signing is successful the signed transaction will be returned in
`event.data.signedTx`. If it fails there will be an error message in `event.data.error`.

    document.addEventListener('message', (event) => {
      if (event.source === window && event.data && event.data.type === 'signedTx') {
          if (event.data.signedTx) {
            // process the signed transaction
          } else if (event.data.error) {
            // process the error
          }
      }
    }

