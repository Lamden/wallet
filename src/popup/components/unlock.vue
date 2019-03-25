<template>
  <el-container id="unlock-header">
    <el-header>
      <span></span>
    </el-header>
    <el-main class="walletMain">
      <div id="lamden-logo-box">
        <lamdenLogo></lamdenLogo>   
      </div>     
    </el-main>
    <el-footer id="unlock-footer">
      <el-row>
        <h1 class="unlock-title-h1">Unlock Wallet</h1>
      </el-row>
      <el-row>
        <el-input
          v-model="password"
          class="password-input"
          type="password"
          autofocus
          size="small"
          @keyup.enter.native="unlock"
          placeholder="Enter your password"
          id="unlock-password">
        </el-input>
      </el-row>
    </el-footer>
  </el-container>
</template>

<script>
import lamdenLogo from './lamdenLogo';

export default {
  props: ['storage','lastView'],
  data() {
    return {
      logo: "/images/logo_lamden_color.svg",
      password: ''
    };
  },
  computed: {
  },
  methods: {
    unlock(){
      if (this.storage.unlock(this.password)){
        this.$emit('unlock', this.lastView);  
      }else{
         this.showMessage('Incorrect Password');
      }
    },
    showMessage(message){
      this.$message(message);
    }
  },
  components: {
    lamdenLogo
  }
};
</script>

<style>
#unlock-header .el-header{
  padding-top: 20px;
}

#unlock-footer {
  padding: 0 20px 0 20px;
  width: 100%;
  height: 100%!important;
  text-align: center;
}

#lamden-logo-box {
  width: 150px;
  height: 150px;
  margin: 0 0 0 0;
  padding: 0 0 0 30%;
}

.unlock-title-h1 {
  color: gray;
}

#unlock-password {
  margin: 20px;
  width: 269px;
}

</style>
