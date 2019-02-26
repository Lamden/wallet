<template>
  <el-container class="popup">
    <div>
      <input class='nav__toggler' type='checkbox' v-on:click='hideMenu' v-if="menu" />
      <div class='nav__hamburger' v-on:click='showMenu' v-if="currentView != 'unlock'">
          <div></div>
      </div>
      <div class='nav__menu' v-if="menu">
        <div class="nav__internal">
          <h2 v-for="page in pages" v-on:click="navController(page)" class="menuitem">
            {{ page }}
          </h2>
        </div>
      </div>
      <h3>TESTING123</h3>
    <!--<steps v-if="currentView!=='confirm'" :step="step"/> -->
    <component
      :is="currentView"
      :storage="keyStorage"
      @select="switchView('select-key')"
      @sign="switchView('sign-tx')"
      @manage="switchView('manage-keys')"
      @wallet="switchView('wallet')"
      />
    </div>
  </el-container>
</template>
<script>
import confirm from './components/confirm';
import select from './components/selectKey';
import steps from './components/steps';
import unlock from './components/unlock';
import signTx from './components/signTx';
import manageKeys from './components/manageKeys';
import wallet from './components/wallet';

export default {
  data: () => ({
    currentView: 'wallet',
    keyStorage: null,
    menu: false,
    pages: [
      'Home',
      'Clove',
      'Log Out',
    ]
  }),
  computed: {
    step: function step() {
      if (this.currentView === 'unlock') {
        return 0;
      } else if (this.currentView === 'select-key' || this.currentView === 'manage-keys') {
        return 1;
      }
      return 2;
    },
  },
  created() {
    this.keyStorage = Object.assign({}, chrome.extension.getBackgroundPage().keyStorage);

    try {
      this.keyStorage.getAvailableKeys();
    } catch (e) {
      this.currentView = 'unlock';
    }
    if (window.location.hash === '#confirm') {
      this.currentView = 'confirm';
    }
  },
  methods: {
    switchView(value) {
      this.currentView = value;
    },
    showMenu() {
      if (this.menu) {
        this.menu = false;
      } else {
        this.menu = true;
      }
    },
    hideMenu() {
      if (this.menu) {
        this.menu = false;
      }
    },
    navController(page) {
      if (page == "Log Out") {
        this.keyStorage.lockStorage();
        this.currentView = "unlock";
      } else if (page == "Home") {
        this.currentView = "wallet";
      }
      this.menu = false
    }
  },
  components: {
    'select-key': select,
    confirm,
    unlock,
    steps,
    'manage-keys': manageKeys,
    'sign-tx': signTx,
    wallet,
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

* {
  font-family: 'Avenir';
}

body {
  margin: 0;
  overflow-x: hidden;
}

@media (max-width: 590px) {
  body {
    overflow-x: auto;
  }
}

.el-button {
  height: 40px;
  width: 120px;
}

.el-button--primary{
  background-color: #5368E7;
  border-color: #5368E7;
}

.el-button--primary.is-disabled {
  background-color: #CBD1F8;
  border-color: #CBD1F8;
}

.el-input__inner:focus, .el-input__inner:hover {
   border-color:#5368E7 !important;
   outline: 0;
}

.el-form-item {
  margin: 0;
}

.el-form-item__error {
  position: relative;
}

.el-scrollbar.is-empty {
  display: none;
}

.popup {
  min-height: 515px;
  max-height: 550px;
  width: 375px;
  background-color: #FFFFFF;
  padding: 30px;
  flex-direction: column;
}

.input-description{
  color: #7D7688;
  font-size: 14px;
  line-height: 40px;
  margin: 0;
}

.short-input{
  height: 40px;
  width: 420px;
}

.long-input {
  width: 550px;
}

.auto-width {
  width: auto;
}

.submit-button {
  margin: 30px 0;
}

.nav__hamburger {
  display: flex;
  position: absolute;
  align-items: center;
  justify-content: center;
  top: 0;
  left: 0;
  z-index: 1000;
  width: 25px;
  height: 25px;
  padding: 17px;
  cursor: pointer;
  backface-visibility: hidden;
}

.nav__hamburger div {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex: none;
  width: 100%;
  height: 2px;
  background: #000000;
  transition: all $fast ease;
  border-radius: 1px;
}

.nav__hamburger div::before, .nav__hamburger div::after {
  content: '';
  position: absolute;
  z-index: 1;
  top: 7px;
  left: 0;
  width: 100%;
  height: 2px;
  background: #000000;
  transition: all $fast ease;
  border-radius: 1px;
}

.nav__hamburger div::after {
  top: auto;
  bottom: 7px;
}

.nav__menu {
  position: fixed;
  left: 0px;
  top: 0px;
  background-color: #FFFFFF;
  height: 100%;
  width: 50%;
  z-index: 100;
  border-right: 1px solid #c0c4cc;
  padding: 0px 10px 0px;
}

.nav__internal {
  margin: 56px auto 0px;
}

.nav__toggler {
  display: block;
  position: absolute;
  width: 50%;
  height: 100%;
  top: 0;
  right: 0;
  z-index: 2;
  cursor: pointer;
  opacity: 0;
}

.logo__img {
  margin: 0 auto;
}

.nav__internal h2 {
  font-family: Avenir-Light;
  font-weight: 400;
  font-size: 24px;
  margin: 8px auto;
  text-align: center;
}

.menuitem {
  cursor: pointer;
}
</style>
