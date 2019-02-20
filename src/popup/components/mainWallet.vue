<template>
  <div class='walletParent'>
    <div class='wallet-balance'>

    </div>
    <el-input
      id="walletKey"
      class="interactiveInput"
      placeholder="Wallet Address" />
    <el-button
      id='copyWallet'
      class='interactiveButton'>
      Copy
    </el-button>
  </div>

</template>

<script>
// Import section

// Definition Section
export default {
  props: ['storage'],
  data() {
    return {
    };
  },
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
#walletKey {
  border-radius: 25px 0px 0px 25px;
  display: flex;
  flex: 0 0 auto;
  border-right: 0px;
}

#copyWallet {
  border-radius: 0px 25px 25px 0px;
  display: flex;
  flex: 0 0 70px;
}

.walletParent {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
}
</style>
