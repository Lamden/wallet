
const API_SERVER_INFO = {
    'host': 'http://localhost',
    'port' : '5000',
}

const API_URL = API_SERVER_INFO.host + ":" + API_SERVER_INFO.port

export function API (method, endpoint, path, data){
    data = data || undefined;
    path = path || undefined;
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
}

export function makeBalancesPost(CoinStore) {
    let postObj = {"address_list":[]};
    for (const coin of CoinStore){
        let coinInfo = {
            "network_symbol" : coin.symbol,
            "wallet_address" : coin.vk,
            "network" : coin.network,
        }
        if (coin.is_token) {
            coinInfo.token_address = coin.token_address
            coinInfo.network_symbol = coin.network_symbol;
        }
        postObj.address_list.push(coinInfo);
    }
    return postObj.address_list.length > 0 ? postObj : false;
}

export function getSwapInfo(network_symbol, contract, transaction_address){
    let data = {contract, transaction_address};
    let path = `${network_symbol}`;
    return API('GET', 'audit-contract', path, data)
}

export function getTokenInfo(network_symbol, token_address){
    let path = `${network_symbol}/${token_address}`;
    return API('GET', 'token-details', path)
}

export function getApproveTokenTxDetails(network_symbol, value, senderVk, token_address){
    let data = {value};
    let path = `${network_symbol}/${senderVk}/${token_address}`;
    return  API('POST', 'approve-token', path, data)
}

export function sendSignedTx(raw_transaction, network_symbol){
    let data = { raw_transaction };
    let path = `${network_symbol}`;
    return API('POST', 'publish-transaction', path, data)
}

export function getRedeemTxDetails(network_symbol, contract,  transaction_address, secret){
    let data = { contract, transaction_address, secret };
    let path = `${network_symbol}`;
    return API('POST', 'redeem-transaction', path, data)
}

export function getRefundTxDetails(network_symbol, contract,  transaction_address){
    let data = { contract, transaction_address };
    let path = `${network_symbol}`;
    return API('POST', 'refund-transaction', path, data)
}


//contract address for Bitcoin and transacton_address for Ethereum
export function getSecret(network_symbol, contract_address){
    let path = `${network_symbol}/${contract_address}`;
    return API('GET', 'secret', path)
}

export function waitUntilTransactionExists(network_symbol, transaction) {
    let checkThis = new Promise(
        function (resolve, reject) {
        let checkerInterval = 5;
        let checkerTimeout = checkerInterval * 5;
        const checker = setInterval(
            (async () => {
            await checkTransaction(network_symbol, transaction, () => clearInterval(checker))
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
}

function checkTransaction(network_symbol, transaction, stopChecking) {
    const path = `${network_symbol}/${transaction}`
    return API('GET', 'check-transaction', path)
        .then((result) => {
            if (result.exists) return true;
            return false;
        })
        .catch(() => {throw new Error ("Cannnot Receivine Transaction Status")});
}