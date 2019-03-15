<template>
    <el-container>
      <el-header>
        <el-switch 
          v-model="togTestNet" 
          @change='swapNet' 
          active-text="TestNet"
          active-color="#E0E0E0"
          inactive-text="MainNet"
          inactive-color="#990099">
        </el-switch>
      </el-header>
      <el-main class="walletMain">
        <div class="lamden-logo-box">
          <lamdenLogo v-if="!togTestNet"></lamdenLogo>
          <lamdenLogoDark v-if="togTestNet"></lamdenLogoDark> 
        </div>
        <div class="balance-box">
          <span :key="forceRefreshKeys.balance">{{networkKeys[network][currentKey].balance + ' ' + symbols[network]}}</span>
          
        </div>
        <br class="newline">
        <el-dropdown @command="handleCommand" trigger="click">
          <span class="el-dropdown-link">
            {{networkKeys[network][currentKey].label}}<i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item 
              v-for="(value, key, index) in networkKeys[network]" 
              :key="index" 
              :command="key">
              {{networkKeys[network][key].label}}
            </el-dropdown-item>
            </el-dropdown-menu>
            <el-button @click="showMessage('Copied!')" v-if="togTestNet" v-clipboard:copy="currentKey" size="mini" icon="el-icon-document" circle title="copy wallet address"></el-button>
            <el-button  :disabled="disableRefreshBalance" @click="refreshBalance" size="mini" icon="el-icon-refresh" circle title="refresh balance"></el-button>
        </el-dropdown>
      </el-main>

      
      <el-footer class="walletFooter">
        <el-tabs v-model="activeName" @tab-click="handleTabs">


<!--  TRANSACTIONS PANE  ------------------------------------------>
          <el-tab-pane label="Transactions" name="Transactions" :key="forceRefreshKeys.balance">
          <div class="block">
              <el-timeline>
                  <el-timeline-item
                  v-for="(activity, index) in formattedTransactions"
                  :key="index"
                  :icon="activity.icon"
                  :color="activity.color"
                  :size="activity.size"
                  :timestamp="activity.timestamp">
                  <div :style="{'text-align':'left'}">
                    {{activity.sent}}<br>
                    {{"txHash: "}} <el-button class="el-timeline-hash-button" type="text" size="small">{{activity.content}}</el-button>
                  </div>
                  </el-timeline-item>
            </el-timeline>
          </div>
          <el-button class="del-transactions-floating-button" type="danger" icon="el-icon-delete" circle plain 
                     @click="deleteTransactions" title="delete transaction history">
          </el-button>   
        </el-tab-pane>


<!--  SEND TRANSACTION PANE  ------------------------------------------>
          <el-tab-pane label="Send" name="Send">
            <div class="send-box">
              <h1 class="send-title">Send Dark TAU</h1>
              <el-input type="textarea" :rows="2" placeholder="Enter recipient's wallet address" size="mini" resize="none" 
                        v-model="sections['send'].txDestination"></el-input>
              <el-row>
                <el-col :span=12>
                  <h3>Amount ({{symbols[network]}})</h3>
                </el-col>
                <el-col :span=12>
                  <h3>Stamps</h3>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span=12>
                  <el-input-number label="Amount" v-model="sections['send'].txAmount" :min="0" size="mini"
                  :controls="false"></el-input-number>
                </el-col>
                <el-col :span=12>
                  <el-input-number disabled label="Stamps" v-model="sections['send'].txStamps"  :min="0" size="mini" :controls="false"
                    title="Stamps are locked at 3000 in Test Net">
                  </el-input-number>
                </el-col>
              </el-row>
              <el-button class="send-transactions-floating-button" type="success" icon="el-icon-d-arrow-right" circle plain
                @click="sendTransaction" v-if="showSendButton" title="send transaction"></el-button>
            </div>
          </el-tab-pane>

