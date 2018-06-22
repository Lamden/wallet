<template>
  <div>
    <el-form
      :model="selectKeyForm"
      :rules="rules"
      ref="form">
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
      <div v-if="Object.keys(availableKeys).length === 0">
        <p class="input-description">Private Key</p>
        <el-form-item prop="privateKey">
          <el-input
            v-model="selectKeyForm.privateKey"
            @change="clearValidation"
            @input="clearValidation"
            class="short-input"
            id="private-key-input"
            type="password"
            placeholder="Enter your private key">
            <i
              class="el-icon-view el-input__icon"
              slot="suffix"
              @click="toggleShowKey">
            </i>
          </el-input>
          <el-button
            id="add-key-btn"
            type="primary"
            :disabled="isAddKeyButtonDisabled"
            @click="handleAddKey">
            Add key
          </el-button>
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
      @click="manageKeys">
      Manage keys
    </el-button>
  </div>
</template>
<script>
export default {
  props: ['storage'],
  data() {
    const validatePrivateKey = (rule, value, callback) => {
      const added = this.addKeyToStorage();
      if (added) {
        callback();
      } else {
        callback(new Error('Invalid private key'));
      }
    };

    return {
      selectKeyForm: {
        address: '',
        network: '',
        privateKey: '',
      },
      networksList: [],
      availableKeys: {},
      rules: {
        privateKey: [
          { validator: validatePrivateKey, trigger: 'none' },
        ],
      },
    };
  },
  created() {
    this.calculateAvailable();
  },
  computed: {
    isSubmitButtonDisabled() {
      return !this.selectKeyForm.network || !this.selectKeyForm.address;
    },
    isAddKeyButtonDisabled() {
      return !this.selectKeyForm.network || !this.selectKeyForm.privateKey;
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
    addKeyToStorage() {
      try {
        const address = this.storage.addKey(
          this.selectKeyForm.network,
          this.selectKeyForm.privateKey,
        );
        this.setLastAddress(address);
        return true;
      } catch (e) {
        return false;
      }
    },
    handleAddKey() {
      this.$refs.form.validateField('privateKey', (error) => {
        if (error.length === 0) {
          this.calculateAvailable();
        }
      });
    },
    handleNetworkChange(value) {
      this.clearValidation();
      this.setLastNetwork(value);
    },
    calculateAvailable() {
      this.availableKeys = this.storage.getAvailableKeys();

      if (Object.keys(this.availableKeys).length > 0) {
        this.networksList = Object.keys(this.availableKeys);
      } else {
        this.networksList = this.storage.getSupportedNetworks();
      }

      this.setLastUsedValues();
    },
    clearValidation() {
      this.$refs.form.clearValidate();
    },
    setLastUsedValues() {
      const lastNetwork = localStorage.getItem('lastNetwork');
      if (lastNetwork && lastNetwork in this.availableKeys) {
        this.selectKeyForm.network = lastNetwork;
        const lastAddress = localStorage.getItem('lastAddress');
        if (lastAddress && this.addresses.indexOf(lastAddress) > -1) {
          this.selectKeyForm.address = lastAddress;
        }
      }
    },
    submit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.$emit('sign');
        }
      });
    },
    toggleShowKey() {
      const keyInput = document.getElementById('private-key-input');
      keyInput.type = keyInput.type === 'password' ? 'text' : 'password';
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
};
</script>
<style>
.submit-button {
  margin-top: 30px;
}

#add-key-btn {
  margin-left: 5px;
}
</style>
