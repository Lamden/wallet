<template>
  <el-container>
    <el-header class="walletHeader">
      <span></span>
    </el-header>
    <el-main class="walletMain">
        <div class="display-storage">
          <h1>Init Storage</h1>
          <p class="display-content">{{getInit()}}</p>
        </div>
        <div class="display-storage">
          <h1>PrivKey Storage</h1>
          <p class="display-content">{{getPrivateKeys()}}</p>
        </div>
    </el-main>
    <el-footer class="unlock-footer">

    </el-footer>
  </el-container>
</template>

<script>
export default {
  props: ['storage'],
  data() {
    return {
    };
  },
  computed: {
  },
  methods: {
    getInit() {
      return this.storage.getInitStorage();
    },
    getPrivateKeys() {
      return this.storage.getPrivateKeysStorage();
    }
  },
  components: {}
};
</script>

<style>

.display-storage {
  width: min-content;
  display: table;
  position: relative;
  background: #334b64;
  margin: 0px auto 20px auto;
  box-shadow: 0px 0px 50px rgba(29, 80, 123, 0.3);
}

.display-content {
  color: white;
  font-size: 14;
  text-align: center;
  position: relative;
  width: 100%;
  height: auto;
  word-wrap: break-word;
  white-space: pre-wrap
}

</style>