<!--  EDIT ADDRESS PANE  ------------------------------------------>
          <el-tab-pane label="Edit" name="Edit">
            <div  class="send-box">
              <el-row :gutter=6>
                <el-col :span=4>
                  <h3 class="label-beside-input">Label</h3>
                </el-col>
                <el-col :span=16>
                  <el-input size="mini" resize="none" v-model="sections['edit'].labelText">
                  </el-input>
                </el-col>
              </el-row>
              <el-row :style="{'text-align': 'right'}">
                <el-checkbox :disabled="networkKeys[network][currentKey].uiDefault" v-model="sections['edit'].defaultChecked">
                  Default Address</el-checkbox>
              </el-row>
              <el-input type="textarea" :rows="3" size="mini" resize="none" :readonly="true" v-model="displayPublicKey">
              </el-input>
              <el-input v-if="this.sections['edit'].showPrivKey" type="textarea" :rows="3" size="mini" resize="none" :readonly="true"
                v-model="networkKeys[network][currentKey].privateKey">
              </el-input>
              <div v-if="this.sections['edit'].showPrivKey === false">
                  <el-input size="mini" v-model="sections['edit'].password" type="password" autofocus @keyup.enter.native="showPrivateKey"
                    placeholder="Enter your password to show private key">
                  </el-input>
                  <p v-if="this.sections['edit'].showPrivKey === false" class="error-text">{{sections['edit'].error}}</p>
                </div>
                <el-button @click="saveEdit" class="send-button-padding" type="success" plain size="mini">
                  Save Info</el-button>
                <el-button class="del-transactions-floating-button" type="danger" icon="el-icon-delete" circle plain 
                           v-if="this.sections['edit'].showPrivKey" @click="confirmDeleteAddress" title="delete address from wallet"></el-button>
              </div>
            </el-tab-pane>

 <!--  ADD ADDRESS PANE  ------------------------------------------>
            <el-tab-pane label="Add" name="Add">
              <div class="send-box">
                <div v-if="displayAddMainSection">
                  <el-button class="add-button-padding" @click="sections['add'].newWallet = true" type="success" plain size="mini">
                    Generate New Wallet</el-button>
                  <br>
                  <el-button class="add-button-padding" @click="sections['add'].fromPrivate  = true" type="success" plain size="mini">
                    Add from Private Key</el-button>
                </div>
                
                <div v-if="sections['add'].newWallet">
                  <el-row :gutter=6>
                    <el-col :span=6>
                      <h3 class="label-beside-input">Create Wallet Label</h3>
                    </el-col>
                    <el-col :span=16>
                      <el-input size="mini" resize="none" v-model="sections['add'].newlabel">
                      </el-input>
                    </el-col>
                  </el-row>
                  <el-button :disabled="addWalletLabelEmpty" class="add-button-padding" @click="generateNewWallet" type="success" plain size="mini">
                    Generate New Wallet</el-button>
                  <el-button @click="sections['add'].newWallet = false" class="send-button-padding" type="info" plain size="mini">
                    Cancel</el-button>
                </div>

                <div v-if="sections['add'].fromPrivate">
                  <el-row :gutter=6>
                    <el-col :span=6>
                      <h3 class="label-beside-input">Wallet Label</h3>
                    </el-col>
                    <el-col :span=16>
                      <el-input  size="mini" resize="none" v-model="sections['add'].newlabel">
                      </el-input>
                    </el-col>
                  </el-row>
                  <h3 class="section-text">Enter PRIVATE Key</h3>
                  <el-input type="textarea" :rows="2" size="mini" resize="none" v-model="sections['add'].privateKey">
                  </el-input>
                  <el-button class="add-button-padding" @click="newWalletFromPrivateKey" type="success" plain size="mini">
                    Add Address</el-button>
                  <el-button @click="sections['add'].fromPrivate  = false" class="send-button-padding" type="info" plain size="mini">
                    Cancel</el-button>
                </div>
              </div>
            </el-tab-pane>
        </el-tabs>
      </el-footer>
  </el-container>
</template>

<script>
import lamdenLogo from './lamdenLogo';
import lamdenLogoDark from './lamdenLogoDark';
const tauWallet = require('./wallet');

