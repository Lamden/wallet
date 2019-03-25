<template>
  <el-container id="unlock-view">
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
        <h1 class="unlock-title-h1 lamden-text">Unlock Wallet</h1>
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
#unlock-view .el-header{
  padding-top: 20px;
}

#unlock-view .el-footer {
  padding: 0 20px 0 20px;
  width: 100%;
  height: 265px!important;
  text-align: center;
}

#lamden-logo-box {
  width: 150px;
  height: 150px;
  margin: 0 0 0 0;
  padding: 0 0 0 28%;
}

#unlock-view .unlock-title-h1 {
  color: gray;
}

#unlock-view .el-input {
  margin: 20px;
  width: 269px;
}

</style>
