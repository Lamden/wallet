<template>
  <el-form
    :model="unlockForm"
    :rules="rules"
    class="unlock"
    ref="form"
    status-icon>
    <p class="input-description password-description">Security password</p>
    <el-form-item prop="password">
      <el-input
        v-model="unlockForm.password"
        class="short-input"
        type="password"
        placeholder="Enter your password">
      </el-input>
      <el-button
        type="primary"
        :disabled="isButtonDisabled"
        @click="submit">
        Unlock
      </el-button>
    </el-form-item>
  </el-form>
</template>
<script>
export default {
  props: ['storage'],
  data() {
    const validatePassword = (rule, value, callback) => {
      const unlocked = this.unlock();
      if (unlocked) {
        callback();
      } else {
        callback(new Error('Incorrect password'));
      }
    };

    return {
      unlockForm: {
        password: '',
      },
      rules: {
        password: [
          { validator: validatePassword, trigger: 'none' },
        ],
      },
    };
  },
  computed: {
    isButtonDisabled: function isButtonDisabled() {
      return this.unlockForm.password.length === 0;
    },
  },
  methods: {
    unlock: function unlock() {
      try {
        this.storage.unlockStorage(this.unlockForm.password);
        return true;
      } catch (e) {
        return false;
      }
    },
    submit: function submit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.$emit('unlocked');
        }
        return false;
      });
    },
  },
};
</script>
<style>
.unlock {
  display: flex;
  flex-direction: column;
}

.password-description{
  padding-top: 80px;
}
</style>
