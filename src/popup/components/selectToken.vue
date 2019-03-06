<template>
    <el-card>
        <img :src=token.icon class="select-image">
        <div style="padding: 4spx;">
            <h1 class="select-name" >{{token.name}}</h1>
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
    props:['tokenActive', 'token', 'storage'],
    data: () => ({}),
    methods:{
      handleChange: function handleChange() {
        let tokenKey = this.token.name + this.token.symbol;
        try{
          this.$emit('update:tokenActive', !this.tokenActive);
          if (this.tokenActive){
            this.storage.removeActiveToken(tokenKey);
          }else{
            this.storage.setActiveToken(tokenKey);
          }
        } catch (e) {
          console.log(e.message);
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
    margin-top: 13px;
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
    margin: 5px 0 5px 0;
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
        width: 80px!important;
        height: 145px!important;
        padding: 5px 5px 5px 5px;
        margin: 5px 5px 5px 5px;
    }

    .el-card__body {
        height: 100%;
        text-align: center;
    }

  [debug], [debug] *:not(g):not(path) {
    color:                 hsla(210, 100%, 100%, 0.9) !important;
    background:            hsla(210, 100%,  50%, 0.5) !important;
    outline: solid 0.25rem hsla(210, 100%, 100%, 0.5) !important;

    box-shadow: none !important;
    filter:     none !important;
  }

</style>
