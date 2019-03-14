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
          <span :key="forceRefreshKeys.balance">{{networkKeys[network][currentKey].balance}}</span>
          <el-button class="balance-button" :disabled="disableRefreshBalance" @click="refreshBalance" size="mini" icon="el-icon-refresh" circle title="refresh balance"></el-button>
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
        </el-dropdown>
        <br>
        <el-button @click="showSection('send')" v-if="togTestNet" size="mini" icon="el-icon-d-arrow-right" circle title="send transaction"></el-button>
        <el-button @click="showMessage('Copied!')" v-if="togTestNet" v-clipboard:copy="currentKey" size="mini" icon="el-icon-document" circle title="copy wallet address"></el-button>
        <el-button @click="showSection('edit')" v-if="togTestNet" size="mini" icon="el-icon-edit" circle title="edit address"></el-button>
        <el-button @click="showSection('add')" v-if="togTestNet" size="mini" icon="el-icon-plus" circle title="add new address"></el-button>
      </el-main>

      
      <el-footer class="walletFooter">

<!--  SEND TRANSACTION PANE                         -->
      <div v-if="sections['send'].visible" class="send-box">
        <h1 class="send-title">Send Dark TAU</h1>
        <el-input type="textarea" :rows="2" placeholder="Enter recipient's wallet address" size="mini" resize="none" 
                  v-model="sections['send'].txDestination"></el-input>
        <el-row>
          <el-col :span=12>
            <h3>Amount</h3>
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
        <el-row :gutter=10>
          <el-button :disabled="sections['send'].disableSendButton" @click="resetSend" class="send-button-padding" 
                     type="info" plain size="mini">
            Cancel</el-button>
          <el-button :disabled="sections['send'].disableSendButton" @click="sendTransaction" class="send-button-padding" 
                     type="success" plain size="mini">
            Send Transaction</el-button>
        </el-row>
      </div>

<!--  EDIT ADDRESS PANE                         -->
      <div v-if="sections['edit'].visible" class="send-box">
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
          <el-button @click="showTransactions" class="send-button-padding" type="info" plain size="mini">
            Cancel</el-button>
          <el-button @click="saveEdit" class="send-button-padding" type="success" plain size="mini">
            Save Info</el-button>
          <el-button @click="confirmDeleteAddress" :disabled="deleteButtonDisabled" class="send-button-padding" type="danger" plain size="mini">
            Delete Wallet</el-button>
      </div>

<!--  ADD ADDRESS PANE                         -->
      <div v-if="sections['add'].visible" class="send-box">
        <div v-if="displayAddMainSection">
          <el-button class="add-button-padding" @click="sections['add'].newWallet = true" type="success" plain size="mini">
            Generate New Wallet</el-button>
          <br>
          <el-button class="add-button-padding" @click="sections['add'].fromPrivate  = true" type="success" plain size="mini">
            Add from Private Key</el-button>
          <br>
          <el-button @click="cancelAddSection" class="send-button-padding" type="info" plain size="mini">
            Cancel</el-button>
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
          <el-button @click="resetSend" class="send-button-padding" type="info" plain size="mini">
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
          <el-button @click="cancelAddSection" class="send-button-padding" type="info" plain size="mini">
            Cancel</el-button>
        </div>
      </div>

