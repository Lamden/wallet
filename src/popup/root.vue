<template>
  <el-container class="popup">
    <div class="header">Clove sign Plugin</div>
    <steps :step="step"/>
    <component
      :is="currentView"
      :storage="keyStorage"
      v-on:unlocked="switchToSelectView"
    />
  </el-container>
</template>
<script>
import select from './components/selectKey';
import steps from './components/steps';
import unlock from './components/unlock';

export default {
  data: () => ({
    currentView: 'select-key',
    keyStorage: null,
  }),
  computed: {
    step: function step() {
      if (this.currentView === 'unlock') {
        return 0;
      } else if (this.currentView === 'select-key') {
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
    switchToSelectView: function switchToSelectView() {
      this.currentView = 'select-key';
    },
  },
  components: {
    'select-key': select,
    unlock,
    steps,
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

.el-button--primary{
  height: 40px;
  width: 120px;
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

.popup {
  height: 480px;
  background-color: #FFFFFF;
  padding: 30px;
  flex-direction: column;
}

.header {
  color: #0D8A4C;
  font-size: 20px;
  line-height: 32px;
  padding-bottom: 30px;
}
</style>
