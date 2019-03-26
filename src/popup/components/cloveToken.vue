<template>

  <!-- TOKEN BANNER (logo, name, balance) -->
    <el-collapse-item>
      <template slot="title"  >
        <div class="tokenBox" >
          <div class="bg" :style="{ backgroundImage: 'url(' + token.icon + ')' }"></div>
            <h1 class="tokenName" :style="token.color"> {{ token.name }}  </h1>
            <span class="background-symbol" :style="token.color">{{token.symbol}}</span>
            <span class="background-keys">{{'keys ' + countKeys}}</span>
        <!--    <p class="balances"> {{ token.balance + " " + token.symbol }}</p> -->
        </div>
      </template>

        <div v-if="hasKeys">
          <div v-for="(value, key, index) in keys" :key="index">
            <el-row :gutter="0" >
              <h3 id="token-label" class="lamden-text" >{{keys[key].label}}</h3>
            </el-row>
            <el-input type="textarea" :rows="1" size="mini" resize="none" :readonly="true" :value="key"></el-input>
            <el-input type="textarea" :rows="2" size="mini" resize="none" :readonly="true" v-model="keys[key].privateKey"
              v-if="showPrivKey"></el-input>
            <el-button @click="confirmDeleteAddress(key, keys[key])" v-if="showPrivKey" id="delete-key" class="send-button-padding" type="text" size="mini">
              Delete Wallet</el-button>
          </div>
        </div>

      <!-- ADD Private Key if none exist -->
      <div class="box-token-keys" v-if="showAddKeys">
        <div >
          <el-input 
            v-if="showAddKeys"
            size="small" 
            placeholder="Enter a label for this key" 
            v-model="privKeyLabel">
          </el-input>

          <el-input 
            v-if="showAddKeys"
            size="small" 
            type="textarea" 
            placeholder="Please input private key" 
            v-model="privKeyInput"
            @keydown.enter.native.prevent
            @keyup.enter.native.prevent="addKey">
          </el-input>
          <el-button  @click="resetAddKeys" type="text" size="small">Cancel</el-button>
          <el-button @click="handleAddKeys" type="text" size="small">Add Key</el-button>
        </div>
      </div>
 
      <div>
        <el-row>
          <el-col :span="12" id="add-keys-button">
            <el-button id="add-keys-button" @click="handleAddKeys" type="text" size="small" v-if="!showAddKeys">
              {{'Add ' + token.symbol + ' Key'}}</el-button>
          </el-col>
          <el-col :span="12"  id="show-priv-keys-button">
            <el-button type="text" size="small" @click="showPassBox = !showPassBox" v-if="!showPrivKey && !showAddKeys">
              Show Private Keys</el-button>
            <el-button type="text" size="small" @click="showPrivKey = false" v-if="showPrivKey && !showAddKeys">
              Hide Private Keys</el-button>
          </el-col>
        </el-row>
        <el-row id="password-row" v-if="showPassBox">
          <el-col :span="20">
            <div >
              <el-input
                size="mini"
                v-model="password"
                type="password"
                autofocus
                @keyup.enter.native="handlePassword"
                placeholder="Enter password to show private keys">
              </el-input>
            </div>
          </el-col>
          <el-col :span="4" class="center-align">
            <el-button icon="el-icon-check" circle plain type="success" size="mini" @click="handlePassword" :disabled="password === ''"></el-button>
          </el-col>
        </el-row>
      </div>
    </el-collapse-item>
</template>

