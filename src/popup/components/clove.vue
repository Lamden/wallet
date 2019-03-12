<template>
    <el-container>
      <!-- hidden select tokens dialog box -->
      <el-dialog
        title="Select Tokens"
        :visible.sync="dialogVisible"
        width="30%">
          <selectToken 
            v-for="(value, key) in tokens"
            :key="tokens[key].symbol" 
            :storage.sync="storage"
            :tokenActive.sync="tokens[key].active"
            :token="tokens[key]">
          </selectToken>
      </el-dialog>

      <!-- Clove Logo and Title -->
      <el-main class="cloveMain">     
        <img :src=img alt="clove" height="100" width="100%">
        <p class="cloveTitle"> Clove </p>
      </el-main>

      <!-- Token list, each on is a "CloveToken" component -->
      <el-footer class="cloveFooter">
        <div>
          <cloveToken
            v-for="(value, key) in tokens" 
            :key="key" 
            v-show="tokens[key].active"
            :storage="storage"
            :unlockedTokens="unlockedTokens"
            :token="tokens[key]"
            @unlockPrivate="unlockPrivate"
            @removeToken="removeToken">
          </cloveToken>  

        <!-- Button to make the Select Token Dialoge viable so the token list can be edited -->
          <div class="box-add-button">
            <h3 v-if="tokens.length == 0"> Add tokens to your Clove Wallet </h3>
            <el-button 
              class="button-add-token" 
              icon="el-icon-plus" 
              circle @click="dialogVisible = true">
            </el-button>
           <!-- <el-button  @click="removeToken('BTC')">delete </el-button> -->
          </div>
        </div>
      </el-footer>
  </el-container>
</template>

<script>
import cloveToken from './cloveToken';
import selectToken from './selectToken';
import errorMixin from '../mixins/error';

export default {
  props: ['storage'],
  mixins: [errorMixin],
  data: () => ({
        img: "/images/clove-logo.svg",
        dialogVisible: false,
        unlockedTokens: [],
        activeTokens: [],
        tokens: []
  }),
  computed: {
  },
  created() {
    this.tokens = this.storage.getAllTokens();
    console.log(this.storage.getAllTokens());
  },
  methods: {
    unlockPrivate: function unlockPrivate(passInfo) {
      try {
        this.storage.unlockStorage(passInfo.password);
        console.log("unlocked for sure");
      } catch (e) {
        console.log('Unlocking Priv Key for: ' + passInfo.token);
        !this.unlockedTokens.includes(passInfo.token) ? this.unlockedTokens.push(passInfo.token): null;
        this.setError('Incorrect password');
      }
    },
    removeToken: function removeToken(tokenToDelete) {
      console.log("hello " + tokenToDelete)
      this.tokens.forEach (function (token) {
        if (token.symbol === tokenToDelete) {
          token.active = false;
          token.keys = null;
          token.balance = 0;
        } 
      })
      
    } 
  },  
  components: {
    cloveToken,
    selectToken
  },
};
</script>

<style>
  .cloveFooter {
    overflow: scroll;
    height: 338px!important;
    padding:0px;
    overflow-x: hidden;
  }

  .button-add-token:hover {
    background-color: rgb(253, 218, 235)!important;
    
  }
  
  .cloveMain {
    color: #333;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    padding: 30px 0 0 0;
  }

  .expand {
    white-space: nowrap;
    overflow: hidden;
    padding-right: 10px;
  }
  
  .button-add-token {
    width: 40px!important;
    height: 40px!important;
    color: #C22C78!important;
    border-color: #C22C78!important;
    background-color: rgb(255, 236, 246)!important;
    margin: 0 0 0 18px;
  }

  .box-add-button {
    padding: 15px 0 0 0;
    width: 100%;
    text-align: center;
  }

  .box-add-button h3 {
    color: gray;
    margin: 0 0 0 18px;
    padding: 15px 0 20px 0;
  }

  .cloveTitle{
    font-size: 3.5em;
    padding: 0;
    margin-top: -20px;
    margin-bottom: 0;

  }

 .el-dialog {
    margin: 5% 5% 5% 5%!important;
    width:90%!important;
    height: 92%!important;
  }

  .el-dialog__body {
    padding: 5px 5px 5px 10px!important;
    flex-wrap: wrap;
    height: 410px;
    overflow: scroll;
    overflow-x: hidden;
    display: flex!important;
  }

  .el-dialog__header {
    text-align: center!important;
  }

  [debug], [debug] *:not(g):not(path) {
    color:                 hsla(210, 100%, 100%, 0.9) !important;
    background:            hsla(210, 100%,  50%, 0.5) !important;
    outline: solid 0.25rem hsla(210, 100%, 100%, 0.5) !important;

    box-shadow: none !important;
    filter:     none !important;
  }

</style>
