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
      
      <!-- ADD Private Key if none exist -->
      <div class="box-token-keys" v-if="!token.keys">
        <el-input 
          size="small" 
          placeholder="Enter a name for this wallet" 
          v-model="privKeyLabel">
      </el-input>
        <el-input 
        size="small" 
        type="textarea" 
        placeholder="Please input private key" 
        v-model="privKeyInput"
        @keyup.enter.native="addKey">
      </el-input>
        
        {{"public key: " + token.keys}}
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
  }},
  computed: {
  },
  created() {
  },
  methods: {
    addKey(){
      let tokenKey = this.token.name + this.token.symbol
      console.log(tokenKey)
      console.log(this.token.symbol)
      console.log(this.privKeyInput)
      console.log(this.privKeyLabel)
      console.log(this.storage.addKey(tokenKey, this.token.symbol, this.privKeyInput, this.privKeyLabel));
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

  .box-token-keys {
    margin: 5px 10px 5px 10px;
    text-align: left;
  }

  .privkey-button {
    border-radius: 12px 0 0 12px!important;
    margin: 0 -1px 0 0!important;
    width: 100%!important;
  }

  .key-title {
    margin: 3px;
    text-align:left!important;
  }

  .privkey-display {
    border-radius: 0 12px 12px 0!important; 
  }

  .delete-wallet-box {
    text-align: center;
  }

  .delete-wallet {
    color: red!important;
    width: 50%!important;
  }

  .deleteWallet:Hover {
    color: rgb(255, 255, 255)!important;
    background-color: rgb(248, 0, 0)!important;
    width: 50%!important;
  }

  [debug], [debug] *:not(g):not(path) {
    color:                 hsla(210, 100%, 100%, 0.9) !important;
    background:            hsla(210, 100%,  50%, 0.5) !important;
    outline: solid 0.25rem hsla(210, 100%, 100%, 0.5) !important;

    box-shadow: none !important;
    filter:     none !important;
  }

</style>
