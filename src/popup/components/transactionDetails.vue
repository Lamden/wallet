<template>
  <div>
    <el-table
      :data="details"
      :show-header="false"
      :cell-style="{ padding: 0 }"
    >
      <el-table-column prop="label" class-name="label-cell" width="180"/>
      <el-table-column prop="value" />
    </el-table>
  </div>
</template>

<script>
import abi from '../../utils/abi_decoder';
import sign from '../../utils/sign';
import ethNetworks from '../../utils/ethereum_networks';

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
    };
  },
  computed: {
    details() {
      const order = Object.values(this.labels);

      const ethBased = ethNetworks.includes(this.signData.network);

      const txDetails = [
        { label: this.labels.network, value: this.signData.network },
      ];

      if (ethBased) {
        txDetails.push({ label: this.labels.userAddress, value: `0x${this.signData.address}` });
      } else {
        txDetails.push({ label: this.labels.userAddress, value: this.signData.address });
      }

      if (this.signData.rawTx) {
        if (ethBased) {
          return txDetails
            .concat(this.extractDetailsFromEth(this.signData.rawTx))
            .sort((a, b) => order.indexOf(a.label) - order.indexOf(b.label));
        }
      }
      return txDetails;
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
    getDateFromStringTimestamp(timestamp) {
      const date = new Date(parseInt(timestamp, 10) * 1000);
      return date.toISOString();
    },
  },
};
</script>

<style>
.label-cell {
  color: #a6a9ad;
}
</style>
