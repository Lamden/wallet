const Lamden = require('lamden-js')
const Web3 = require('Web3')
const web3 = new Web3()
const validators = require('types-validate-assert')
const { validateTypes, assertTypes } = validators;
const lamdenWallet = Lamden.wallet

/*
    Gets the Public Address of a Coin from the Private Key
    Return: Public Address (str)
*/
const pubFromPriv = ( network, symbol, privateKey ) => {
    assertTypes.isStringWithValue(network)
    assertTypes.isStringWithValue(symbol)
    assertTypes.isStringWithValue(privateKey)

	if (network === 'lamden') {
		if (validateTypes.isStringHex(privateKey) && privateKey.length === 64) return lamdenWallet.get_vk(privateKey);
        throw new Error(`Invalid ${network} privateKey`);
    }

    if (network === 'ethereum') {
        try{
            return web3.eth.accounts.privateKeyToAccount(privateKey).address
        } catch (e){
            throw new Error(`Invalid ${network} privateKey`);
        }
    }
    
    throw new Error(`${network} is not a supported network `);
};

/*
    Gets the Public Address of a Coin from the Private Key
    Return: Public Address (str)
*/
const keysFromPriv = ( network, symbol, privateKey ) => {
    assertTypes.isStringWithValue(network)
    assertTypes.isStringWithValue(symbol)
    assertTypes.isStringWithValue(privateKey)

    let keyPair

	if (network === 'lamden') {
		if (validateAddress(privateKey)){
            keyPair = lamdenWallet.format_to_keys(privateKey)
        }else{
            throw new Error(`Invalid ${network} privateKey`);
        }
    }

    if (network === 'ethereum') {
        try{
            keyPair = web3.eth.accounts.privateKeyToAccount(privateKey)
        } catch (e){
            throw new Error(`Invalid ${network} privateKey`);
        }
        keyPair.vk =  keyPair.address
        keyPair.sk =  keyPair.privateKey
    }
    if (!keyPair.vk || !keyPair.sk){
		throw new Error(`${network} is not a supported network `);
    }
    
    keyPair.network = network.toLowerCase();
    keyPair.symbol = symbol.toUpperCase();
    return keyPair
};

/*
    Create a new Public/Private keypair for a network/symbol combination
    Return: Keypair Object (obj)
*/
const keysFromNew = ( network, symbol ) => {
    assertTypes.isStringWithValue(network)
    assertTypes.isStringWithValue(symbol)

	let keyPair = {};

	if (network === 'lamden'){
		keyPair = lamdenWallet.new_wallet();
		if (!keyPair) throw new Error(`Error creating ${network} network wallet`);
    }
    
    if (network === 'ethereum'){
        ethAccount = web3.eth.accounts.create()
        keyPair = {
            vk: ethAccount.address,
            sk: ethAccount.privateKey
        }
		if (!keyPair) throw new Error(`Error creating ${network} network wallet`);
	}

	if (!keyPair.vk || !keyPair.sk){
		throw new Error(`${network} is not a supported network`);
	}

	keyPair.network = network.toLowerCase();
	keyPair.symbol = symbol.toUpperCase();
	return keyPair;
};


/*
    Validates an address if valid for a specific network/symbol
    Return: Trimmed String (str)
*/
const validateAddress = ( network, wallet_address ) => {
    assertTypes.isStringWithValue(network)
    assertTypes.isStringWithValue(wallet_address)
    
    if (network === "lamden"){
        if (validateTypes.isStringHex(wallet_address) && wallet_address.length === 64) return wallet_address;
        throw new Error(`Invalid ${network} wallet address`);
    }

    if (network === 'ethereum'){
        if (web3.utils.isAddress(wallet_address)) return web3.utils.toChecksumAddress(wallet_address)
        throw new Error(`Invalid ${network} wallet address`);
    }

    throw new Error(`${network} is not a supported network `);
};


/*
    Signed a Raw transaction for Bitcoin and Ethereum networks
    Returns: Signed Transactions (str)
*/
const signTx = ( rawTransaction, privateKey, network, networkSymbol = undefined ) => {
    assertTypes.isStringWithValue(rawTransaction)
    assertTypes.isStringWithValue(privateKey)
    assertTypes.isStringWithValue(network)

    throw new Error(`${network} is not a supported network `);
};

module.exports = {
    pubFromPriv,
    signTx,
    validateAddress, 
    keysFromNew,
    keysFromPriv
}