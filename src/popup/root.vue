<template>
  <el-container class="popup">
    <div>
      <div class="header-container">
        <div class="header">Clove sign Plugin</div>
        <el-button
          v-if="currentView === 'manage-keys' || currentView === 'sign-tx'"
          @click="switchView('select-key')"
          icon="el-icon-back">
          Back
        </el-button>
      </div>
    </div>
    <steps :step="step"/>
    <component
      :is="currentView"
      :storage="keyStorage"
      @unlocked="switchView('select-key')"
      @sign="switchView('sign-tx')"
      @manage="switchView('manage-keys')"
    />
  </el-container>
</template>
<script>
import select from './components/selectKey';
import steps from './components/steps';
import unlock from './components/unlock';
import signTx from './components/signTx';
import manageKeys from './components/manageKeys';

export default {
  data: () => ({
    currentView: 'select-key',
    keyStorage: null,
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
    this.keyStorage = chrome.extension.getBackgroundPage().keyStorage;
    try {
      this.keyStorage.getAvailableKeys();
    } catch (e) {
      this.currentView = 'unlock';
    }
  },
  methods: {
    switchView(value) {
      this.currentView = value;
    },
  },
  components: {
    'select-key': select,
    unlock,
    steps,
    'manage-keys': manageKeys,
    'sign-tx': signTx,
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

.popup {
  height: 480px;
  background-color: #FFFFFF;
  padding: 30px;
  flex-direction: column;
}

.header-container {
  display: flex;
  justify-content: space-between;
}

.header {
  color: #0D8A4C;
  font-size: 20px;
  line-height: 32px;
  padding-bottom: 30px;
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
</style>
