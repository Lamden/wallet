
const API_SERVER_INFO = {
    'host': 'http://localhost',
    'port' : '5000',
}

const API_URL = API_SERVER_INFO.host + ":" + API_SERVER_INFO.port

export function API (method, endpoint, path, data){
    data = data || undefined;
    path = path || undefined;
    const fullpath = path ? `${endpoint}/${path}` : endpoint;

    const fetch = process.browser ? window.fetch : require('node-fetch').default;

	const opts = { method, headers: {} };

	if (data) {
		opts.headers['Content-Type'] = 'application/json';
		opts.body = JSON.stringify(data);
    }

    return fetch(`${API_URL}/${fullpath}`, opts)
    .then(r => r.text())
    .then(json => {
        try {
            return JSON.parse(json);
        } catch (err) {
            return json;
        }
    });   
}

export function makeBalancesPost(CoinStore) {
    let postObj = {"address_list":[]};
    for (const [netKey, network] of Object.entries(CoinStore) ){
        if (Object.entries(network).length > 0){
            for (const [coinKey, coin] of Object.entries(network)){
                for (const [publicKey, pubKeyInfo] of Object.entries(coin.pubkeys)){
                    let coinInfo = {
                        "network_symbol" : coin.symbol,
                        "wallet_address" : publicKey,
                        "network" : netKey,
                    }
                    if (pubKeyInfo.nickname !== "") postObj.address_list.push(coinInfo);
                    if (pubKeyInfo.tokens){
                        for (const [token, tokenValue] of Object.entries(pubKeyInfo.tokens)){
                            let tokenInfo = JSON.parse(JSON.stringify(coinInfo));
                            tokenInfo.token_address = tokenValue.token_address;
                            tokenInfo.token_symbol = tokenValue.symbol;
                            postObj.address_list.push(tokenInfo);
                        }
                    }
                }
            }
        }
    }
    return postObj.address_list.length > 0 ? postObj : false;
}