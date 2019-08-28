export const testNetworks = {
    'bitcoin': {
        'LTC':{
            'name': 'litecoin',
            'testnet': false,
            'symbol': 'LTC',
            'pubkeys': {
                'pubkey_address_1':{
                    'label': 'First LTC wallet',
                    'address': 'pubkey_address',
                    'balance': 0.000661,
                    'USD_value' : 10,
                    'privkey' : 'encrypted',

                },
                'pubkey_address_2':{
                    'label': 'Second LTC wallet',
                    'address': 'pubkey_address',
                    'balance': 0.0004575,
                    'USD_value' : 50,
                    'privkey' : 'encrypted',
                },
            },
            'market_info': {
                'market_cap' : 1580666,
                'price' : 0.011115,
                'volume' : 8515,
                'circ_supply' : 142215728,
                'price_change_24h' : -4.14,
            },
            'total_value' : 0.6,
            'total_USD_value': 60,
        },
        'BTC':{
            'name': 'bitcoin',
            'testnet': false,
            'symbol': 'BTC',
            'pubkeys': {
                'pubkey_address_1':{
                    'label': 'First BTC wallet',
                    'address': 'pubkey_address',
                    'balance': 0.5561,
                    'USD_value' : 10,
                    'privkey' : 'encrypted',

                },
                'pubkey_address_2':{
                    'label': 'Second BTC wallet',
                    'address': 'pubkey_address',
                    'balance': 0.566778,
                    'USD_value' : 50,
                    'privkey' : 'encrypted',
                },
            },
            'market_info': {
                'market_cap' : 1580666,
                'price' : 0.011115,
                'volume' : 8515,
                'circ_supply' : 142215728,
                'price_change_24h' : -4.14,
            },
            'total_value' : 0.6,
            'total_USD_value': 60,
        }
    },
    'ethereum': {
        'ETH':{
            'name': 'ethereum',
            'testnet': false,
            'symbol': 'ETH',
            'pubkeys': {
                'pubkey_address_1':{
                    'label': 'First ETH wallet',
                    'address': 'pubkey_address',
                    'balance': 0.0000221,
                    'USD_value' : 10,
                    'privkey' : 'encrypted',

                },
                'pubkey_address_2':{
                    'label': 'Second ETH wallet',
                    'address': 'pubkey_address',
                    'balance': 0.0005099,
                    'USD_value' : 50,
                    'privkey' : 'encrypted',
                },
            },
            'market_info': {
                'market_cap' : 1580666,
                'price' : 0.011115,
                'volume' : 8515,
                'circ_supply' : 142215728,
                'price_change_24h' : -4.14,
            },
            'total_value' : 0.6,
            'total_USD_value': 60,
        },
        'TAU':{
            'name': 'Lamden TAU',
            'testnet': false,
            'symbol': 'TAU',
            'pubkeys': {
                'pubkey_address_1':{
                    'label': 'First TAU wallet',
                    'address': 'pubkey_address',
                    'balance': 5000.145242,
                    'USD_value' : 10,
                    'privkey' : 'encrypted',

                },
                'pubkey_address_2':{
                    'label': 'Second TAU wallet',
                    'address': 'pubkey_address',
                    'balance': 6334040.5454,
                    'USD_value' : 50,
                    'privkey' : 'encrypted',
                },
            },
            'market_info': {
                'market_cap' : 1580666,
                'price' : 0.011115,
                'volume' : 8515,
                'circ_supply' : 142215728,
                'price_change_24h' : -4.14,
            },
            'total_value' : 0.6,
            'total_USD_value': 60,
        },
    }
}

export const defaultSettings = {
    'currentPage' : {'name': 'CoinsMain', 'data' : {}},
    'firstRun': true,
    'themeStyle':'dark',
}
