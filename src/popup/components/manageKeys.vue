<template>
  <el-tabs v-model="activeName" @tab-click="handleChange">
    <el-tab-pane :label="`Manage keys (${numberOfKeys})`" name="manage" >
      <el-form :model="removeKeyForm">
        <p class="input-description">Network</p>
        <el-form-item prop="network">
          <el-select
            auto-complete="true"
            v-model="removeKeyForm.network"
            class="long-input"
            @change="handleNetworkChange"
            filterable
            :disabled="networksList.length === 0"
            placeholder="Select your network">
              <el-option
                v-for="item in networksList"
                :key="item"
                :label="item"
                :value="item">
              </el-option>
          </el-select>
        </el-form-item>
        <p class="input-description">Wallet Address</p>
        <el-form-item prop="address">
          <el-select
            auto-complete="true"
            v-model="removeKeyForm.address"
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
        class="submit-button auto-width"
        :disabled="isRemoveButtonDisabled"
        @click="remove">
        Remove key
      </el-button>
    </el-tab-pane>
    <el-tab-pane label="Add new key" name="add">
      <add-key
        :storage="storage"
        @added="successMessage"></add-key>
    </el-tab-pane>
    <el-button
      class="submit-button back-button"
      :class="[activeName === 'manage' ? 'row-up' : '']"
      icon="el-icon-back"
      @click="$emit('select')">
      Back
    </el-button>
  </el-tabs>
</template>
<script>
import addKey from './addKey';

export default {
  props: ['storage'],
  data() {
    return {
      activeName: 'manage',
      availableKeys: {},
      networksList: [],
      removeKeyForm: {
        network: '',
        address: '',
      },
    };
  },
  computed: {
    addresses() {
      if (this.removeKeyForm.network in this.availableKeys) {
        const addressesList = this.availableKeys[this.removeKeyForm.network];
        return addressesList.sort();
      }
      return [];
    },
    isRemoveButtonDisabled() {
      return !this.removeKeyForm.network || !this.removeKeyForm.address;
    },
    numberOfKeys() {
      return Object.values(this.availableKeys).reduce(
        (a, b) => a + b.length,
        0,
      );
    },
  },
  created() {
    this.updateAvailable();
  },
  methods: {
    updateAvailable() {
      this.availableKeys = this.storage.getAvailableKeys();
      this.networksList = Object.keys(this.availableKeys);

      if (!(this.removeKeyForm.network in this.availableKeys)) {
        [this.removeKeyForm.network] = this.networksList;
      }
      [this.removeKeyForm.address] = this.addresses;
    },
    remove() {
      this.storage.removePrivateKey(this.removeKeyForm.network, this.removeKeyForm.address);
      this.updateAvailable();
    },
    handleChange() {
      if (this.activeName === 'manage') {
        this.updateAvailable();
      }
    },
    handleNetworkChange() {
      [this.removeKeyForm.address] = this.addresses;
    },
    successMessage() {
      this.$message({
        message: 'Your key was successfully added!',
        type: 'success',
        customClass: 'centered-message',
      });
    },
  },
  components: {
    'add-key': addKey,
  },
};
</script>
<style>
.back-button {
  display: block;
  margin-left: auto;
  margin-right: 15px;
  transition: none;
}

.row-up {
  margin-top: -40px;
}

.centered-message {
  margin-top: 237px;
}
</style>
