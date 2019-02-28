<template>
  <el-container>
    <el-header>
      <span></span>
    </el-header>
    <el-main>        
      <img :src=logo alt="lamden" height="128" width="128" class="logo__img" id="logo__img">
    </el-main>
    <el-footer height="290px">
      <el-form
        :model="unlockForm"
        class="unlock"
        @submit.native.prevent
        status-icon>
        <el-form-item prop="password" :error="error">
            <h1 v-if="!isKeyStoreEmpty">Welcome to Lamden Wallet!</h1>
            <p v-if="!isKeyStoreEmpty" class="small">
              To begin please create a password that will allow you to access your Lamden Wallet but
              also allow us to encrypt the private keys you store here.
            </p>
            <h1 v-if="isKeyStoreEmpty">Unlock Wallet</h1>
          <el-row>
              <el-input
                v-model="unlockForm.password"
                @input="resetError"
                class="password-input"
                type="password"
                autofocus
                @keyup.enter.native="submit"
                placeholder="Enter your password">
              </el-input>
          </el-row>
        </el-form-item>
      </el-form>
    </el-footer>
  </el-container>
</template>

<script>
import errorMixin from '../mixins/error';

export default {
  props: ['storage','lastView'],
  mixins: [errorMixin],
  data() {
    return {
      logo: "/images/logo_lamden_color.svg",
      unlockForm: {
        password: '',
      },
    };
  },
  computed: {
    isButtonDisabled: function isButtonDisabled() {
      return this.unlockForm.password.length === 0;
    },
    isKeyStoreEmpty: function isKeyStoreEmpty() {
      return this.storage ? false : true
    }
  },
  methods: {
    submit: function submit() {
      try {
        this.storage.unlockStorage(this.unlockForm.password);
        this.$emit('unlock', this.lastView);
      } catch (e) {
        this.setError('Incorrect password');
      }
    },
  }
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
  padding: 10px;
}

.password-description{
  padding-top: 80px;
}

.el-col {
  border-radius: 4px;
}

p.small {
  line-height: 1.2;
}

</style>
