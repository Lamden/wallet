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
     <!--   <h1 v-if="!token.keys"> Enter your {{token.name}} private key to activate this wallet</h1> -->
        <el-input placeholder="Please input" v-model="inputPrivKey"></el-input>
        <el-button type="info" plain @click="addPrivateKey">Submit</el-button>
      </div>

      <!-- DISPLAY Public and Private Keys in they exist  -->
      <div class="box-token-keys" v-if="token.keys">
        <h1 class="pubkey-title"> public key </h1>
        <el-input  :value="token.keys.pk" id="showPublic"></el-input>

        <!-- only show this private key if the password has been verified -->
        <div v-if="unlockedTokens.includes(token.symbol)">
          <h1 class="key-title"> private key </h1>
          <el-input
            :value="token.keys.sk"
            class="privkey-display">
          </el-input>

          <!-- Confirm deletion of the key pair from KeyStorage -->
          <div class="delete-wallet-box">
            <el-popover
              placement="top"
              width="90%"
              v-model="deletePopup">
              <h1> Delete {{token.name}} Wallet? </h1>
              <p>Your public and private keys will be erased from the wallet. If you have not backed up your private key you will lose all funds assocated with this wallet.</p>
              <p>ARE YOU SURE YOU WANT TO DELETE?</p>
              <div style="text-align: center; margin: 0">
                <el-button size="mini" type="text" @click="deletePopup = false">cancel</el-button>
                <el-button type="danger" size="mini" @click="$emit('removeToken', token.symbol)">confirm</el-button>
              </div>
              <el-button class="delete-wallet" slot="reference">Delete {{token.name}} Wallet?</el-button>
            </el-popover>
          </div>
        </div>

        <!-- Password entry to unlock displaying of private key -->
        <el-collapse v-if="!unlockedTokens.includes(token.symbol)">
          <el-collapse-item  title="show private key..." name="2">
              <div>
                <el-input 
                  placeholder="Please input password"
                  type="password"
                  v-model="password" 
                  show-password
                  @keyup.enter.native="$emit('unlockPrivate', passInfo)"></el-input>
              </div>
          </el-collapse-item>
        </el-collapse >
      </div>
    </el-collapse-item>
  </el-collapse>
</template>

<script>
export default {
  data () {
    return { 
      placeholdertext: "Input Your " + this.token.name + " Private Key",
      showPrivate: false,
      deletePopup: false,
      inputPrivKey: "",
      password: "",
      passInfo: {password: this.password,
                  token: this.token.symbol},
      privateKey: "Hello Data"
  }},
  props:['token', 'unlockedTokens', 'storage'],
  computed: {
  },
  created() {
  },
  methods: {
    addPrivateKey(){
      console.log(this.storage.addKey(this.inputPrivKey));
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