<!--  TRANSACTIONS PANE                         -->
      <div v-if="sections['transactions'].visible">
        <p>Transactions</p>
        <span v-for="(transaction, index) in transactions" :key="index">
        {{transaction.txHash}}<br> 
        {{transaction.amount + "   " + transaction.date + " " + transaction.time}}<br>
        {{transaction.status}}<br>
        </span>
        </div>
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
    precision: 0,
    currentKey: "",
    togTestNet: true,
    showOverflowTooltip: true,
    keysDropdown: {},
    networkKeys: {},
    transactions: [],
    disableRefreshBalance: false,
    forceRefreshKeys: {balance: 0},
    sections: {'transactions': {visible: true},
              'send': {visible: false, disableSendButton: false, txDestination: "", txAmount: 0, txStamps: 3000},
              'edit': {visible: false, password: "", showPrivKey: false, labelText: "", error:"", defaultChecked: false},
              'add': {visible: false, publickKey: "", privateKey:"", newlabel: "", fromPrivate: false , newWallet: false}}
  }),
  computed: {
    displayPublicKey: function displayPublicKey(){
      return 'Public Wallet Address: ' + this.currentKey;
    },
    deleteButtonDisabled: function deleteButtonDisabled(){
      if (this.sections['edit'].showPrivKey) {return false}
      return true;
    },
    displayAddMainSection: function displayAddMainSection(){
      if (this.sections['add'].newWallet || this.sections['add'].fromPrivate) {return false}
      return true;
    },
    addWalletLabelEmpty: function labelNotEmpty(){
      if (this.sections['add'].newlabel.length === 0) {return true}
      return false;
    },
    formatAddress: function formatAddress(address, length){
      let newAddress = address.substr(0, length); 
      return  newAddress;
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
    
    console.log(this.transactions)
  },
  methods: {
    swapNet() {
      let newNetwork = "";
      this.network === 'LamdenMainNet' ? newNetwork = 'DarkTauDTAU' :  newNetwork = 'LamdenMainNet';
      let pubInfo = this.storage.getPubKeyInfo(newNetwork);
         
      for (let key in pubInfo){
        pubInfo[key].uiDefault ? this.currentKey = key : null;
      }

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
    cancelAddSection(){
      let addDefault = {privateKey: "", newlabel: "", fromPrivate: false , newWallet: false}
      this.$set(this.sections, 'add', addDefault);
      this.showTransactions();
    },
    resetEdit(){
      let editDefault = {password: "", showPrivKey: false, labelText: "", error:"", defaultChecked: false}
      this.$set(this.sections, 'edit', editDefault);
    },
    resetSend(){
      this.showTransactions();
      let sendDefault = {disableSendButton: false, txDestination: "", txAmount: 0, txStamps: 3000};
      this.$set(this.sections, 'send', sendDefault);
    },
    revertToDefaultAddress(){
      for (let key in this.networkKeys[this.network]){
        this.networkKeys[this.network][key].uiDefault ? this.currentKey = key : null;
      }
    },
    sendTransaction(){
      let s = this.sections['send'];
      if (this.validateTransaction(s)){
        const tauWallet = this.storage.getTauWallet();

        tauWallet.submit_tx_to_network(s.txAmount, s.txStamps, s.txDestination,
                                      this.currentKey,
                                      this.storage.getPrivateKey(this.network, this.currentKey))
        .then((result) => {
          console.log(result);
          this.showMessage(result.success);
          if (result.success.includes("successfully")){
            try{
              let transactionList = this.storage.addTransaction(this.network, this.currentKey, result.hash, 
                                                              s.txDestination, s.txAmount, s.txStamps);
              console.log("Returned from Storage" + transactionList);
              this.transactions = transactionList;
              this.resetSend();
            }catch (e){
              console.log(e.message);
              this.showMessage(e.message);
            }
          }
        })
        .catch((reject) => {
          console.log(reject);
        });
      }
    },
    showTransactions(){
      this.transactions = this.storage.getTransactions(this.network, this.currentKey);
      for (let section in this.sections){
        section === 'transactions' ? this.sections[section].visible = true : this.sections[section].visible = false;
      }
    },
    validateTransaction(s){
      if (s.txAmount === null || s.txAmount === "" || parseFloat(s.txAmount) === 0) {
          this.showmessage("You must input an amount");
          return false;
      } else if (parseFloat(s.txAmount) < 0) {
          this.showmessage("Amount must be a positive number");
          return false;
      } 
      //else if (!assert_valid_vk(destDiv.value)) {
      //    this.showmessage("Invalid destination, ensure it is a 64 character hexidecimal string");
      //   return false;
    //  }
      return true;

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
    height: 233px!important;
    overflow:scroll;
    overflow-x: hidden;
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
    padding: 0px 0 15px 0!important;
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

  .newline {
    margin: 0px;
    padding: 0px;
  }

  [debug], [debug] *:not(g):not(path) {
    color:                 hsla(210, 100%, 100%, 0.9) !important;
    background:            hsla(210, 100%,  50%, 0.5) !important;
    outline: solid 0.25rem hsla(210, 100%, 100%, 0.5) !important;

    box-shadow: none !important;
    filter:     none !important;
  }

</style>
