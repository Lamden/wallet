<template>
  <div>
    <div v-if="Object.keys(availableKeys).length === 0">
      <add-key
        :storage="storage"
        @added="calculateAvailable"
      />
    </div>
    <el-form :model="selectKeyForm" >
      <div v-if="Object.keys(availableKeys).length > 0">
        <p class="input-description">Network</p>
        <el-form-item prop="network">
          <el-select
            auto-complete="true"
            v-model="selectKeyForm.network"
            @change="handleNetworkChange"
            class="long-input"
            filterable
            placeholder="Select your network">
              <el-option
                v-for="item in networksList"
                :key="item"
                :label="item"
                :value="item">
              </el-option>
          </el-select>
        </el-form-item>
      </div>
      <p class="input-description">Wallet Addresses</p>
      <el-form-item prop="address">
        <el-select
          auto-complete="true"
          v-model="selectKeyForm.address"
          @change="setLastAddress"
          class="long-input"
          filterable
          :disabled="addresses.length === 0"
          placeholder="Select wallet address">
            <el-option
              v-for="item in addresses"
              :key="item"
              :label="item"
              :value="item">
            </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <el-button
      type="primary"
      class="submit-button"
      :disabled="isSubmitButtonDisabled"
      @click="submit">
      Next
    </el-button>
    <el-button
      v-if="Object.keys(availableKeys).length > 0"
      class="auto-width"
      @click="manageKeys">
      Manage private keys
    </el-button>
  </div>
</template>
<script>
import addKey from './addKey';

export default {
  props: ['storage'],
  data() {
    return {
      selectKeyForm: {
        address: '',
        network: '',
      },
      networksList: [],
      availableKeys: {},
    };
  },
  created() {
    this.calculateAvailable();
  },
  computed: {
    isSubmitButtonDisabled() {
      return !this.selectKeyForm.network || !this.selectKeyForm.address;
    },
    addresses() {
      if (this.selectKeyForm.network in this.availableKeys) {
        const addressesList = this.availableKeys[this.selectKeyForm.network];
        return addressesList.sort();
      }
      return [];
    },
  },
  methods: {
    handleNetworkChange() {
      [this.selectKeyForm.address] = this.addresses;
      this.setLastUsedValues();
    },
    calculateAvailable() {
      this.availableKeys = this.storage.getAvailableKeys();
      this.networksList = Object.keys(this.availableKeys);

      this.getLastUsedValues();
    },
    setLastUsedValues() {
      this.setLastNetwork(this.selectKeyForm.network);
      this.setLastAddress(this.selectKeyForm.address);
    },
    getLastUsedValues() {
      const lastNetwork = localStorage.getItem('lastNetwork');
      if (lastNetwork && lastNetwork in this.availableKeys) {
        this.selectKeyForm.network = lastNetwork;
        const lastAddress = localStorage.getItem('lastAddress');
        if (lastAddress && this.addresses.indexOf(lastAddress) > -1) {
          this.selectKeyForm.address = lastAddress;
        } else {
          [this.selectKeyForm.address] = this.addresses;
        }
      } else {
        [this.selectKeyForm.network] = this.networksList;
        [this.selectKeyForm.address] = this.addresses;
      }
    },
    submit() {
      this.setLastUsedValues();
      this.$emit('sign');
    },
    setLastNetwork(value) {
      localStorage.setItem('lastNetwork', value);
    },
    setLastAddress(value) {
      localStorage.setItem('lastAddress', value);
    },
    manageKeys() {
      this.$emit('manage');
    },
  },
  components: {
    'add-key': addKey,
  },
};
</script>
