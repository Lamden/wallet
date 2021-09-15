# Lamden Wallet


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

# Whitelabel Configuration
- create `./whitelabel.json`
- change options in `/whitelabel.json` to enable or disable UI elements

``` javascript
{
    "companyName": "Lamden",  // Name of company to be displayed in different parts of the walelt
    "helpLinks":{
        "show": true, // Display "Help & FAQ" links
        "masterURL": false //Change this from false to a URL string to link all "Help & FAQ" links to it
    },
    "networks": [ // The default Lamden Networks that will be available in the wallet
        {
            "name": "Lamden Mainnet", 
            "hosts": ["https://masternode-01.lamden.io"],
            "type": "mainnet", 
            "lamden": true, 
            "currencySymbol": "TAU",
            "blockExplorer": "https://mainnet.lamden.io"
        },
        {
            "name": "Lamden Testnet", 
            "hosts": ["https://testnet-master-1.lamden.io"], 
            "type": "testnet", 
            "lamden": true, 
            "currencySymbol": "dTAU",
            "blockExplorer": "https://testnet.lamden.io"
        }
    ],
    "firstRun_setup":{ // Edit the words on the first run setup.
        "intro":{
            "title": "Welcome!",
            "message": "Creating a wallet is easy and secure. All accounts are encrypted locally in your browser, not on remote servers."
        },
        "create_pw": {
            "title": "Create a Password",
            "message": "default_lamden" //change this from "default_lamden" to whatever you want it to say instead.
        },
        "terms_of_service": {
            "title": "Remember",
            "message": "default_lamden" //change this from "default_lamden" to whatever you want it to say instead.
        }
    },
    "nav": {
        "showNetworkBox" : true //Show the box in the top-right which show current network and toggles between main and test nets
    },
    "menu":[ //Hide/Show and rename menu items
        {
            "heading": "Wallet",
            "show": true, //Show or Hide this box
            "items":[
                {
                    "id": "accounts", // do not edit
                    "show": true,
                    "logo": "holdings", // do not edit
                    "name": "Accounts", 
                    "page": {
                        "name": "CoinsMain" // do not edit
                    }
                },
                {
                    "id": "smart-contracts",  // do not edit
                    "show": true,
                    "logo": "ide", // do not edit
                    "name": "Smart Contracts", 
                    "page": {
                        "name": "IdeMain" // do not edit
                    }
                },
                {
                    "id": "token-swap",  // do not edit
                    "show": true,
                    "logo": "swap", // do not edit
                    "name": "Token Swap", 
                    "page": {
                        "name": "Swaps" // do not edit
                    }
                },
                {
                    "id": "devtools",  // do not edit
                    "show": true,
                    "logo": "devtools", // do not edit
                    "name": "Developer Tools", 
                    "page": {
                        "name": "DevToolsMain" // do not edit
                    }
                }
            ]
        },
        {
            "heading": "Safety & Security",
            "show": true, //Show or Hide this box
            "items":[
                {
                    "id": "backup", // do not edit
                    "show": true,
                    "logo": "backup", // do not edit
                    "name": "Backup Wallet", 
                    "page": {
                        "name": "Backup" // do not edit
                    }
                },
                {
                    "id": "restore", // do not edit
                    "show": true,
                    "logo": "restore", // do not edit
                    "name": "Restore Wallet", 
                    "page": {
                        "name": "Restore" // do not edit
                    }
                },
                {
                    "id": "lock", // do not edit
                    "show": true,
                    "logo": "signout", // do not edit
                    "name": "Sign out & Lock", 
                    "page": {
                        "name": "LockScreen" // do not edit
                    }   
                }
            ]
        },
        {
            "heading": "About & Info",
            "show": true, //Show or Hide this box
            "items":[
                {
                    "id": "about", // do not edit
                    "show": true,
                    "logo": "about", // do not edit
                    "name": "About", 
                    "page": {
                        "name": "About" // do not edit
                    }
                },
                {
                    "id": "feedback", // do not edit
                    "show": true,
                    "logo": "feedback", // do not edit
                    "name": "Give Feedback", 
                    "page": {
                        "name": "Feedback" // do not edit
                    }
                }
            ]
        }
    ],
    "mainPage": {
        "buttons":{
            "add_account":{
                "name": "ADD ACCOUNT", // rename the add accounts button
                "show": true // Show or Hide the add account button
            }
        },
        "logo": {
            "show": true // Show logo next to account
        },
        "account_info":{
            "title": "Account Name", // Rename column title
            "show" : true, // Show or Hide this column
            "show_network_name": true // Show name of the network under the account name
        },
        "amount":{
            "title": "Amount", // Rename column title
            "show" : true // Show or Hide this column
        },
        "portfolio":{
            "title": "Portfolio %", // Rename column title
            "show" : true // Show or Hide this column
        }
    },
    "accountDetails": {
        "buttons":{ // disable buttons on the Account Details page
            "send":{
                "name": "SEND TX",
                "show": true
            },
            "copy":{
                "name": "COPY ADDRESS",
                "show": true
            },
            "options":{
                "name": "OPTIONS",
                "show": true
            }
        },
        "transactions":{ 
            "pending":{  // Edit the details of the pending section on Account Details
                "title": "Pending", // Edit pending transactions title
                "show": true  // Show or Hide pending transaction details
            },
            "history":{
                "title": "Transaction History", // Edit transation history title
                "show": true, // Show or Hide transaction history
                "show_refresh": true, // Show or Hide the refresh button next to transaction history title
                "amount": 10 // The amount of transaction to initally load
            }
        }
    },
    "footer":{  // Edit the footer details
        "show": true, // Show or Hide the footer
        "text": "lamden_default" // Change this from "lamden_dafault" to display something else
    },
    "aboutPage":{ // Edit the social links on the About page.  
        "socials": [
            {   "name": "Twitter",
                "link": "https://twitter.com/lamdentau",
                "icon": "twitter"
            },
            {   "name": "Facebook",
                "link": "https://www.facebook.com/LamdenTau/?ref=py_c",
                "icon": "facebook"
            },
            {   "name": "Medium",
                "link": "https://blog.lamden.io/",
                "icon": "medium"
            },
            {   "name": "Telegram",
                "link": "https://t.me/lamdenchat",
                "icon": "telegram"
            },
            {   "name": "Reddit",
                "link": "https://www.reddit.com/r/lamden/",
                "icon": "reddit"
            },
            {   "name": "Github",
                "link": "https://github.com/Lamden/",
                "icon": "github"
            }
        ],
        "links": [  // Edit the links to show on the About page
            {
                "name":"Visit Our Website",
                "desc":"Learn All about Lamden",
                "url":"https://www.lamden.io/"
            },
            {
                "name": "Email Us",
                "desc": "What's on your mind?",
                "url": "mailto:team@lamden.io"
            }
        ]
    }
}
```

- change theme colors:
    - the theme is controlled by a series of variables in `\src\css\global.css`
    - if you load the extention into Chrome and run `npm run dev` then you can change the colors in Chrome Dev tool and they will automatically update. Then you can copy those changes to the file and save it.

- change main box background and account details box background
    - replace `/src/img/backgrounds/hero_bg.png`

- change brand logos files: 
    - `/src/img/logo_full.svg`: logo in top left of interface, should be "full brand logo" which is logo + name
    - `/src/img/logo.svg`: just logo, no words
    - `/static/logo-128.png`: a 128x128px PNG of the logo, used for display on chrome extention pages
    - `/src/img/icon-34.png`: a 34x34px PNG of the logo (favicon), displayed on broswer tabs and favorites

- change fonts:
    - repace font files in `\src\fonts`
    - change import statements at the top of `\src\css\global.css`

- edit manifest.json
``` javascript
"name": "Lamden Wallet - Browser Extension", // Name of compay
"description": "A wallet made by Lamden.io", // Description
...
 "browser_action": {
    "default_title": "Lamden Wallet", // Replace Lamden with Company Name
  }
```



