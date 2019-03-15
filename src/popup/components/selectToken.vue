<template>
    <el-card>
        <img :src=token.icon class="select-image">
        <div style="padding: 4spx;">
            <h1 class="select-name" >{{token.name}}</h1>
            <span class="keys-count">{{countKeys}}</span>
            <div class="bottom clearfix">
                <el-switch 
                    :value="tokenActive"
                    @change="handleChange">
                </el-switch>
                
            </div>
        </div>
    </el-card>
</template>

<script> 
export default {
  props:{token: {type: Object}, 
         storage: {type: Object},
         tokenActive: {type: Boolean}
        },
    data () {
      return {
        tokenKey: "",
        keys: {},
        countKeys: 'keys 0'
    }},
    created(){
      this.tokenKey = this.token.name + this.token.symbol;
      this.keys = this.storage.getPubKeyInfo(this.tokenKey);
      let numOfKeys = Object.keys(this.keys).length;
      if (numOfKeys) {
        this.countKeys = 'keys ' + numOfKeys;
      }
    },
    methods:{
      handleChange: function handleChange() {
        this.$emit('update:tokenActive', !this.tokenActive);
        if (this.tokenActive){
          this.storage.removeActiveToken(this.tokenKey);
        }else{
          this.storage.setActiveToken(this.tokenKey);
        }
      }
    }
};            
</script>

<style>
  .time {
    font-size: 13px;
    color: #999;
  }
  
  .bottom {
    margin-top: 5px;
    line-height: 12px;
  }

  .button {
    padding: 0;
    float: right;
  }

  .select-image {
    max-width: 100%;
    max-height: 100%;
    display: block;
  }

  .select-name {
    font-size: 1em;
    margin: 5px 0 0px 0;
  }

  .clearfix:before,
  .clearfix:after {
      display: table;
      content: "";
  }
  
  .clearfix:after {
      clear: both
  }

  .el-card {
      width: 90px!important;
      height: 172px!important;
      margin: 5px 5px 5px 5px;
      text-align: center;
  }

  .el-card__body {
      text-align: center;
      padding: 10px;
  }

  .keys-count{
    padding: 0;
    margin: 0;
    font-size: 0.8em;
    color: rgb(158, 158, 158);
  }

  [debug], [debug] *:not(g):not(path) {
    color:                 hsla(210, 100%, 100%, 0.9) !important;
    background:            hsla(210, 100%,  50%, 0.5) !important;
    outline: solid 0.25rem hsla(210, 100%, 100%, 0.5) !important;

    box-shadow: none !important;
    filter:     none !important;
  }

</style>
