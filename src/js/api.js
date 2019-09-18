
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