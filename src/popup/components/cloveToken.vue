<template>
  <el-collapse >
  <!-- TOKEN BANNER (logo, name, balance) -->
    <el-collapse-item name="1">
      <template slot="title"  >
        <div class="tokenBox" >
          <div class="bg" :style="{ backgroundImage: 'url(' + token.icon + ')' }"></div>
            <h1 class="tokenName" :style="token.color"> {{ token.name }}  </h1>
        <!--    <p class="balances"> {{ token.balance + " " + token.symbol }}</p> -->
        </div>
      </template>

        <div v-if="hasKeys">
          <div v-for="(value, key) in keys" :key="key">
            <el-row :gutter="0" >
              <h3 class="lamden-text key-label" >{{keys[key].label}}</h3>
            </el-row>
              <el-input
                size="mini"
                v-model="key">
              </el-input>
              <el-input
                v-if="showPrivKey"
                size="mini"
                v-model="keys[key].privateKey">
              </el-input>
              <el-popover
                placement="top"
                width="100%"
                v-model="showPopovers[key]">
                <p>If this private key isn't backed up you could lose all funds assicated with it! Are you sure to delete this key?</p>
                <div style="text-align: right; margin: 0">
                  <el-button size="mini" type="text" @click="togglePopover(key)">cancel</el-button>
                  <el-button type="primary" size="mini" @click="handelConfirmDelete(key)">confirm</el-button>
                </div>
                <el-button slot="reference" type="text" size="small" @click="togglePopover(key)" v-if="showPrivKey">Delete Key</el-button>
            </el-popover>
          </div>
        </div>
      <!-- ADD Private Key if none exist -->
      <div class="box-token-keys">
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
        <p class="error-text">{{error}}</p>

        <el-button @click="handelAddKeys" type="info" size="mini" plain>Add Key</el-button>
        <el-button  @click="resetAddKeys" type="info" size="mini" plain v-if="showCancel">Cancel</el-button>
      </div>
 
      <div>
        <el-row :gutter="0" class="key-buttons">
          <el-button type="text" size="small" @click="showPassBox = !showPassBox" v-if="!showPrivKey && keysEmpty">Show Private Keys</el-button>
          <div v-if="showPassBox">
            <el-input
              size="mini"
              v-model="password"
              type="password"
              autofocus
              @keyup.enter.native="handlePassword(key)"
              placeholder="Enter your password to show private keys">
            </el-input>
            <p v-if="showPassBox" class="error-text">{{error}}</p>
          </div>
        </el-row>
      </div>
    </el-collapse-item>
  </el-collapse>
</template>

<script>
export default {  
  props:{token: {type: Object}, 
         storage: {type: Object}
        },
  data () {
    return {
      privKeyInput: "",
      privKeyLabel: "",
      error: "",
      keys: {},
      hasKeys: false,
      showPrivKey: false,
      showPassBox: false,
      password:"",
      confirmPopover: true,
      popovers: [],
      showAddKeys: false,
      showCancel: false,
      showPopovers: {}
  }},
  computed: {
  },
  created() {
   this.tokenKey = this.token.name+this.token.symbol;
   console.log(this.tokenKey);
   this.keys = this.storage.getPubKeyInfo(this.tokenKey);
   console.log(this.keys)
   this.keys ? this.hasKeys = true : false;
   this.hasKeys ? this.showAddKeys = false : this.showAddKeys = true;

  },
  methods: {
    addKey(){
      this.error = "";
      if (this.privKeyLabel === "") {
        this.error = "error: label name cannot be empty";
      }else{
        /*
        let tokenKey = this.token.name + this.token.symbol
        console.log(tokenKey)
        console.log(this.token.symbol)
        console.log(this.privKeyInput)
        console.log(this.privKeyLabel)
        this.error = this.storage.addKey(tokenKey, this.token.symbol, this.privKeyInput, this.privKeyLabel);
        */
       !this.hasKeys ? this.keys = {} : null; 
       let pubKey = this.storage.addKeyTest();
       this.$set(this.keys, pubKey+this.privKeyLabel, {privateKey:null, label:this.privKeyLabel, balance:0});
       this.$set(this.showPopovers, pubKey, false);

       this.hasKeys = true;
       this.resetAddKeys()

       //this.$emit('update:tokenKeys', tokenKeys);
      }
    },
    handlePassword(pubKey){
      this.error = "";
      try {
        for (let key in this.keys){
          this.keys[key].privateKey = this.storage.getTokenPrivKeyTest(this.password, null);
        }
        this.showPrivKey = true;
        this.resetPasswordBox();
      }catch (e){
        this.error = e.message;
      }
    },
    handelConfirmDelete(pubKey) {
      try {
        this.storage.deletePrivateKey(this.tokenKey, pubKey);
        this.confirmPopover = false;
        this.showPrivKey = false;
        this.resetAddKeys();
        this.$delete(this.keys, pubKey);
        this.$delete(this.showPopovers, pubKey);
        this.hasKeys = !this.keysEmpty();
      }catch (e) {
        console.log(e.message);
      }
    },
    handelAddKeys(){
      if (this.showAddKeys) {
        this.addKey();
      } else {
        this.showAddKeys = true;
        this.showCancel = true;
      }
    },
    keysEmpty(){
      for (let x in this.keys) {return true} 
      return false;
    },
    resetAddKeys(){
      this.privKeyInput = "";
      this.privKeyLabel = "";
      this.showAddKeys = false;
      this.showCancel = false;
    },
    resetPasswordBox(){
      this.showPassBox = false;
      this.password = "";
    },
    togglePopover(pubKey){
      this.$set(this.showPopovers, pubKey, !this.showPopovers[pubKey]); 
    }    
  },
  computed: {
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

  .key-label {
    text-align: center;
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
  

  .lamden-text{
    color:rgb(89,45,101);
    margin:0!important;
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
