# Lamden Wallet
version: 0.9.22 rc1

## Install

### Clone Github Repo
```
git clone https://github.com/Lamden/wallet.git
cd wallet
```
### Install package dependancies
```
sudo npm install
```
### build plugin
```
npm run build
```
### Load the extension in Chrome & Opera
1. Open Chrome/Opera browser and navigate to chrome://extensions
2. Select "Developer Mode" and then click "Load unpacked extension..."
3. From the file browser, choose `wallet/build`

### Load the extension in Firefox
1. Open Firefox browser and navigate to about:debugging
2. Click "Load Temporary Add-on" and from the file browser, choose `wallet/build/manifest.json`

### Load the extension in Brave
1. Open Brave broswer and navigate to brave://extensions/
2. Turn on developer mode from the top right-hand corner
3. Click "Load Unpacked Extention"
4. Select the build directory unzipped from the zip file.

## Testing
### Live reload
When you want to start developing the extension and want to enable live reload use
```
npm run dev
```
