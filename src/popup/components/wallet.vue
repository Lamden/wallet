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
      <el-main>           
        <img :src=networks[network].img alt="lamden" height="128" width="128" class="logo__img" id="logo__img">
        <h1> {{ "Balance: " + networks[network].balance + " " + networks[network].title}} </h1>
        <el-row>
          <el-col :span="23" class="span" show-overflow-tooltip="true">
            <span>Address: {{ networks[network].address }}</span>
          </el-col>
          <el-col :span="1">
            <i class="el-icon-document"
              v-clipboard:copy=networks[network].address
              v-clipboard:success="onCopy">
            </i>
          </el-col>
        </el-row>
      </el-main>
      <el-footer>
          <el-table
            :data=networks[network].transactions 
            style="width: 100%"
            height="180px"
            stripe>
            <el-table-column
              prop="hash"
              label="Transaction Hash"
              show-overflow-tooltip="true">
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
export default {
  props: ['storage'],
  data: () => ({
    network: "TAU",
    togTestNet: false,
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
          {hash:"29j2103913j01oij10j120u1091", time:"25", status: "complete"}
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
  },
};
</script>

<style>
  @font-face {
    font-family: 'Avenir';
    src: url('/fonts/Avenir-Light.woff') format('woff'),
        url('/fonts/Avenir-Light.ttf') format('truetype');
    font-weight: 200;
  }

  @font-face {
    font-family: 'Avenir';
    src: url('/fonts/Avenir-Medium.woff') format('woff'),
        url('/fonts/Avenir-Medium.ttf') format('truetype');
    font-weight: 400;
  }

  @font-face {
    font-family: 'Avenir';
    src: url('/fonts/Avenir-Heavy.woff') format('woff'),
        url('/fonts/Avenir-Heavy.ttf') format('truetype');
    font-weight: bold;
  }
  .el-header {
    color: #333;
    text-align: center;
    background-color: #fafaff;
    padding-top: 20px;
  }

  .el-footer {
    color: #333;
    text-align: center;
  }
  
  .el-main {
    color: #333;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
  }

  .span {
    color: rgb(160, 160, 160);
    white-space: nowrap;
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