<script>
export default {  
  props:{token: {type: Object}, 
         storage: {type: Object},
         showAddButton: {type: Boolean}
        },
  data () {
    return {
      tokenKey: "",
      privKeyInput: "",
      privKeyLabel: "",
      keys: {},
      hasKeys: false,
      showPrivKey: false,
      showPassBox: false,
      password:"",
      showAddKeys: false
  }},
  computed: {
    showManagePrivateKeys: function showAddKeysButton() {
      for (let key in this.keys){return true}
      return false;
    },
    countKeys: function countKeys(){
      let numOfKeys = Object.keys(this.keys).length;
      if (!numOfKeys) {return 0}
      return numOfKeys;
    }
  },
  created() {
   this.tokenKey = this.token.name+this.token.symbol;
   this.keys = this.storage.getPubKeyInfo(this.tokenKey);
   this.keys ? this.hasKeys = true : false;
   this.hasKeys ? this.showAddKeys = false : this.showAddKeys = true;

  },
  methods: {
    showMessage(message){
      this.$message(message);
    },
    addKey(){
      if (this.privKeyLabel === "" || this.privKeyLabel === null) {
        this.$message("Label cannot be empty");
      } else if (this.privKeyInput === "" || this.privKeyInput === null){
        this.$message("Private Key cannot be empty");
      } else {

       !this.hasKeys ? this.keys = {} : null; 

       let pubKeys;

        try{
          pubKeys = this.storage.addKey(this.tokenKey, this.privKeyInput, this.privKeyLabel);
          this.keys = pubKeys;
          this.hasKeys = true;
          this.resetAddKeys()
        }catch (e){
          this.showMessage(e.message)
          this.resetAddKeys()
        }

        //this.$emit('update:tokenKeys', tokenKeys);
      }
    },
    handlePassword(pubKey){
      if (this.password.length === 0 || !this.password){
        this.showMessage('Enter a password then hit Enter');
      }else if (!this.storage.authenticate(this.password)){
        this.showMessage('Incorrect Password');
      }else{
        try {
          for (let key in this.keys){
            this.$set(this.keys[key], 'privateKey', this.storage.getPrivateKey(this.tokenKey, key))
          }
          this.showPrivKey = true;
          this.resetPasswordBox();
        }catch (e){
          this.showMessage(e.message);
        } 
      }
    },
    confirmDeleteAddress(key, keyInfo) {
        this.$confirm('If you do not have a backup of these keys then funds could be lost. ARE YOU SURE?', 
                      'Delete ' + keyInfo.label + ' wallet?', {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          try{
            this.storage.deletePrivateKey(this.tokenKey, key);
            this.keys = this.storage.getPubKeyInfo(this.tokenKey);
            this.showPrivKey = false;
            this.resetAddKeys();
            this.$message({
              type: 'success',
              message: 'Deleted ' + this.token.name + ' \'' + keyInfo.label + '\' wallet'
            });
          }catch (e){
            this.showMessage(e.message);
          }
        }).catch(() => {
          this.$message({
            type: 'info',
            message: 'Delete canceled'
          });          
        });
    },
    handleAddKeys(){
      if (this.showAddKeys) {        
        this.addKey();
      } else {
        this.showAddKeys = true;       
      }
    },
    resetAddKeys(){
      this.privKeyInput = "";
      this.privKeyLabel = "";
      this.showAddKeys = false;
      this.showPrivKey = false;
    },
    resetPasswordBox(){
      this.showPassBox = false;
      this.password = "";
    }  
  },
  components: {
  }
};        
</script>

<style>
  .el-collapse-item__header {
    overflow: hidden;
  }

  .tokenBox {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
    margin-top: 0px;
    margin-left: 0px;
    text-align: left;
  }

  .tokenBox .bg {
    position: absolute;
    z-index: -3;
    left: -22px;
    width: 100%;
    height: 100%;
    background-size: 70px;
    background-repeat: no-repeat;
    opacity: 0.6;
    filter: alpha(opacity=20); /* For IE8 and earlier */
  }

  .tokenBox .tokenName {
    position: absolute;
    z-index: -1;
    font-size: 1.4em;
    height: 100%;
    width: 100%;
    margin-top: 2px;
    padding-left: 55px;
  }

  .tokenBox .balances {
    color: rgb(107, 107, 107);
    font-weight: bold;
    z-index: -2;
    font-size: 1.0em;
    width: 100%;
    height: 100%;
    margin: 0;
    padding-top: 15px;
    padding-right: 10px;
    text-align: right;
  }

  .el-collapse-item__content{
    padding: 0 25px 0 25px!important;
  }

  .box-token-keys{
    text-align: center;
    margin: 10px 3px 10px 3px;
    border-color: rgba(211, 66, 124, 0.5);
    border-style: solid;
    border-width: 1px;
    padding: 5px;
    border-radius: 5px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.2);
  }

  #delete-key .el-button--text{
    color: rgb(211, 66, 124);
  }

  h3#token-label {
    text-align: left;
    margin: 10px 0 0 0;
    font-size: 1.1em;
  }

  #add-keys-button{
    text-align: left;
  }

  #show-priv-keys-button{
    text-align: right;
  }

  #password-row{
    margin: 10px 0 10px 0;
  }

  .center-align{
    text-align: center;
  }

  .left-align{
    text-align: left;
  }

  .keys-box {
    text-align: center;
    overflow: hidden;
    margin: 0!important;
  }

  .key-buttons {
    text-align: center;
    margin: 0!important;
  }

  .error-text {
    color: red;
    padding: 0;
    margin: 0;
  }

  .background-symbol{
    padding: 0;
    margin: 0;
    position: absolute;
    top: 0;
    right: 43px;
    font-size: 3em;
    font-weight: bold;
    opacity: 0.1;
    transform: rotate(-45deg);
  }

  .background-keys{
    padding: 0;
    margin: 0;
    position: absolute;
    top: -0.5px;
    right: 23px;
    font-size: 1.1em;
    color: rgb(158, 158, 158);
  }
  

  .lamden-text{
    color:rgb(118, 58, 134);
  }

  .bg {
    background-image: linear-gradient(to right, red , yellow);
  }

  [debug], [debug] *:not(g):not(path) {
    color:                 hsla(210, 100%, 100%, 0.9) !important;
    background:            hsla(210, 100%,  50%, 0.5) !important;
    outline: solid 0.25rem hsla(210, 100%, 100%, 0.5) !important;

    box-shadow: none !important;
    filter:     none !important;
  }

</style>
