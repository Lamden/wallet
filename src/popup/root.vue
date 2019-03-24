<template>
  <el-container class="popup">
    <div>
      <input class='nav__toggler' type='checkbox' v-on:click='hideMenu' v-if="menu" />
      <div class='nav__hamburger' v-on:click='showMenu' v-if="showHamburger">
          <div></div>
      </div>
      <div class='nav__menu' v-if="menu">
        <div class="nav__internal">
          <el-menu default-active="1">
            <el-menu-item index="1" @click="navController('Lamden Wallet')">
              <i class="el-icon-menu"></i>
              <span>Lamden Wallet</span>
            </el-menu-item>
            <el-menu-item index="1" @click="navController('Clove Wallet')">
              <i class="el-icon-menu"></i>
              <span>Clove Wallet</span>
            </el-menu-item>
            <el-menu-item index="2" @click="navController('backup')">
              <i class="el-icon-setting"></i>
              <span>Backup and Restore</span>
            </el-menu-item>
            <el-menu-item class="sit-at-bottom" index="2" @click="navController('Lock Wallet')">
              <i class="el-icon-setting"></i>
              <span>Lock Wallet</span>
            </el-menu-item>
      <!--      <el-menu-item index="2" @click="navController('timeline')">
              <i class="el-icon-setting"></i>
              <span>Timeline</span>
            </el-menu-item>
            <el-menu-item index="2" @click="navController('firstRun')">
              <i class="el-icon-setting"></i>
              <span>First Run</span>
            </el-menu-item>
            <el-menu-item index="2" @click="navController('dev')">
              <i class="el-icon-setting"></i>
              <span>Dev</span>
            </el-menu-item>
      -->    </el-menu>
        </div>
      </div>
    <component
      :is="currentView"
      :storage=keyStorage
      :lastView="lastView"
      @unlock="unlockView"
      @sign="switchView('sign-tx')"
      @manage="switchView('manage-keys')"
      @wallet="switchView('wallet')"
      @clove="switchView('clove')"
      @dev="switchView('clove')"
      @firstRun="switchView('firstRun')"
      @backup="switchView('backup')"
      @timeline="switchView('timeline')"
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
import clove from './components/clove';
import dev from './components/dev';
import firstRun from './components/firstRun';
import backup from './components/backup';
import timeline from './components/timeline-test';

export default {
  data: () => ({
    currentView: 'wallet',
    lastView: 'wallet',
    keyStorage: null,
    menu: false,
    hideHamburger: ['unlock', 'firstRun', 'confirm','signTx']
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
    showHamburger: function showHamburger(){
      if (this.hideHamburger.includes(this.currentView)) {return false}
      return true;
    }
  },
  created() {
    this.keyStorage = Object.assign({}, chrome.extension.getBackgroundPage().keyStorage);

    this.keyStorage.firstRun() ? this.currentView = 'unlock' : this.currentView = 'firstRun';

    if (window.location.hash === '#confirm') {
        this.currentView = 'confirm';
    }

    if (!this.keyStorage.isUnlocked()){
      this.currentView = 'unlock';
    } else {
      this.currentView = this.lastView;
    }
  },
  methods: {
    switchView(value) {
      this.currentView = value
    },
    unlockView(e) {
      this.currentView = e
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
      this.lastView = this.currentView;

      if (page == "Lock Wallet") {
        this.keyStorage.lock();
        this.currentView = "unlock";

      } else if (page == "Lamden Wallet") {
        this.currentView = "wallet";

      } else if (page == "Clove Wallet") {
        this.currentView = "clove";

      } else if (page == "dev") {
        this.currentView = "dev";

      } else if (page == "firstRun") {
        this.currentView = "firstRun";

      }else if (page == "backup") {
        this.currentView = "backup";

      }else if (page == "timeline") {
        this.currentView = "timeline";
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
    clove,
    dev,
    firstRun,
    backup,
    timeline
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
  width: 380px;
  background-color: #FFFFFF;
  flex-direction: column;
  overflow: hidden;
  overflow-y: hidden;
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
  padding: 0;
}

.nav__internal {
  margin: 56px auto 0px;
  height: 100%;
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
  text-align: left;
}

.menuitem {
  cursor: pointer;
}

.sit-at-bottom{
  position: relative;
  top: 235px;
}
</style>