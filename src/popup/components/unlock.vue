<template>
  <el-form
    :model="unlockForm"
    class="unlock"
    @submit.native.prevent
    status-icon>
    <el-form-item prop="password" :error="error">
      <p class="input-description password-description">Password</p>
      <el-input
        v-model="unlockForm.password"
        @input="resetError"
        class="password-input"
        type="password"
        autofocus
        @keyup.enter.native="submit"
        placeholder="Enter your password">
      </el-input>
      <el-button
        type="primary"
        :disabled="isButtonDisabled"
        @click="submit">
        Login
      </el-button>
    </el-form-item>
  </el-form>
</template>
<script>
import errorMixin from '../mixins/error';

export default {
  props: ['storage'],
  mixins: [errorMixin],
  data() {
    return {
      unlockForm: {
        password: '',
      },
    };
  },
  computed: {
    isButtonDisabled: function isButtonDisabled() {
      return this.unlockForm.password.length === 0;
    },
  },
  methods: {
    submit: function submit() {
      try {
        this.storage.unlockStorage(this.unlockForm.password);
        this.$emit('wallet');
      } catch (e) {
        this.setError('Incorrect password');
      }
    },
  },
};
</script>
<style>
.unlock {
  display: flex;
  flex-direction: column;
}

.password-input {
  width: 100%;
  height: 40px;
}

.password-description{
  padding-top: 80px;
}
</style>
