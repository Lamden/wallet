<template>
  <div>
    <h2>Confirm signing transaction</h2>
    <el-form :model="signData" >
      <p class="input-description">Unsigned transaction</p>
      <el-form-item prop="rawTx">
        <el-input
          type="textarea"
          class="long-input"
          :autosize="{ minRows: 3 }"
          :readonly="true"
          v-model="signData.rawTx"
        />
      </el-form-item>
      <el-button
        type="primary"
        class="submit-button"
        :disabled="isButtonDisabled"
        @click="confirm">
        Confirm
      </el-button>
    </el-form>
  </div>
</template>
<script>
import sign from '../../utils/sign';

export default {
  props: ['storage'],
  data() {
    return {
      signData: {
        rawTx: '',
      },
    };
  },
  created() {
    chrome.runtime.sendMessage({ type: 'popup-ready' }, (response) => {
      if (response) {
        this.signData = response.signData;
      }
    });
  },
  computed: {
    isButtonDisabled() {
      return !this.signData.rawTx;
    },
  },
  methods: {
    confirm() {
      const { network, address } = this.signData;
      let signedTx = '';
      let errorMsg = '';

      try {
        const key = this.storage.getPrivateKey(network, address);
        signedTx = sign.signTx(
          this.signData.rawTx,
          key,
          network,
        );
      } catch (e) {
        errorMsg = e.message;
        if (errorMsg === 'Invalid hex string') {
          errorMsg = 'Invalid transaction';
        }
      }

      let response;
      const type = 'signedTx';
      if (errorMsg) {
        response = { type, error: errorMsg };
      } else {
        response = { type, signedTx };
      }
      chrome.tabs.sendMessage(this.signData.tabId, response);
      window.close();
    },
  },
};
</script>
<style>
.submit-button {
  margin-top: 30px;
}
</style>
