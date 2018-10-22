<template>
  <div>
    <el-form :model="signForm" >
      <p class="input-description">Unsigned transaction</p>
      <el-form-item prop="unsignedTransaction" :error="error">
        <el-input
          type="textarea"
          class="long-input"
          @change="sign"
          @input="sign"
          :autosize="{ minRows: 3 }"
          placeholder="Paste unsigned transaction"
          v-model="signForm.unsignedTransaction"
        />
      </el-form-item>
      <p class="input-description">Signed transaction</p>
      <el-form-item prop="signedTransaction">
        <el-input
          type="textarea"
          class="long-input"
          :autosize="{ minRows: 3 }"
          :readonly="true"
          placeholder="Waiting for input"
          v-model="signForm.signedTransaction"
        />
      </el-form-item>
      <div class="buttons" v-if="signForm.signedTransaction">
        <el-button
          class="action-button auto-width"
          @click="sendToWebPage">
          Send to web page
        </el-button>
        <el-button
          class="action-button auto-width"
          v-clipboard:copy="signForm.signedTransaction">
          Copy to clipboard
        </el-button>
      </div>
    </el-form>
  </div>
</template>
<script>
import sign from '../../utils/sign';
import errorMixin from '../mixins/error';

export default {
  props: ['storage'],
  mixins: [errorMixin],
  data() {
    return {
      signForm: {
        unsignedTransaction: '',
        signedTransaction: '',
      },
    };
  },
  computed: {
    isSubmitButtonDisabled() {
      return !this.signForm.unsignedTransaction;
    },
  },
  methods: {
    sign() {
      if (this.signForm.unsignedTransaction.length === 0) {
        this.resetError();
        return;
      }

      const network = localStorage.getItem('lastNetwork');
      const address = localStorage.getItem('lastAddress');

      try {
        const key = this.storage.getPrivateKey(network, address);
        this.signForm.signedTransaction = sign.signTx(
          this.signForm.unsignedTransaction,
          key,
          network,
        );
        this.resetError();
      } catch (e) {
        let errorMsg = e.message;
        if (errorMsg === 'Invalid hex string') {
          errorMsg = 'Invalid transaction';
        }
        this.setError(errorMsg);
        this.signForm.signedTransaction = '';
      }
    },
    sendSignedTxMsg(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'signedTx', signedTx: this.signForm.signedTransaction });
    },
    sendToWebPage() {
      chrome.tabs.query({ active: true, currentWindow: true }, this.sendSignedTxMsg);
    },
  },
};
</script>
<style>
.action-button {
  margin: 30px 15px 30px auto;
}

.buttons {
  display: flex;
}
</style>
