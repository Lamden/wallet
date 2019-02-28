<template>
    <el-container>
      <el-main>           
        <img :src=img alt="clove" height="100" width="100" >
        <h2> Clove </h2>
      </el-main>
      <el-footer>
        <div v-for="token in tokens" class="tokenBox">
          <cloveToken :token=token></cloveToken>
        </div>
      </el-footer>
  </el-container>
</template>


<script>
import cloveToken from './cloveToken';

  export default {
    props: ['storage'],
    data: () => ({
          img: "/images/clove-logo.svg",
          BTCicon: "/icons/tokens/BTC.svg",
          tokens: [
            {name: "Bitcoin", symbol: "BTC", balance: 5.12345678, icon: "/icons/tokens/BTC.svg", address:"89au21n219898h198hd98sdf98df98sadf98dfa98hf98ha9fah"},
            {name: "Ethereum", symbol: "ETH", balance: 12.12345678, icon: "/icons/tokens/ETH.svg", address:"89au21n219898h198hd98sdf98df98sadf98dfa98hf98ha9fah"},
            {name: "Litecoin", symbol: "LTC", balance: 130.12345678, icon: "/icons/tokens/LTC.svg", address:"89au21n219898h198hd98sdf98df98sadf98dfa98hf98ha9fah"},
            {name: "Bitcoin Cash", symbol: "BCH", balance: 40.12345678, icon: "/icons/tokens/BCH-alt.svg", address:"89au21n219898h198hd98sdf98df98sadf98dfa98hf98ha9fah"},
            {name: "Bitcoin SV", symbol: "BSV", balance: 86.12345678, icon: "/icons/tokens/BTA.svg", address:"89au21n219898h198hd98sdf98df98sadf98dfa98hf98ha9fah"},
            {name: "Dash", symbol: "DASH", balance: 349.12345678, icon: "/icons/tokens/DASH.svg", address:"89au21n219898h198hd98sdf98df98sadf98dfa98hf98ha9fah"},
            {name: "Ethereum Classic", symbol: "ETC", balance: 892.12345678, icon: "/icons/tokens/ETC.svg", address:"89au21n219898h198hd98sdf98df98sadf98dfa98hf98ha9fah"},
            {name: "VeChain", symbol: "VET", balance: 10789.12345678, icon: "/icons/tokens/VET.svg", address:"89au21n219898h198hd98sdf98df98sadf98dfa98hf98ha9fah"},
            {name: "Augur", symbol: "REP", balance: 19287321.12345678, icon: "/icons/tokens/REP.svg", address:"89au21n219898h198hd98sdf98df98sadf98dfa98hf98ha9fah"}
          ]
    }),
    computed: {
    },
    created() {
    },
    methods: {
    },
    components: {
      cloveToken
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
    
  }

  .el-footer {
    text-align: center;
  }
  
  .el-main {
    color: #333;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    padding-top: 30px;
  }

  .expand {
    white-space: nowrap;
    overflow: hidden;
    padding-right: 10px;
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
