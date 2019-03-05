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
        <h1  class="walletBalance"> {{ "Balance: " + networks[network].balance + " " + networks[network].title}} </h1>
        <el-row class="walletTauAddress">
          <el-col :span="23" show-overflow-tooltip="showOverflowTooltip" class="cutoff-wallet-address">
            <span > {{"Address: " + networks[network].address }}</span>
          </el-col>
          <el-col :span="1">
            <i class="el-icon-document"
              v-clipboard:copy=networks[network].address>
            </i>
          </el-col>
        </el-row>
      </el-main>
      <el-footer class="walletFooter">
          <el-table
            :data=networks[network].transactions 
            style="width: 100%"
            class="walletTransactions"
            stripe>
            <el-table-column
              prop="hash"
              label="Transaction Hash"
              :show-overflow-tooltip=true>
            </el-table-column>
            <el-table-column
              prop="time"
              label="Time"
              width="60px">
            </el-table-column>
            <el-table-column
              prop="status"
              label="Status"
              width="80px">
            </el-table-column>
          </el-table>
      </el-footer>
  </el-container>
</template>

<script>
import lamdenLogo from './lamdenLogo';
import lamdenLogoDark from './lamdenLogoDark';

export default {
  props: ['storage'],
  data: () => ({
    network: "TAU",
    togTestNet: false,
    showOverflowTooltip: true,
    networks: {
      "TAU": {
        title: "TAU",
        balance: 30000,
        address: "92449732b3871c30915446fedb41420da05fdba9cc4d0ee882e9c542a05807f9",
        transactions: [
          {hash:"21oij10j1091120u203913j019j", time:"30", status: "pending"},
          {hash:"3913j20u10912019j21oij10j10", time:"25", status: "complete"},
          {hash:"219j21oij10j03913j0120u1091", time:"25", status: "complete"},
          {hash:"o39ij10j120u102013j019j2191", time:"25", status: "failed"},
          {hash:"9j21oij1203913j010j120u1091", time:"25", status: "complete"},
          {hash:"9j21oij1203913j010j120u1091", time:"25", status: "complete"}
        ],
        img: "/images/logo_lamden_color.svg",
      },
      "DarkTAU": {
        title: "DarkTAU",
        balance: 1000000,
        address: "20da05fdba92449732b3871cc542a058075446fedb41430ee882e99f9091cc4d",
        transactions: [
          {hash:"j1091j019j120u20391321oij10", time:"30", status: "complete"},
          {hash:"1091203913j019j21oij10j120u", time:"25", status: "complete"},
          {hash:"j21oij10j120203913j019u1091", time:"25", status: "failed"},
          {hash:"2031oij10j120u10913j019j291", time:"25", status: "complete"},
          {hash:"29j2103913j01oij10j120u1091", time:"25", status: "complete"},
          {hash:"9j21oij1203913j010j120u1091", time:"25", status: "complete"}
        ],
        img: "/images/darktau.svg",
      }
    },
  }),
  computed: {
  },
  created() {
  },
  methods: {
    swapNet() {
      this.togTestNet ? this.network = "DarkTAU" : this.network = "TAU"
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
  }

  .walletTransactions {
    height: 100%!important;
    overflow: auto!important;
  }

  .walletBalance {
    padding-bottom: 0;
  }
  
  .walletMain {
    color: #333;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    padding: 0px 0 15px 0!important;
  }

  .walletTauAddress {
    padding: 0 5% 0 5%;
  }

  .cutoff-wallet-address {
    overflow: hidden;
  }
  
  body > .el-container {
    margin-bottom: 0px;
  }

  [debug], [debug] *:not(g):not(path) {
    color:                 hsla(210, 100%, 100%, 0.9) !important;
    background:            hsla(210, 100%,  50%, 0.5) !important;
    outline: solid 0.25rem hsla(210, 100%, 100%, 0.5) !important;

    box-shadow: none !important;
    filter:     none !important;
  }

</style>
