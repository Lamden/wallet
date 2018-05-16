#!/usr/bin/env python3.6

try:
    from clove.network import BITCOIN_BASED
except ImportError:
    print('clove is required to run this script. Run `pip install clove` to install it.')
    exit(1)


def network_details(network):
    name = network.symbols[0].lower()
    if network.testnet:
        name += 'Test'

    return f'''  {name}: {{
    messagePrefix: \'\',
    bech32: '',
    bip32: {{
      public: 0x0,
      private: 0x0,
    }},
    pubKeyHash: {hex(network.base58_prefixes["PUBKEY_ADDR"])},
    scriptHash: {hex(network.base58_prefixes["SCRIPT_ADDR"])},
    wif: {hex(network.base58_prefixes["SECRET_KEY"])},
  }},'''


print('module.exports = {')
for network in BITCOIN_BASED:
    print(network_details(network))
print('};')
