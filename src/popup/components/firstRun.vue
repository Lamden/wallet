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
        <el-carousel class="el-carousel__size" :interval="5000" arrow="always" trigger="click" :autoplay="false">
            <el-carousel-item v-for="item in 4" :key="item">
                <el-button type="warning" size="small" round @click="skipIntro = !skipIntro" class="button-skip" v-if="item==4">
                  I understand storing my password is my responsibilty
                </el-button>
                <h3>{{ content[item-1] }}</h3>
            </el-carousel-item>
        </el-carousel>
      </div>
      <div v-if="skipIntro">
        <el-form 
          :model="ruleForm2" 
          status-icon
          :rules="rules2" 
          ref="ruleForm2" 
          label-width="120px" 
          class="demo-ruleForm first-run-footer__form">
          <el-form-item>
            <h1 class="el-form-item-h1">Create your wallet password</h1>
          </el-form-item label="Password" prop="pass">
          <el-form-item label="Password" prop="pass">
            <el-input type="password" v-model="ruleForm2.pass" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="Confirm" prop="checkPass">
            <el-input type="password" v-model="ruleForm2.checkPass" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item>
            <div class="button-position"> 
              <el-button  type="primary" @click="submitForm('ruleForm2')">Submit</el-button>
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
        } else {
          if (this.ruleForm2.checkPass !== '') {
            this.$refs.ruleForm2.validateField('checkPass');
          }
          callback();
        }
      };
      var validatePass2 = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('Please input the password again'));
        } else if (value !== this.ruleForm2.pass) {
          callback(new Error('Passwords don\'t match!'));
        } else {
          callback();
        }
      };
    return {
      skipIntro: false,
      ruleForm2: {
          pass: '',
          checkPass: '',
          age: ''
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
          "We will encrypt your keys in the broswer usng a secure password you will create. Failure to keep this password safe could result in your funds being unrecoverable or stolen."
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
            console.log(this.storage.initiateKeyStore(this.ruleForm2.pass));
            this.$emit('unlock', 'wallet'); 
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      resetForm(formName) {
        this.$refs[formName].resetFields();
      }
  },
  components: {
    lamdenLogo
  }
};
</script>

<style>
.unlock {
  display: flex;
  flex-direction: column;
}

.el-carousel__item h3 {
    color: #475669;
    font-size: 18px;
    opacity: 0.75;
    line-height: 300px;
    margin: 0;
}

.el-carousel__item:nth-child(2n) {
    background-color: rgb(39,68,94);
}

.el-carousel__item:nth-child(2n-1) {
    background-color: rgb(117,46,104);
}

.first-run-footer__form {
  padding: 0px 30px 0 0!important;
  margin: 0 0 0 -20px!important;
  text-align: center;
}

.first-run-footer__carousel {
  padding: 50px 0 0 0!important;
  height:100%!important;
  text-align: center;
}

.el-carousel__size {
  width: 100%;
  height: 240px;
}

.el-carousel__container {
  height:100%!important;
}

.el-carousel__item h3 {
  line-height: 40px!important;
  color: rgb(224, 224, 224);
}

.el-form-item-h1 {
  color: grey;
  margin: 0 0 20px -65px;;
}
.el-carousel__arrow {
  top: 80%!important;
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
