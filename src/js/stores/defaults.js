export const coin = {
    name:'', 
    symbol: '',
    pubkeys : {},
    txList : [],
}

export const pubkey = {
    nickname : '',
    active: false,
    balance: 0,
    vk : '',
    sk : '',
}

export const obscure = 'n1ahcKc0lb';

export const supportedCoins = {
    lamden: [
        {name: 'Lamden', symbol: 'TAU', contract: 'currency'},
        //{name: 'Stu Bucks', symbol: 'STU', contract: 'stubucks'},
    ]
}

export const defaultFileCode = [
    '###',
    '#  This is a simple smart contract',
    '#  All Lamden smart contracts are programmed in Python',
    '#  For complete contracting documentation please visit https://contracting.lamden.io/',
    '###',
    '',
    '\'\'\'Create a global variable that will store key/value pairs on the blockchain\'\'\'',
    'yourState = Hash(default_value=\'\')',
    '',
    '\'\'\'Define smart contract methods to alter state\'\'\'',
    '#Allow anyone to set the value of a key',
    '@export',
    'def set_value(key_name, key_value):',
    '    #create a key in your state that contains whatever value was passed',
    '    yourState[key_name] = key_value',
    '',
    '#Allow only the sender of the transaction to set the value of a key',
    '@export',
    'def set_value_for_sender(key_value):',
    '    #ctx.caller is a global variable and is the public key of the person who sent the transaction',
    '    sender = ctx.caller',
    '    yourState[sender] = key_value',
    '',
    '\'\'\' Current state can be read from the masternode API \'\'\'',
    '# example to get the value of \'stu\' in the \'yourState\' state variable from \'example\' contract:',
    '# https://testnet.lamden.io:443/contracts/example/yourState?key=stu',
].join('\n')

export function makeContractHeader(networkName) {
    return [
        '#############################################################',
        `#  Contract Is On ${networkName}`,
        '#############################################################'
    ].join('\n')
}