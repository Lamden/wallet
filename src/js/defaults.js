export const defaultCoinStore = {
    'bitcoin': {},
    'ethereum': {}
}

export const defaultSettings = {
    'currentPage' : {'name': 'CoinsMain', 'data' : {}},
    'firstRun': true,
    'themeStyle':'dark',
    'version':'v0_0_2'
}

export const coin = {
    name:'', 
    symbol: '',
    pubkeys : {},
}

export const pubkey = {
    nickname : '',
    balance: 0,
    USD_value : 0,
    vk : '',
    sk : '',
}


export const mockBalances = {
	"address_list" : [
		{ "network_symbol" : "BTC-TESTNET", "wallet_address": "mweQsmD7SZs7Kk49XoReDrXFmxyrxaE8wK", "network" : "bitcoin" },
		{ "network_symbol" : "ETH-TESTNET", "wallet_address": "0xFa29E36A7eb4dBaE9ed93D803e5Bf95ae9772A27", "network" : "bitcoin" },
		{ "network_symbol" : "ETH-TESTNET", "wallet_address": "0xFa29E36A7eb4dBaE9ed93D803e5Bf95ae9772A27", "token" : {"contract_address" : "0xb347b9f5b56b431b2cf4e1d90a5995f7519ca792", "token_symbol" : "POLY"}, "network" : "ethereum" }
	]
}