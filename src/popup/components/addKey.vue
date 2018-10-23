<template>
  <div>
    <el-form :model="addKeyForm">
      <p class="input-description">Network</p>
      <el-form-item prop="network">
        <el-select
          auto-complete="true"
          v-model="addKeyForm.network"
          @change="resetError"
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
      <p class="input-description">Label (optional)</p>
      <el-form-item prop="label">
        <el-input
          v-model="addKeyForm.label"
          class="long-input"
          maxlength="20"
          placeholder="Enter label" />
      </el-form-item>
      <p class="input-description">Private Key</p>
      <el-form-item prop="privateKey" :error="error">
        <el-input
          v-model="addKeyForm.privateKey"
          @input="resetError"
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
    </el-form>
  </div>
</template>
<script>
import errorMixin from '../mixins/error';

export default {
  props: ['storage'],
  mixins: [errorMixin],
  data() {
    return {
      addKeyForm: {
        network: '',
        privateKey: '',
        label: '',
      },
      networksList: this.storage.getSupportedNetworks(),
    };
  },
  computed: {
    isAddKeyButtonDisabled() {
      return !this.addKeyForm.network || !this.addKeyForm.privateKey;
    },
  },
  methods: {
    addKeyToStorage() {
      const address = this.storage.addKey(
        this.addKeyForm.network,
        this.addKeyForm.privateKey,
        this.addKeyForm.label,
      );
      this.setLastNetwork(this.addKeyForm.network);
      this.setLastAddress(address);
    },
    handleAddKey() {
      try {
        this.addKeyToStorage();
        this.addKeyForm.privateKey = '';
        this.addKeyForm.label = '';
        this.$emit('added');
      } catch (e) {
        this.setError('Invalid private key');
      }
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
  },
};
</script>
<style>
#add-key-btn {
  margin-left: 5px;
}
</style>
