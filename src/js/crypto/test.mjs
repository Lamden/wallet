import ethUtil from 'ethereumjs-util';
import bitcoin from 'bitcoinjs-lib';
import EthereumTx from 'ethereumjs-tx';


const btc_testnet = {
  messagePrefix: '',
  bech32: '',
  bip32: {
      public: 0x0,
      private: 0x0,
  },
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
}
const privKey = ""

const keyPair = bitcoin.ECPair.fromWIF('', btc_testnet)
const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: btc_testnet })


