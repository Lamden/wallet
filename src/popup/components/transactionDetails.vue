<template>
  <div>
    <div v-if="details.length === 1">
      <el-table
        :data="details[0]"
        :show-header="false"
        :cell-style="{ padding: 0 }"
      >
        <el-table-column prop="label" class-name="label-cell" width="180"/>
        <el-table-column prop="value" />
      </el-table>
    </div>
    <div v-else-if="details.length > 1">
      <p>Output {{ carouselIndex + 1 }} of {{ details.length }}</p>
      <el-carousel
        trigger="click"
        :height="`${carouselHeight}px`"
        @change="updateIndex"
        indicator-position="outside"
        :autoplay="false"
      >
        <el-carousel-item v-for="(item, index) in details" :key="index">
          <el-table
            :data="item"
            :show-header="false"
            :cell-style="{ padding: 0 }"
          >
            <el-table-column prop="label" class-name="label-cell" width="180"/>
            <el-table-column prop="value" />
          </el-table>
        </el-carousel-item>
      </el-carousel>
    </div>
  </div>
</template>

<script>
import bitcoin from 'bitcoinjs-lib';
import abi from '../../utils/abi_decoder';
import sign from '../../utils/sign';
import ethNetworks from '../../utils/ethereum_networks';
import btcNetworks from '../../utils/bitcoin_networks';

