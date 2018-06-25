<template>
  <div>
    <el-form
      :model="signForm"
      :rules="rules"
      ref="form">
    <p class="input-description">Unsigned transaction</p>
    <el-form-item prop="unsignedTransaction">
      <el-input
        type="textarea"
        class="long-input"
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
      class="copy-button"
      v-if="signForm.signedTransaction"
      v-clipboard:copy="signForm.signedTransaction">
      Copy to clipboard
    </el-button>
  </el-form>
  </div>
</template>
<script>
import sign from '../../utils/sign';

export default {
  props: ['storage'],
  data() {
    const signTransaction = (rule, value, callback) => {
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
        callback(new Error(errorMsg));
      }

      callback();
    };

    return {
      signForm: {
        unsignedTransaction: '',
        signedTransaction: '',
      },
      rules: {
        unsignedTransaction: [
          { validator: signTransaction, trigger: 'none' },
        ],
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
      this.$refs.form.validate();
    },
  },
};
</script>
<style>
.copy-button {
  width: auto;
  display: flex;
  margin: 30px 15px 15px auto;
}
</style>
