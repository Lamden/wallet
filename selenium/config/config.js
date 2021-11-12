/*
Test setup instructions:

The Ethereum tests require MetaMask to be launched to carry out transactions on the Ethereum network
To setup these test first visit the metamask.io and install the plugin, then setup a walllet.
This test will use the local install of the metamask plugin from your chrome installation for 

Once installed validate that your chome installation has installed the metamask pluging into the directory specified in the "getMetaMaskLocation" function
Then validate metamask version's folder is correct as per the config item below

Seed Phrase:
The seed phrase will restore wallet which will be used to swap test dTAU from.  

This ETH wallet 0x00eB12f5C96B15001bf8f32bEEd970d178719AcC needs to be funded with KOVAN dTAU before testing is run (the test swaps 10 dTAU).

These TAU Wallets needs funding:
    - 2341d744f11658d7f1ca1c514a1b76ff07898435c46402b1e4f8b00d4a13f5f9 
    - 6a91a9a65eb80829a360efc0555cad8841af64c78375bbf394f6ecb89d5644ee
    - 960c002a36c30c3aec8bc670e9b8b40eebcfd545f4e9237579fd7395a21ccebb

These smart contract needs to exist
    - con_wallet_testing
    - con_wallet_testing_2

Code for contracts:
yourState = Hash(default_value='')

@export
def set_value(key_name: str, key_value: str):
    yourState[key_name] = key_value

@export
def set_value_for_sender(key_value: str):
    sender = ctx.caller
    yourState[sender] = key_value

*/

const process = require('process');
var path = require('path');
const chromeConfig = require('./chrome_config.json');

const config = {
    workingDir: process.cwd(),
    walletBuildDir: "build", 
    get walletPath() {
        return path.join(this.workingDir, this.walletBuildDir)
    },
    walletExtentionID: chromeConfig.walletExtentionID,
    port: 5656,
    testnetMasternode: "https://testnet-master-1.lamden.io:443",
    testnetBlockService: "http://165.227.181.34:3535"
}
module.exports = config
