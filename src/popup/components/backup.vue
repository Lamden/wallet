<template>
  <el-container id="backup-restore">
    <el-main >

      <el-card shadow="always">
        <h1 class="lamden-text"> Restore Private Keys </h1>
        <div id="backup-text" class="lamden-text">
          Upload a Lamden Wallet file and provide the assocated password
        </div>
       <el-upload
          class="upload-demo item-padding"
          drag
          action=""
          :on-preview="handlePreview"
          :on-change="handleChange"
          :on-remove="handleRemove"
          :auto-upload="false"
          :file-list="fileList"
          :limit=1
          multiple>
          <i class="el-icon-upload"></i>
          <div class="el-upload__text lamden-text">Drop file here or <em>click to select</em></div>
        </el-upload>
        <el-row :gutter=10 class="password-padding">
          <el-col :span="16">
            <el-input
              v-model="password"
              size="mini"
              style="{width: 50%}"
              type="password"
              autofocus
              @keyup.enter.native="restoreKeys"
              placeholder="Enter password">
            </el-input><br>
          </el-col>
          <el-col :span="8">
            <el-button id="restore-keys-button" type="warning" size="mini" plain :disabled="restoreKeysDisabled" @click="restoreKeys">
              Restore Keys</el-button>
          </el-col>
        </el-row>
      </el-card>
      <el-card shadow="always">
        <h1 class="lamden-text"> Backup Private Keys </h1>
        <span class="lamden-text" id="backup-text">
          This file constains all of the public and private keys in your wallet and is encrypted with your wallet password.</span>
        <a class="lamden-text" :href="href" :download="download" >Download Keys</a>
      </el-card>
    </el-main>
    <el-footer>

    </el-footer>
  </el-container>
</template>

<script>
  export default {
    props: ['storage'],
    data() {
      return {
        password: "",
        file: undefined,
        fileList: []
      };
    },
    computed: {
      download: function download(){
        let currDateTime = new Date().toLocaleString();
         return "Lamden_Wallet_" + currDateTime + ".json";
      },
      href: function href(){
        let hrefStr = this.storage.backupPrivateKeys(); 
        return hrefStr;
      },
      restoreKeysDisabled: function restoreKeysDisabled() {
        return this.file && this.password !== "" ? false : true;
      }
    },
    methods: {
      showMessage(message){
        this.$message(message);
      },
      handleChange(file){
        this.file=file.raw;
      },
      handlePreview(){

      },
      handleRemove(){
        this.file = undefined;
      },
      restoreKeys(){
        if (this.password.length === 0){
           this.showMessage("password cannot be empty");
        }else{
          if (!this.file){
            this.showMessage("Plesee select a restore file");
          }
            console.log(this.file)
            const reader = new FileReader();
            reader.readAsText(this.file);
            reader.onload = e => this.storage.restorePrivateKeys(e.target.result, this.password);         
        }
      }
    },
    components: {}
  };
</script>

<style>

#backup-restore{
  padding: 40px 20px 20px 20px;
  text-align: center;
  overflow: hidden;
  overflow-y: hidden;
}

#backup-restore #backup-text{
  display: block;
}

#backup-restore #restore-keys-button{
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
}

#backup-restore .password-padding{
  margin: 10px 0 0 0;
}

#backup-restore .el-main{
  padding: 0;
}

#backup-restore .el-card{
  margin: 10px 0 0 0;
}

#backup-restore .el-input{
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
}

#backup-restore .item-padding{
  margin: 10px 0 0 0;
}

#backup-restors .el-card__body{
  display: block;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
}

#backup-restore .el-upload-dragger{
  width: 100%;
  height: 113px;
  padding: 15px;
}
#backup-restore  .el-icon-upload{
  margin: 0px 0 16px 0;
}




</style>

