import { typedFunction } from './typechecker';

/*
    Lamden Swaps API Server instance
    https://github.com/Lamden/clove-api

*/
const API_SERVER_INFO = {
    'host': 'http://localhost',
    'port' : '5000',
}

const API_URL = API_SERVER_INFO.host + ":" + API_SERVER_INFO.port


/*
    Wrapper for Lamden Swaps API calls
*/
export let API = typedFunction( [ String, String, String, Object ],  (method, endpoint, path, data)=>{
    data = data === {} ? undefined : data;
    path = path === "" ? undefined : path;
    const fullpath = path ? `${endpoint}/${path}` : endpoint;
    let parms = "";

    const fetch = process.browser ? window.fetch : require('node-fetch').default;

    const opts = { method, headers: {} };

	if (data && method === 'POST') {
		opts.headers['Content-Type'] = 'application/json';
		opts.body = JSON.stringify(data);
    }

	if (data && method === 'GET') {
        parms = `?${new URLSearchParams(data).toString()}`;
    } 
    console.log(`${API_URL}/${fullpath}${parms}`)
    return fetch(`${API_URL}/${fullpath}${parms}`, opts)
    .then(r => {
                if(r.status === 200) return r.text();
                throw new Error(`Status: ${r.status} Message: ${r.statusText}`)
    })
    .then(json => {
        try {
            return JSON.parse(json);
        } catch (err) {
            return json;
        }
    })
});

/*
    Check if API server is live
*/
export let checkAPI = typedFunction([], ()=>{
    return API('GET', 'status', '', {}).then(result => {return result})
});

/*
    Forms an array of coinInfo objects to send to the API to retrieve balances
*/
export let makeBalancesPost = typedFunction( [ Object ],  (CoinStore)=>{
    let postObj = {"address_list":[]};
    for (const coin of CoinStore){
        let coinInfo = {
            "network_symbol" : coin.network_symbol,
            "symbol" : coin.symbol,
            "wallet_address" : coin.vk,
        }
        if (coin.is_token) {
            coinInfo.token_address = coin.token_address;
        }
        postObj.address_list.push(coinInfo);
    }
    return postObj.address_list.length > 0 ? postObj : false;
});

/*
    Get the swap information to intially create a Lamden Swap
*/
export let getSwapInfo = typedFunction( [ String, String, String ],  (network_symbol, contract, transaction_address)=>{
    let data = {contract, transaction_address};
    let path = `${network_symbol}`;
    return API('GET', 'audit-contract', path, data)
});

/*
    Get the specifics about an ERC20 token (name, decimals, symbol, etc)
*/
export let getTokenInfo = typedFunction( [ String, String ],  (network_symbol, token_address)=>{
    let path = `${network_symbol}/${token_address}`;
    return API('GET', 'token-details', path, {})
});

/*
    Get the transaction details to approve the transfer of an ERC20 token
*/
export let getApproveTokenTxDetails = typedFunction( [ String, Number, String, String ],  (network_symbol, value, senderVk, token_address)=>{
    let data = {value};
    let path = `${network_symbol}/${senderVk}/${token_address}`;
    return  API('POST', 'approve-token', path, data)
});

/*
    Publish a signed transaction
*/
export let sendSignedTx = typedFunction( [ String, String ],  (raw_transaction, network_symbol)=>{
    let data = { raw_transaction };
    let path = `${network_symbol}`;
    return API('POST', 'publish-transaction', path, data)
});

/*
    Get the transaction details to sign a Lamden Swaps Redeem transaction
*/
export let getRedeemTxDetails = typedFunction( [ String, String, String, String ],  (network_symbol, contract,  transaction_address, secret)=>{
    let data = { contract, transaction_address, secret };
    let path = `${network_symbol}`;
    return API('POST', 'redeem-transaction', path, data)
});

/*
    Get the transaction details to sign a Lamden Swaps Refund transaction
*/
export let getRefundTxDetails = typedFunction( [ String, String, String ],  (network_symbol, contract, transaction_address)=>{
    let data = { contract, transaction_address };
    let path = `${network_symbol}`;
    return API('POST', 'refund-transaction', path, data)
});

/*
    Allows a Lamden Swap Participant to get the secret string from a transaction.
    This is called once the "Initiator" of an Lamden Swap has redeemed their tokens.
*/
export let getSecret = typedFunction( [ String, String ],  (network_symbol, contract_address)=>{
    let path = `${network_symbol}/${contract_address}`;
    return API('GET', 'secret', path, {})
});


/*
    A Promiss wrapper to check that a recently published transaction ends up on the blockchain
*/
export let waitUntilTransactionExists = typedFunction( [ String, String ],  (network_symbol, transaction)=>{
    let checkThis = new Promise(
        function (resolve, reject) {
        let checkerInterval = 5;
        let checkerTimeout = checkerInterval * 5;
        const checker = setInterval(
            (async () => {
            await checkTransaction(network_symbol, transaction)
                .then(result => {
                    if (result) {
                        clearInterval(checker);
                        resolve(true);
                    }
                })
                .catch(e => {
                    console.log(e)
                    clearInterval(checker);
                    reject(e);
                })
            }), checkerInterval * 1000);

        setTimeout(() => {
            clearInterval(checker);
            resolve(false);
        }, checkerTimeout * 1000);
    })

    return checkThis;
});


/*
    Called by waitUntilTransactionExists to check if a transaction ends up on the blockchain
*/
let checkTransaction = typedFunction( [ String, String ],  (network_symbol, transaction)=>{
    const path = `${network_symbol}/${transaction}`
    return API('GET', 'check-transaction', path, {})
        .then((result) => {
            if (result.exists) return true;
            return false;
        })
        .catch(() => {throw new Error ("Cannnot Receivine Transaction Status")});
});

