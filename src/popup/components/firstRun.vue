<template>
  <el-container>
    <el-header class="walletHeader">
      <span></span>
    </el-header>
    <el-main class="walletMain">
      <div class="lamden-logo-box">
        <lamdenLogo></lamdenLogo>   
      </div>     
    </el-main>
    <!-- The Main New Uers intro logic -->
    <el-footer class="first-run-footer__carousel">
      <div v-if="!skipIntro">
        <el-carousel class="el-carousel__size" id="firstrun-carousel" :interval="5000" arrow="always" trigger="click" :autoplay="false">
            <el-carousel-item v-for="item in 4" :key="item" id="firstrun-carousel-item">
                <el-button type="warning" size="small" round @click="skipIntro = !skipIntro" class="button-skip" v-if="item==4">
                  I understand storing my password is my responsibilty
                </el-button>
                <h3 class="content-text" id="content-text">{{ content[item-1] }}</h3>
            </el-carousel-item>
        </el-carousel>
      </div>
      <div v-if="skipIntro">
        <el-form 
          :model="ruleForm" 
          status-icon
          :rules="rules2" 
          ref="ruleForm" 
          label-width="120px" 
          class="demo-ruleForm first-run-footer__form">
          <el-form-item label="Password" prop="pass">
            <h1 class="el-form-item-h1">Create your wallet password</h1>
          </el-form-item >
          <el-form-item label="Password" prop="pass">
            <el-input type="password" v-model="ruleForm.pass" autocomplete="off" size="small"></el-input>
          </el-form-item>
          <el-form-item label="Confirm" prop="checkPass">
            <el-input type="password" v-model="ruleForm.checkPass" autocomplete="off" size="small" 
              @keyup.enter.native.prevent="submitForm('ruleForm')"></el-input>
          </el-form-item>
          <el-form-item>
            <div class="button-position"> 
              <el-button  size="small" type="primary" @click="submitForm('ruleForm')">Submit</el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </el-footer>
  </el-container>
</template>

<script>
import errorMixin from '../mixins/error';
import lamdenLogo from './lamdenLogo';

export default {
  props: ['storage','lastView'],
  mixins: [errorMixin],
  data() {
      var validatePass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('Please input the password'));
        }else if(value.length < 8){
          callback(new Error('Passwords must be at least 8 characters long'));
        }else if(!this.validate_pass(value)){
          callback(new Error("Passwords must have one uppercase, lowercase, numeric, and special character"));
        } else {
          if (this.ruleForm.checkPass !== '') {
            this.$refs.ruleForm.validateField('checkPass');
          }
          callback();
        }
      };
      var validatePass2 = (rule, value, callback) => {
        if (value !== this.ruleForm.pass) {
          callback(new Error('Passwords don\'t match!'));
        } else {
          callback();
        }
      };
    return {
      skipIntro: false,
      ruleForm: {
          pass: '',
          checkPass: ''
        },
        rules2: {
          pass: [
            { validator: validatePass, trigger: 'blur' }
          ],
          checkPass: [
            { validator: validatePass2, trigger: 'blur' }
          ]
        },
        buttonSkip: {
          type: "info",
          size: "mini"
        },
        content: [
          "Welcome to the Lamden Wallet. This is a place to store your Lamden TAU tokens but also an interface with our Clove Atomic Swap website",
          "To interface with the Clove website we will need to store your private keys in this wallet. We use your keys to sign transacations during the Atomic Swap process.",
          "We will encrypt your keys in the broswer using a secure password you will create. Failure to keep this password safe could result in your funds being unrecoverable or stolen."
        ]
    };
  },
  computed: {
    isButtonDisabled: function isButtonDisabled() {
      return this.unlockForm.password.length === 0;
    },
    isKeyStoreEmpty: function isKeyStoreEmpty() {
      return Object.keys(this.storage).length ? true : false
    }
  },
  methods: {
    submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.storage.initiateKeyStore(this.ruleForm.pass);
            this.$emit('wallet'); 
          } else {
            return false;
          }
        });
      },
      resetForm(formName) {
        this.$refs[formName].resetFields();
      },
      next() {
        if (this.active++ > 2) this.active = 0;
      },
      validate_pass(pass) {
        var strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
        return strongRegex.test(pass);
      }
  },
  components: {
    lamdenLogo
  }
};
</script>

<style>
#content-text{
    font-size: 18px;
    margin: 69px 0 0 0;
    padding: 0 10px 0 10px;
}

.first-run-footer__form {
  padding: 0px 30px 0 0!important;
  margin: 0 0 0 -20px!important;
  text-align: center;
}

.first-run-footer__carousel {
  padding: 26px 0 0 0;
  text-align: center;
}

.el-form-item-h1 {
  color: grey;
  margin: 0 0 20px -65px;;
}

#firstrun-carousel{
    width: 100%;
    height: 239px;
    overflow: hidden;
    overflow-x: hidden;
    overflow-y: hidden;
}
#firstrun-carousel .el-carousel__arrow--left {
  left: -80px;
}

#firstrun-carousel .el-carousel__arrow--right {
    right: 18px;
    top: 205px;
    font-size: 27px;
}

#firstrun-carousel .el-carousel__indicators {
  bottom: 21px;
}

#firstrun-carousel .el-carousel__item:nth-child(2n) {
    background-color: rgb(39,68,94);
    color: rgb(58, 155, 81);
}

#firstrun-carousel .el-carousel__item:nth-child(2n-1) {
    background-color: rgb(117,46,104);
    color: rgb(241, 91, 151);
}

.button-skip {
  padding: 0!important;
  margin: 25% 0 0 0!important;
  width: 90%!important;
  height: 40px!important;
  position: absolute;
  right: 20px;
}

.button-position {
  padding: 20px 0 0 0!important;
  margin: 0 0 0 -65px!important;
  text-align: center!important;
}

.lamden-logo-box {
  width: 150px;
  height: 150px;
  margin: 0 0 0 0;
  padding: 0 0 0 30%;
}

.password-input {
  width: 100%;
  height: 40px;
}

.password-description{
  padding-top: 80px;
}

p.small {
  line-height: 1.2;
}

</style>
