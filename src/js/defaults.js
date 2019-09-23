export const defaultCoinStore = {
    'bitcoin': {},
    'ethereum': {},
}

export const defaultSettings = {
    'currentPage' : {'name': 'CoinsMain', 'data' : {}},
    'firstRun': true,
    'themeStyle':'dark',
    'version':'v0_0_2',
    'storage' : {'used': 0, 'remaining': 5000000, 'max': 5000000},
}

export const coin = {
    name:'', 
    symbol: '',
    pubkeys : {},
}

export const pubkey = {
    nickname : '',
    active: false,
    balance: 0,
    USD_value : 0,
    vk : '',
    sk : '',
}

export const token = {
    name: '',
    nickname: '',
    symbol : '',
    token_address : '',
    decimals : 18,
    balance: 0,
    USD_value: 0,
}