export default {
  props: ['signData'],
  name: 'transactionDetails',
  data() {
    return {
      labels: {
        txType: 'Transaction type',
        network: 'Network',
        userAddress: 'Your address',
        participantAddress: 'Swap participant address',
        expirationDate: 'Expiration date',
        value: 'Value (base units)',
        secret: 'Secret',
        secretHash: 'Secret hash',
        tokenAddress: 'Token address',
        recipientAddress: 'Recipient address',
        approvedFor: 'Approved for',
      },
      carouselIndex: 0,
    };
  },
  computed: {
    details() {
      const order = Object.values(this.labels);
      

      const ethBased = this.signData.network in ethNetworks;
      let txDetails = [];

      if (this.signData.rawTx) {
        if (ethBased) {
          txDetails[0] = this.extractDetailsFromEth(this.signData.rawTx);
        } else if (this.signData.network in btcNetworks) {
          txDetails = this.extractDetailsFromBtc(this.signData.rawTx);
        }
      }

      let address;

      if (ethBased) {
        address = `0x${this.signData.address}`;
      } else {
        ({ address } = this.signData);
      }

      txDetails.forEach((item) => {
        item.push({ label: this.labels.network, value: this.signData.network });
        item.push({ label: this.labels.userAddress, value: address });
        item.sort((a, b) => order.indexOf(a.label) - order.indexOf(b.label));
      });
      return txDetails;
    },
    btcNetworkObject() {
      if (this.signData.network in btcNetworks) {
        return btcNetworks[this.signData.network];
      }
      return {};
    },
    carouselHeight() {
      if (this.details.length > 0) {
        const maxLength = Math.max(...this.details.map(a => a.length));
        return (maxLength * 23) + 10;
      }
      return 0;
    },
  },
  methods: {
    extractDetailsFromEth(ethTx) {
      const txDetails = [];
      let tx;

      try {
        tx = sign.getEthereumTx(ethTx);
      } catch (e) {
        return txDetails;
      }

      const txJson = tx.toJSON();

      txDetails.push({ label: this.labels.recipientAddress, value: txJson[3] });

      let value;
      if (txJson[4] !== '0x') {
        value = parseInt(txJson[4], 16).toString();
      } else {
        value = '0';
      }

      const txData = txJson[5];
      const decodedData = abi.decodeMethod(txData);

      if (txData === '0x') {
        txDetails.push({ label: this.labels.txType, value: 'Coin transfer' });
        txDetails.push({ label: this.labels.value, value });
        return txDetails;
      }
      
      if (decodedData === undefined) {
        txDetails.push({ label: this.labels.txType, value: 'Unknown' });
        txDetails.push({ label: this.labels.value, value });
        return txDetails;
      }

      const { name } = decodedData;

      if (name === 'initiate') {
        if (decodedData.params[4].name === '_isToken' && decodedData.params[4].value) {
          txDetails.push({ label: this.labels.txType, value: 'Atomic swap token' });
          txDetails.push({ label: this.labels.tokenAddress, value: decodedData.params[3].value });
          txDetails.push({ label: this.labels.value, value: decodedData.params[5].value });
        } else {
          txDetails.push({ label: this.labels.txType, value: 'Atomic swap' });
          txDetails.push({ label: this.labels.value, value });
        }
        txDetails.push({
          label: this.labels.participantAddress,
          value: decodedData.params[2].value,
        });
        txDetails.push({
          label: this.labels.expirationDate,
          value: this.getDateFromStringTimestamp(decodedData.params[0].value),
        });
      } else if (name === 'redeem') {
        txDetails.push({ label: this.labels.txType, value: 'Redeem swap' });
        txDetails.push({ label: this.labels.secret, value: decodedData.params[0].value });
      } else if (name === 'refund') {
        txDetails.push({ label: this.labels.txType, value: 'Refund swap' });
        txDetails.push({
          label: this.labels.secretHash,
          value: decodedData.params[0].value,
        });
        txDetails.push({
          label: this.labels.participantAddress,
          value: decodedData.params[1].value,
        });
      } else if (name === 'approve') {
        txDetails.push({ label: this.labels.txType, value: 'Approve token' });
        txDetails.push({ label: this.labels.approvedFor, value: decodedData.params[0].value });
        txDetails.push({ label: this.labels.value, value: decodedData.params[1].value });
      } else {
        txDetails.push({ label: this.labels.txType, value: 'Unknown' });
        txDetails.push({ label: this.labels.value, value });
      }
      return txDetails;
    },
    extractDetailsFromBtc(btcTx) {
      const txDetails = [];
      let tx;

      try {
        tx = sign.getBitcoinTx(btcTx);
      } catch (e) {
        return txDetails;
      }
      
      if (tx.outs.length === 1 && tx.ins.length === 1) {
        const txInScript = bitcoin.script.decompile(tx.ins[0].script);
        const outputDetails = this.extractBtcSwapDataFromInputScript(txInScript);

        if (outputDetails.length > 0) {
          outputDetails.push({ label: this.labels.value, value: tx.outs[0].value.toString() });
          txDetails.push(outputDetails);
          return txDetails;
        }
      }

      tx.outs.forEach((output) => {
        const outputDetails = this.extractDataFromBtcOutput(output);
        txDetails.push(outputDetails);
      });

      return txDetails;
    },
    isValidBtcSwapContract(script) {
      return (script[0] === bitcoin.opcodes.OP_IF
            && script[1] === bitcoin.opcodes.OP_RIPEMD160
            && script[3] === bitcoin.opcodes.OP_EQUALVERIFY
            && script[4] === bitcoin.opcodes.OP_DUP
            && script[5] === bitcoin.opcodes.OP_HASH160
            && script[7] === bitcoin.opcodes.OP_ELSE
            && script[9] === bitcoin.opcodes.OP_CHECKLOCKTIMEVERIFY
            && script[10] === bitcoin.opcodes.OP_DROP
            && script[11] === bitcoin.opcodes.OP_DUP
            && script[12] === bitcoin.opcodes.OP_HASH160
            && script[14] === bitcoin.opcodes.OP_ENDIF
            && script[15] === bitcoin.opcodes.OP_EQUALVERIFY
            && script[16] === bitcoin.opcodes.OP_CHECKSIG);
    },
    isP2SHScript(script) {
      return (script[0] === bitcoin.opcodes.OP_HASH160
        && script[2] === bitcoin.opcodes.OP_EQUAL);
    },
    isP2PubKeyScript(script) {
      return (script[0] === bitcoin.opcodes.OP_DUP
        && script[1] === bitcoin.opcodes.OP_HASH160
        && script[3] === bitcoin.opcodes.OP_EQUALVERIFY
        && script[4] === bitcoin.opcodes.OP_CHECKSIG);
    },
    extractDataFromBtcSwapContract(contract) {
      const swapData = {};

      swapData.timestamp = new DataView(contract[8].buffer).getUint32(contract[8].byteOffset, true);
      swapData.secretHash = contract[2].toString('hex');
      if (this.btcNetworkObject) {
        swapData.recipientAddress = this.getBtcAddress(contract[6]);
        swapData.senderAddress = this.getBtcAddress(contract[13]);
      }

      return swapData;
    },
    extractDataFromBtcOutput(output) {
      const script = bitcoin.script.decompile(output.script);
      const outputDetails = [];

      outputDetails.push({ label: this.labels.value, value: output.value.toString() });
      
      if (this.isP2SHScript(script)) {
        let txType = 'Pay to script hash';

        if (this.signData.contract) {
          const contractBuffer = Buffer.from(this.signData.contract, 'hex');
          const contractScript = bitcoin.script.decompile(contractBuffer);

          if (
            script[1].equals(bitcoin.crypto.hash160(contractBuffer))
            && this.isValidBtcSwapContract(contractScript)
          ) {
            txType = 'Atomic swap';
            const swapData = this.extractDataFromBtcSwapContract(contractScript);
            outputDetails.push({
              label: this.labels.participantAddress,
              value: swapData.recipientAddress,
            });
            outputDetails.push({
              label: this.labels.expirationDate,
              value: this.getDateFromTimestamp(swapData.timestamp),
            });
          }
        }
        outputDetails.push({ label: this.labels.txType, value: txType });
      } else if (this.isP2PubKeyScript(script)) {
        outputDetails.push({ label: this.labels.txType, value: 'Coin transfer' });
        outputDetails.push({
          label: this.labels.recipientAddress,
          value: this.getBtcAddress(script[2]),
        });
      }
      return outputDetails;
    },
    extractBtcSwapDataFromInputScript(script) {
      const outputDetails = [];
      if (script.length === 2) {
        const contractScript = bitcoin.script.decompile(script[1]);
        if (this.isValidBtcSwapContract(contractScript)) {
          outputDetails.push({ label: this.labels.txType, value: 'Refund swap' });

          const swapData = this.extractDataFromBtcSwapContract(contractScript);
          outputDetails.push({
            label: this.labels.expirationDate,
            value: this.getDateFromTimestamp(swapData.timestamp),
          });
          outputDetails.push({ label: this.labels.secretHash, value: swapData.secretHash });
          outputDetails.push({
            label: this.labels.participantAddress,
            value: swapData.recipientAddress,
          });
          outputDetails.push({
            label: this.labels.recipientAddress,
            value: swapData.senderAddress,
          });
        }
      } else if (script.length === 3) {
        const contractScript = bitcoin.script.decompile(script[2]);
        if (this.isValidBtcSwapContract(contractScript)) {
          outputDetails.push({ label: this.labels.txType, value: 'Redeem swap' });

          const swapData = this.extractDataFromBtcSwapContract(contractScript);
          outputDetails.push({
            label: this.labels.expirationDate,
            value: this.getDateFromTimestamp(swapData.timestamp),
          });
          outputDetails.push({ label: this.labels.secretHash, value: swapData.secretHash });
          outputDetails.push({
            label: this.labels.recipientAddress,
            value: swapData.recipientAddress,
          });
        }
      }
      return outputDetails;
    },
    getBtcAddress(buffer) {
      return bitcoin.address.toBase58Check(buffer, this.btcNetworkObject.pubKeyHash);
    },
    getDateFromStringTimestamp(timestamp) {
      return this.getDateFromTimestamp(parseInt(timestamp, 10));
    },
    getDateFromTimestamp(timestamp) {
      const date = new Date(timestamp * 1000);
      const isoString = date.toISOString();
      return isoString.replace('T', ' ').replace('.000Z', ' (UTC)');
    },
    updateIndex(index) {
      this.carouselIndex = index;
    },
  },
};
</script>

<style>
.label-cell {
  color: #a6a9ad;
}
</style>
