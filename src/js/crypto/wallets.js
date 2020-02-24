const Lamden = require('lamden-js')
const validators = require('types-validate-assert')
const { validateTypes, assertTypes } = validators;
const lamdenWallet = Lamden.wallet

/*
    Gets the Public Address of a Coin from the Private Key
    Return: Public Address (str)
*/
function pubFromPriv( network, symbol, privateKey ){
    assertTypes.isStringWithValue(network)
    assertTypes.isStringWithValue(symbol)
    assertTypes.isStringWithValue(privateKey)

	if (network === 'lamden') {
		if (validateTypes.isStringHex(privateKey) && privateKey.length === 64) return lamdenWallet.get_vk(privateKey);
        throw new Error(`Invalid ${network} privateKey`);
    }
    
    throw new Error(`${network} is not a supported network `);
};

/*
    Create a new Public/Private keypair for a network/symbol combination
    Return: Keypair Object (obj)
*/
function keysFromNew( network, symbol ){
    assertTypes.isStringWithValue(network)
    assertTypes.isStringWithValue(symbol)

	let keyPair = {};

	if (network === 'lamden'){
		keyPair = lamdenWallet.new_wallet();
		if (!keyPair) throw new Error(`Error creating lamden network wallet`);
	}

	if (!keyPair.vk || !keyPair.sk){
		throw new Error(`${network} is not a supported network`);
	}

	keyPair.network = network;
	keyPair.symbol = symbol;
	return keyPair;
};


/*
    Validates an address if valid for a specific network/symbol
    Return: Trimmed String (str)
*/
function validateAddress ( network, wallet_address ){
    assertTypes.isStringWithValue(network)
    assertTypes.isStringWithValue(wallet_address)
    
    if (network === "lamden"){
        if (validateTypes.isStringHex(wallet_address) && wallet_address.length === 64) return wallet_address;
        throw new Error(`Invalid ${network} wallet address`);
    }

    throw new Error(`${network} is not a supported network `);
};


/*
    Signed a Raw transaction for Bitcoin and Ethereum networks
    Returns: Signed Transactions (str)
*/
function signTx ( rawTransaction, privateKey, network, networkSymbol = undefined ){
    assertTypes.isStringWithValue(rawTransaction)
    assertTypes.isStringWithValue(privateKey)
    assertTypes.isStringWithValue(network)

    throw new Error(`${network} is not a supported network `);
};

module.exports = {
    pubFromPriv,
    signTx,
    validateAddress, 
    keysFromNew
}