# clove-sign-plugin

version number: 0.0.1

## Overview
Tool for signing raw transaction in bitcoin and ethereum based networks.


## Development
    git clone https://github.com/Lamden/clove-sign-plugin.git
    cd clove-sign-plugin
    npm install
    npm run build

##### Load the extension in Chrome & Opera
1. Open Chrome/Opera browser and navigate to chrome://extensions
2. Select "Developer Mode" and then click "Load unpacked extension..."
3. From the file browser, choose to `clove-sign-plugin/build/chrome` or (`clove-sign-plugin/build/opera`)


##### Load the extension in Firefox
1. Open Firefox browser and navigate to about:debugging
2. Click "Load Temporary Add-on" and from the file browser, choose `clove-sign-plugin/build/firefox/manifest.json`


#### Live reload
The following tasks can be used when you want to start developing the extension and want to enable live reload

- `npm run chrome-watch`
- `npm run opera-watch`
- `npm run firefox-watch`


## Testing

    npm test


## Packaging
Run `npm run dist` to create a zipped, production-ready extension for each browser. You can then upload that to the appstore.
