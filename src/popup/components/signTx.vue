<template>
  <div>
    <el-form :model="signForm" >
      <p class="input-description">Unsigned transaction</p>
      <el-form-item prop="unsignedTransaction" :error="error">
        <el-input
          type="textarea"
          class="long-input"
          @change="resetError"
          @input="resetError"
          :autosize="{ minRows: 3 }"
          :readonly="signForm.signedTransaction.length > 0"
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
          readonly="true"
          placeholder="Waiting for input"
          v-model="signForm.signedTransaction"
        />
      </el-form-item>
      <el-button
        type="primary"
        class="submit-button"
        :disabled="isSubmitButtonDisabled"
        v-if="!signForm.signedTransaction"
        @click="sign">
        Sign
      </el-button>
      <el-button
        class="copy-button auto-width"
        v-if="signForm.signedTransaction"
        v-clipboard:copy="signForm.signedTransaction">
        Copy to clipboard
      </el-button>
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
      const network = localStorage.getItem('lastNetwork');
      const address = localStorage.getItem('lastAddress');

      try {
        const key = this.storage.getPrivateKey(network, address);
        this.signForm.signedTransaction = sign.signTx(
          this.signForm.unsignedTransaction,
          key,
          network,
        );
      } catch (e) {
        let errorMsg = e.message;
        if (errorMsg === 'Invalid hex string') {
          errorMsg = 'Invalid transaction';
        }
        this.setError(errorMsg);
      }
    },
  },
};
</script>
<style>
.copy-button {
  display: flex;
  margin: 30px 15px 15px auto;
}
</style>
