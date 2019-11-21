const typedFunction = require('../typechecker');
const utils = require('../utils');
const lamdenWallet = require('../lamden/wallet.js');

const { vailidateString } = utils;

/*
    Gets the Public Address of a Coin from the Private Key
    Return: Public Address (str)
*/
const pubFromPriv = typedFunction( [ String, String, String ],  ( network, symbol, privateKey )=>{
  network = vailidateString(network, 'Network', true)
  symbol = vailidateString(symbol, 'Symbol', true)
  privateKey = vailidateString(privateKey, 'Private Key', true)

  let pubkey = undefined;

  if (network === 'lamden') { 
    pubkey = lamdenWallet.get_vk(privateKey);
  }
  
  if (!pubkey){
    throw new Error(`${network} is not a supported network `);
  }
  
  return pubkey;
});

/*
    Create a new Public/Private keypair for a network/symbol combination
    Return: Keypair Object (obj)
*/
const keysFromNew = typedFunction( [ String, String ],  ( network, symbol )=>{
  network = vailidateString(network, 'Network', true)
  symbol = vailidateString(symbol, 'Symbol', true)

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
});


/*
    Validates an address if valid for a specific network/symbol
    Return: Trimmed String (str)
*/
const validateAddress = typedFunction( [ String, String ],  ( network, wallet_address )=>{
  network = vailidateString(network, 'Network', true)
  wallet_address = vailidateString(wallet_address, 'Wallet Address', true)

  throw new Error(`${network} is not a supported network `);
});


/*
    Signed a Raw transaction for Bitcoin and Ethereum networks
    Returns: Signed Transactions (str)
*/
const signTx = typedFunction( [ String, String, String, String ],  ( rawTransaction, privateKey, network, networkSymbol )=>{
  privateKey = vailidateString(privateKey, 'Private Key', true)
  rawTransaction = vailidateString(rawTransaction, 'Raw Transaction', true)
  network = vailidateString(network, 'Network', true)

  throw new Error(`${network} network is not supported`);
});



module.exports = {
  pubFromPriv,
  signTx,
  validateAddress, 
  keysFromNew
}