export default {
  props: ['storage'],
  data: () => ({
    network: "DarkTauDTAU",
    symbols: {"DarkTauDTAU": "dTau", "LamdenMainNet" : "Tau"},
    precision: 0,
    currentKey: "",
    togTestNet: true,
    showOverflowTooltip: true,
    keysDropdown: {},
    networkKeys: {},
    transactions: [],
    pendingTransactions: [],
    checkingTransactions: [],
    disableRefreshBalance: false,
    showSendButton: true,
    forceRefreshKeys: {balance: 0, transactions: 0},
    activeName:"Transactions",
    sections: {'transactions': {visible: true},
              'send': {visible: false, txDestination: "", txAmount: 0, txStamps: 3000},
              'edit': {visible: false, password: "", showPrivKey: false, labelText: "", error:"", defaultChecked: false},
              'add': {visible: false, publickKey: "", privateKey:"", newlabel: "", fromPrivate: false , newWallet: false}}
  }),
  computed: {
    displayPublicKey: function displayPublicKey(){
      return 'Public Wallet Address: ' + this.currentKey;
    },
    deleteButtonVisbile: function deleteButtonVisbile(){
      if (this.sections['edit'].showPrivKey) {return true}
      return false;
    },
    displayAddMainSection: function displayAddMainSection(){
      if (this.sections['add'].newWallet || this.sections['add'].fromPrivate) {return false}
      return true;
    },
    addWalletLabelEmpty: function labelNotEmpty(){
      if (this.sections['add'].newlabel.length === 0) {return true}
      return false;
    },
    showDeleteTransactionsButton: function showDeleteTransactionsButton(){
      if (!this.transactions) {return false}
      if (this.transactions.length === 0) {return false}
      return true;
    },
    formattedTransactions: function formattedTransactions(){
      let trans = [];
      for (let transaction in this.transactions){
          let t = {}
        t.timestamp = this.transactions[transaction].date + ' ' + this.transactions[transaction].time ;
        t.size="large"
        t.color = 'orange';
        t.icon = 'el-icon-more';
        t.sent = 'Amount: '
        let status = this.transactions[transaction].status;
        if (status.includes('SUCC')){
              t.color = 'green'
              t.icon = 'el-icon-check'
              t.sent = "Sent: "
        }
        if (status.includes('FAIL')){
              t.color = 'red'
              t.icon = 'el-icon-close'
              t.sent = "Failed: "
        }
        t.content = this.formatAddress(this.transactions[transaction].txHash, 30);
        t.sent = t.sent + this.transactions[transaction].amount + ' ' +  this.symbols[this.network];
        trans.push(t);
      }
      return trans;
    }
  },
  created() {
    this.networkKeys[this.network] = this.storage.getPubKeyInfo('DarkTauDTAU');

    for (let key in this.networkKeys[this.network]){
      this.networkKeys[this.network][key].uiDefault ? this.currentKey = key : null;
    }
    this.refreshBalance();
    
    try {
      this.transactions = this.storage.getTransactions(this.network, this.currentKey);
    } catch (e){
      console.log(e.message);
    }
    this.determinePendingTransactions(this.currentKey);
  },
  methods: {
    handleTabs(tab, event){
      tab.label !== "Add" ? this.cancelAddSection() : null;
      tab.label === 'Send' ? this.showSendButton = true : this.resetSend();
  
      if (tab.label === 'Edit'){
        this.sections['edit'].defaultChecked = this.networkKeys[this.network][this.currentKey].uiDefault;
        this.sections['edit'].labelText = this.networkKeys[this.network][this.currentKey].label;
        this.sections['edit'].showPrivKey = false;
      }else {
        this.resetEdit();
      }
    },
    swapNet() {
      let newNetwork = "";
      this.network === 'LamdenMainNet' ? newNetwork = 'DarkTauDTAU' :  newNetwork = 'LamdenMainNet';
      let pubInfo = this.storage.getPubKeyInfo(newNetwork);
         
      for (let key in pubInfo){
        pubInfo[key].uiDefault ? this.currentKey = key : null;
      }

      this.resetSend();
      this.resetEdit();
      this.cancelAddSection();

      this.showTransactions();
      this.$set(this.networkKeys, newNetwork, pubInfo);
      this.network = newNetwork;
      this.refreshBalance()
      this.precision = 0;

      if (newNetwork === 'LamdenMainNet'){
        this.precision = 8;
        this.$notify({
          title: 'Main Net Unavailable',
          message: 'Comming Soon!'})
      }
    },
    refreshNetworkKeys(){
      //Get lastest Public Key Info from localStorage
      let pubInfo = this.storage.getPubKeyInfo(this.network);
      //Set the new storage object into reactivity layer
      this.$set(this.networkKeys, this.network, pubInfo);
    },
    refreshBalance(){
      this.disableRefreshBalance = true;
      const tauWallet = this.storage.getTauWallet();

      tauWallet.get_balance(this.currentKey)
        .then((result) => {
          let walletBalance = result.value !== 'null' ? parseFloat(result.value) : 0;
          this.$set(this.networkKeys[this.network][this.currentKey], 'balance', walletBalance);
          this.disableRefreshBalance = false;
          this.forceRefreshKeys.balance += 1;
        })
        .catch((e) => {
          this.showMessage(e);
        });
    },
    handleCommand(choice) {
        this.currentKey = choice;
        this.showTransactions();
        this.refreshBalance();
    },
    showSection(swapTo){
      for (let section in this.sections){
        section === swapTo ? this.sections[section].visible = true : this.sections[section].visible = false;
      }
      if (swapTo === 'edit'){
    //    this.$set(this.sections['edit'], defaultChecked, this.networkKeys[this.network][this.currentKey].uiDefault);
     //   this.$set(this.sections['edit'], labelText, this.networkKeys[this.network][this.currentKey].label);
        this.sections['edit'].defaultChecked = this.networkKeys[this.network][this.currentKey].uiDefault;
        this.sections['edit'].labelText = this.networkKeys[this.network][this.currentKey].label;
        this.sections['edit'].showPrivKey = false;
      }
    },
    showMessage(message){
      this.$message(message);
    },
    saveEdit(){
      try {
        this.storage.setPubKeyLabel(this.network, this.currentKey, this.sections['edit'].labelText);
        if (this.sections['edit'].defaultChecked){
          //Get new localStorage pubKeys object
          this.storage.setWalletUIDefault(this.network, this.currentKey);
        }
        //Set the new storage object into reactivity layer
        this.refreshNetworkKeys();
      }catch (e){
        this.showMessage(e.message);
      }
      
      this.refreshBalance();
      this.showTransactions();
      this.resetEdit();

    },
    showPrivateKey(){
      this.sections['edit'].error = "";
      try {
          this.storage.authenticate(this.sections['edit'].password);
          let pubInfo = this.networkKeys[this.network][this.currentKey];
          pubInfo.privateKey = "Private (Secret) Key: " + this.storage.getPrivateKey(this.network, this.currentKey);
          this.$set(this.networkKeys[this.network], [this.currentKey], pubInfo);
          this.sections['edit'].showPrivKey = true;
          this.sections['edit'].password = "";
      }catch (e){
        this.showMessage(e.message)
      }
    },
    confirmDeleteAddress() {
      if (this.networkKeys[this.network][this.currentKey].uiDefault){
        this.$message({
            type: 'info',
            message: 'Cannot delete default address'
          });   
      }else{
        this.$confirm('If you do not have a backup funds could be lost.  ARE YOU SURE?', 'Deleting ' + this.networkKeys[this.network][this.currentKey].label, {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          try{
            this.storage.deletePrivateKey(this.network, this.currentKey);
            this.refreshNetworkKeys();
            this.revertToDefaultAddress();
            this.resetEdit();
            this.showTransactions();
            this.refreshBalance();
            this.$message({
              type: 'success',
              message: 'Deleted Wallet Address'
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
      }
    },
    generateNewWallet(){
      try {
        //Create new Wallet in the localStorage and return the wallet's public key
        let newPubKey = this.storage.newCilantroWallet(this.network, this.sections['add'].newlabel);
        //Get new localStorage pubKeys object, which now includes our new wallet
        this.refreshNetworkKeys();
        //switch to the new wallet that was just created
        this.currentKey = newPubKey;
        this.cancelAddSection();
        this.refreshBalance();
      }catch (e){
        this.showMessage(e.message);
      }
    },
    newWalletFromPrivateKey(){
      let addInfo = this.sections['add'];
       try {
        //Create new Wallet in the localStorage and return the wallet's public key
        let newPubKey = this.storage.newCilantroWallet_FromPrivateKey(this.network, addInfo.privateKey, addInfo.newlabel);
        //Get new localStorage pubKeys object, which now includes our new wallet
        this.refreshNetworkKeys();
        //switch to the new wallet that was just created
        this.currentKey = newPubKey;
        this.refreshBalance();
        this.cancelAddSection();
      }catch (e){
        this.showMessage(e.message);
      }
    },
    showTransactions(){
      this.transactions = this.storage.getTransactions(this.network, this.currentKey);
      this.determinePendingTransactions(this.currentKey);
      this.activeName = 'Transactions'
    },
    cancelAddSection(){
      let addDefault = {privateKey: "", newlabel: "", fromPrivate: false , newWallet: false}
      this.$set(this.sections, 'add', addDefault);
    },
    resetEdit(){
      let editDefault = {password: "", showPrivKey: false, labelText: "", error:"", defaultChecked: false}
      this.$set(this.sections, 'edit', editDefault);
    },
    resetSend(){
      let sendDefault = {txDestination: "", txAmount: 0, txStamps: 3000};
      this.$set(this.sections, 'send', sendDefault);
    },
    revertToDefaultAddress(){
      for (let key in this.networkKeys[this.network]){
        this.networkKeys[this.network][key].uiDefault ? this.currentKey = key : null;
      }
    },
    sendTransaction(){
      this.showSendButton = false;
      let s = this.sections['send'];

      if (this.validateTransaction(s)){
        this.showTransactions();
        const tauWallet = this.storage.getTauWallet();
        tauWallet.submit_tx_to_network(s.txAmount, s.txStamps, s.txDestination,
                                      this.currentKey,
                                      this.storage.getPrivateKey(this.network, this.currentKey))
        .then((result) => {
          this.showMessage(result.success);
          if (result.success.includes("successfully")){
            try{
              let transactionList = this.storage.addTransaction(this.network, this.currentKey, result.hash, 
                                                              s.txDestination, s.txAmount, s.txStamps);
              this.transactions = transactionList;
              this.determinePendingTransactions(this.currentKey);
            }catch (e){
                this.showMessage(e.message);
            }
          }else{
              console.log(result);
          }
        })
        .catch((reject) => {
          console.log(reject);
        });
      }
    },
    validateTransaction(s){
      if (s.txAmount === null || s.txAmount === "" || parseFloat(s.txAmount) === 0) {
          this.$message("You must input an amount");
          return false;
      } else if (parseFloat(s.txAmount) < 0) {
          this.$message("Amount must be a positive number");
          return false;
      } else if ((parseFloat(s.txAmount) + parseFloat(s.txStamps)) > this.networkKeys[this.network][this.currentKey].balance) {
          this.$message("You do not have enough " + this.symbols[this.network] + ' to complete this transfer'  );
          return false;
      } else if (s.txDestination === "" || s.txDestination === null) {
          this.$message("Enter a destination wallet address");
          return false;
      }
      //else if (!assert_valid_vk(destDiv.value)) {
      //    this.showmessage("Invalid destination, ensure it is a 64 character hexidecimal string");
      //   return false;
      //}
      return true;

    },
    determinePendingTransactions(initiatingKey){
      if (this.checkingTransactions.length === 0){
        this.pendingTransactions = [];
        for (let index in this.transactions){
          let t = this.transactions[index];
          if(t.status === "pending" && !this.checkingTransactions.includes(t.txHash)){
            this.pendingTransactions.push(t);
          }
        }
        if (this.pendingTransactions.length > 0){
          this.updateTransactions(initiatingKey, this.pendingTransactions);
        }
      }
    },
    updateTransactions(initiatingKey){
        if (initiatingKey === this.currentKey){
          for (let index in this.pendingTransactions){

            // Check if his is already in processing loop
            if (!this.checkingTransactions.includes(this.pendingTransactions[index].txHash)){
              //Add txHash to processing loop
              this.checkingTransactions.push(this.pendingTransactions[index].txHash)

              const tauWallet = this.storage.getTauWallet();
              tauWallet.check_tx(this.pendingTransactions[index].txHash, this.network, initiatingKey)
                .then((result) => {
                  // Remove txHash from processing loop
                  this.checkingTransactions = this.checkingTransactions.filter(function(value, index, arr){
                    return value !== result.txHash;
                  });

                  if (result.status.includes('SUCC') || result.status.includes('FAIL') ){
                    try{
                      this.transactions = this.storage.setTransactionStatus(result.tokenKey, result.pubKey, result);
                      this.refreshBalance()
                    } catch (e){
                      console.log(e.message);
                    }
                  }

                  //Run loop again which will check this again if the status is still pending
                  this.determinePendingTransactions(initiatingKey);
                })
                .catch((reject) => {
                  console.log(reject);
                });
            }
          } 
        }
    },
    deleteTransactions(){
      this.transactions = this.storage.deleteTransactions(this.network, this.currentKey);
    },
    formatAddress(address, length){
      return address.substr(0,length) + "..."
    }
  },
  components: {
    lamdenLogo,
    lamdenLogoDark
  },
};
</script>

<style>
  .el-header {
    color: #333;
    text-align: center;
    background-color: #fafaff;
    padding-top: 20px;
  }

  .walletFooter {
    color: #333;
    text-align: center;
    padding: 0;
    height: 238px!important;
    overflow: hidden;
    overflow-x: hidden;
    margin: -12px 0 0 0;
    overflow-y: hidden;
  }

  .walletTransactions {
    height: 100%!important;
    overflow: auto!important;
  }
  
  .walletMain {
    color: #333;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    padding: 0px 0 0px 0!important;
  }

  .el-dropdown {
    top: -10px;
    color: rgb(156, 60, 139);
  }

  .el-dropdown-menu__item {
    font-size: 1em;
    color: rgb(156, 60, 139); 
  }
    
  .el-dropdown-link {
    cursor: pointer;
    color: rgb(156, 60, 139);
  }

  .el-icon-arrow-down {
    font-size: 12px;
  }

  .el-message-box {
    margin: 0 10px 0 10px;
    width: unset!important;
  }

  .el-icon-loading {
    font-family: element-icons!important;
    font-style: normal;
    font-weight: 400;
    font-variant: normal;
    text-transform: none;
    line-height: 1;
    vertical-align: baseline;
    display: inline-block;
    -webkit-font-smoothing: antialiased;
  }

  .el-input-number {
    padding-left: 0px;
    padding-right: 0px;
    width: 95%;
  }

  .el-tabs__active-bar{
    left: 50px!important;
    background-color: rgb(156, 60, 139);
  }

  .el-tabs__header{
    margin:0 0 0 0;
  }

  .el-tabs__nav {
    float: none!important;
  }

  .el-tabs__content{
    overflow: scroll!important;
    position: relative;
    height: 199px;
    overflow-x: hidden!important;
  }

  .el-timeline-item__icon{
    padding: 0 0 0 0!important;
  }
  
  .el-timeline-item__timestamp{
    line-height: 0px;
    margin-top: 5px;
  }

  .el-timeline{
    margin: 10px 0 0 0;
  }

  .el-timeline-hash-button{
   padding: 0px!important; 
  }

  .send-box {
    padding: 0 15px 0 15px; 
  }

  .send-button-padding {
    margin: 20px 0 0 0;
  }

  .add-button-padding {
    margin: 5px 0 0 0;
  }

  .send-title {
    margin: 5px;
    color: rgb(117,46,104);
  }

  .label-beside-input{
    margin: 7px 0 0 0;
    color: rgb(156, 60, 139);
  }

  .section-text {
    margin: 5px 0 0 0;
    color: rgb(156, 60, 139);
  }

  .balance-box {
    color: rgb(156, 60, 139);
    font-size: 1.5em;
    margin: 10px 0 0 0;
  }

  .balance-button {
    transform: translate(0%, -7%);
    text-align: left;
  }

  .transaction-lines{
    padding:0;
    margin: 0;
  }

  .del-transactions-floating-button{
    position: fixed;
    bottom: 14px;
    right: 32px;
    z-index: 10000;
    box-shadow: 0px 3px 14px rgba(194, 44, 119, 0.5);
  }

  .send-transactions-floating-button{
    position: fixed;
    bottom: 14px;
    right: 178px;
    z-index: 10000;
    box-shadow: 0px 3px 14px rgba(44, 194, 89, 0.363);
  }

  .tab-boxes {
    min-height: 187px;
  }

  [debug], [debug] *:not(g):not(path) {
    color:                 hsla(210, 100%, 100%, 0.9) !important;
    background:            hsla(210, 100%,  50%, 0.5) !important;
    outline: solid 0.25rem hsla(210, 100%, 100%, 0.5) !important;

    box-shadow: none !important;
    filter:     none !important;
  }

</style>
