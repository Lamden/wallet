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
3. From the file browser, choose `clove-sign-plugin/build`


##### Load the extension in Firefox
1. Open Firefox browser and navigate to about:debugging
2. Click "Load Temporary Add-on" and from the file browser, choose `clove-sign-plugin/build/manifest.json`


#### Live reload
When you want to start developing the extension and want to enable live reload use

    npm run dev

## Testing

    npm test
