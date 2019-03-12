<template>
  <el-container>
    <el-header class="walletHeader">
      <span></span>
    </el-header>
    <el-main class="walletMain">
      <div class="lamden-logo-box">
        <lamdenLogo></lamdenLogo>   
      </div>     
    </el-main>
    <el-footer class="unlock-footer">
      <el-row>
        <h1 class="unlock-waler-h1">Unlock Wallet</h1>
      </el-row>
      <el-row>
        <el-input
          v-model="unlockForm.password"
          @input="resetError"
          class="password-input"
          type="password"
          autofocus
          @keyup.enter.native="unlock"
          placeholder="Enter your password">
        </el-input>
        <p class="unlock-error-h1">{{error}}</p>

      </el-row>
    </el-footer>
  </el-container>
</template>

<script>
import errorMixin from '../mixins/error';
import lamdenLogo from './lamdenLogo';

export default {
  props: ['storage','lastView'],
  mixins: [errorMixin],
  data() {
    return {
      logo: "/images/logo_lamden_color.svg",
      unlockForm: {
        password: '',
        error: ''
      }
    };
  },
  computed: {
    isButtonDisabled: function isButtonDisabled() {
      return this.unlockForm.password.length === 0;
    },
    isKeyStoreEmpty: function isKeyStoreEmpty() {
      return Object.keys(this.storage).length ? true : false
    }
  },
  methods: {
    submit: function submit() {
      if (this.isKeyStoreEmpty) {
        console.log(this.storage.initiateKeyStore(this.unlockForm.password));
        console.log(this.storage.getActiveTokens());
        this.$emit('unlock', 'wallet');  
      }else {
        console.log("KeyStore is not empty, unlocking");
        try {
          this.storage.unlockStorage(this.unlockForm.password);
          console.log("unlocked");
          this.$emit('unlock', this.lastView);
        } catch (e) {
          console.log("errored");
          this.setError('Incorrect password');
        }
      }
    },
    unlock: function unlock(){
      try{
        this.storage.authenticate(this.unlockForm.password);
        this.$emit('unlock', 'wallet');  
      }catch (e){
         this.setError('Could not unlock storage: ' + e.message); 
      }
    }
  },
  components: {
    lamdenLogo
  }
};
</script>

<style>
.unlock {
  display: flex;
  flex-direction: column;
}

.unlock-error-h1 {
  color: rgb(255, 102, 0)!important;
}

.unlock-footer {
  padding: 0 20px 0 20px;
  width: 100%;
  height: 100%!important;
  text-align: center;
}

.lamden-logo-box {
  width: 150px;
  height: 150px;
  margin: 0 0 0 0;
  padding: 0 0 0 30%;
}

.unlock-waler-h1 {
  color: gray;
}

.password-input {
  width: 100%;
  height: 40px;
}

.password-description{
  padding-top: 80px;
}

p.small {
  line-height: 1.2;
}

</style>
