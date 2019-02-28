<template>
  <el-row class="cardRow" >
    <el-card shadow="hover" :body-style="tokenCard">
      <el-row class="padding: 0px"> 
        <el-col :span="12">
          <img :src=token.icon height="70" width="70" class="image">
          <h1 class="tokenName">{{ token.name }} </h1>
        </el-col>
        <el-col :span="11" >
          <p class="tokenBalance">{{ token.balance + " " + token.symbol }}</p>
        </el-col>
      </el-row>
      
    </el-card>
  </el-row>
</template>


<script> 
  export default {
    props:['token'],
    data: () => ({
      tokenCard: {
        overflow: "hidden", 
        height: "55px",
        padding: "0px",
        marginLeft: "-20px"
        }
    }),
    computed: {
    },
    created() {
    },
    methods: {
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
  
  .span {
    color: rgb(160, 160, 160);
    white-space: nowrap;
    overflow: hidden;
  }

  .image {
    opacity: 0.15;
    filter: alpha(opacity=15); /* For IE8 and earlier */
    float: left;
  }

  .el-row.cardRow {
    padding: 5px;
  }

  h1.tokenName {
    color: rgb(117, 117, 117);
    text-align: left;
    font-size: 2.0em;
    margin-top: 4px;
    white-space: nowrap;
  }

  p.tokenBalance {
    margin-top: 40px;
    text-align: right;
  }

  [debug], [debug] *:not(g):not(path) {
    color:                 hsla(210, 100%, 100%, 0.9) !important;
    background:            hsla(210, 100%,  50%, 0.5) !important;
    outline: solid 0.25rem hsla(210, 100%, 100%, 0.5) !important;

    box-shadow: none !important;
    filter:     none !important;
  }

</style>
