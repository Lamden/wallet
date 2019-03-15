<template>
  <el-container>
    <el-header class="walletHeader">
      <span></span>
    </el-header>
    <el-main class="walletMain">
      <el-card class="backup-box-card">
        <h1> Backup Private Keys </h1>
        <p>This file is an encrypted copy of your keystore.</p>
        <a :href="href" :download="download" >Download Keys</a>
      </el-card>
      <el-card class="backup-box-card">
        <h1> Restore Private Keys </h1>
        <p>Upload a Lamden Wallet file and provide the assocated password</p>
        <input class="backup-choose-file" type="file" placeholder="Choose a file" @change="handleFileChange($event)"> </input>
        <el-input
          v-model="password"
          @input="resetError"
          style="{width: 50%}"
          type="password"
          autofocus
          class="backup-password-input"
          @keyup.enter.native="restoreKeys"
          placeholder="Enter password">
        </el-input>
        <el-button type="warning" plain @click="restoreKeys">Restore Keys</el-button>
        <p class="unlock-error-h1">{{error}}</p>
      </el-card>
    </el-main>
    <el-footer>

    </el-footer>
  </el-container>
</template>

<script>
  import errorMixin from '../mixins/error';

  export default {
    props: ['storage'],
    mixins: [errorMixin],
    data() {
      return {
        password: "",
        error: "",
        file: {}
      };
    },
    computed: {
      download: function download(){
        let currDateTime = new Date().toLocaleString();
        console.log(currDateTime);
         return "Lamden_Wallet_" + currDateTime + ".json";
      },
      href: function href(){
        let hrefStr = this.storage.backupPrivateKeys(); 
        console.log(hrefStr);
        return hrefStr;
      }
    },
    methods: {
      handleFileChange(evt){
        this.file = evt.target.files[0];
      },
      restoreKeys(){
        if (this.password.length > 0){
          if (!this.file){
            this.error = "Plesee select a restore file"
          }
          console.log(this.file);
        }else{
          this.error = "password cannot be empty"
        }
      },
      resetError(){
        this.error = "";
      }
    },
    components: {}
  };
</script>

<style>
.backup-password-input {
  width: 85%;
  padding: 15px;
}
.backup-box-card{
  width: 90%!important;
  height: 30%!important;
  padding: 0!important;
  margin: 10px 20px 0 20px!important;
}

.backup-choose-file {
  display: flex!important;
}

input,
label {
    margin: 0 0 0 0;
}

</style>

