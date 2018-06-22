import { createLocalVue, mount } from '@vue/test-utils';
import ElementUI from 'element-ui';
import selectKey from '../src/popup/components/selectKey';
import storage from '../src/utils/key_storage';

const localVue = createLocalVue();
localVue.use(ElementUI);

describe('selectKey.test.js', () => {
  let wrapper;

  describe('first use - empty storage', () => {
    beforeEach(() => {
      localStorage.clear();
      storage.unlockStorage('12345');

      wrapper = mount(
        selectKey,
        {
          propsData: { storage },
          localVue,
          stubs:
            {
              'el-select': '<input/>',
            },
        },
      );
    });

    test('renders private key input when storage is empty', () => {
      expect(wrapper.find('#private-key-input').exists()).toBe(true);
    });

    test('enables add key button when network and key are given', () => {
      expect(wrapper.find('#add-key-btn').element.disabled).toBe(true);
      wrapper.setData({
        selectKeyForm: {
          network: 'ETH-TESTNET',
          privateKey: '3a1076bf45ab87712ad64ccb3b10217737f7faacbf2872e88fdd9a537d8fe266',
        },
      });
      wrapper.vm.$forceUpdate();
      expect(wrapper.find('#add-key-btn').element.disabled).toBe(false);
    });

    test('removes private key input when private key is added', () => {
      wrapper.setData({
        selectKeyForm: {
          network: 'ETH-TESTNET',
          privateKey: '3a1076bf45ab87712ad64ccb3b10217737f7faacbf2872e88fdd9a537d8fe266',
        },
      });
      wrapper.vm.$forceUpdate();
      wrapper.find('#add-key-btn').trigger('click');
      expect(wrapper.find('#private-key-input').exists()).toBe(false);
    });

    test('sets available networks and addresses when private key is added', () => {
      wrapper.setData({
        selectKeyForm: {
          network: 'ETH-TESTNET',
          privateKey: '3a1076bf45ab87712ad64ccb3b10217737f7faacbf2872e88fdd9a537d8fe266',
        },
      });
      wrapper.vm.$forceUpdate();
      wrapper.find('#add-key-btn').trigger('click');
      expect(wrapper.vm.networksList).toEqual(['ETH-TESTNET']);
      expect(wrapper.vm.addresses).toEqual(['c2d7cf95645d33006175b78989035c7c9061d3f9']);
    });
  });

  describe('storage with keys', () => {
    beforeEach(() => {
      localStorage.clear();
      storage.unlockStorage('12345');
      storage.addKey('ETH-TESTNET', '3a1076bf45ab87712ad64ccb3b10217737f7faacbf2872e88fdd9a537d8fe266');
      storage.addKey('BTC-TESTNET', 'cSYq9JswNm79GUdyz6TiNKajRTiJEKgv4RxSWGthP3SmUHiX9WKe');

      wrapper = mount(
        selectKey,
        {
          propsData: { storage },
          localVue,
          stubs:
            {
              'el-select': '<input/>',
            },
        },
      );
    });

    test('does not render private key input when there are keys in storage', () => {
      expect(wrapper.find('#private-key-input').exists()).toBe(false);
    });

    test('enables submit button when network and address are given', () => {
      expect(wrapper.find('.submit-button').element.disabled).toBe(true);
      wrapper.setData({
        selectKeyForm: {
          network: 'ETH-TESTNET',
          address: 'c2d7cf95645d33006175b78989035c7c9061d3f9',
        },
      });
      wrapper.vm.$forceUpdate();
      expect(wrapper.find('.submit-button').element.disabled).toBe(false);
    });

    test('populates available networks with networks from storage', () => {
      expect(wrapper.vm.networksList).toEqual(['BTC-TESTNET', 'ETH-TESTNET']);
    });

    [
      ['ETH-TESTNET', 'c2d7cf95645d33006175b78989035c7c9061d3f9'],
      ['BTC-TESTNET', 'msJ2ucZ2NDhpVzsiNE5mGUFzqFDggjBVTM'],
    ].forEach(([network, address]) => {
      test('updates available addresses when network is selected', () => {
        wrapper.setData({
          selectKeyForm: { network },
        });
        wrapper.vm.$forceUpdate();
        expect(wrapper.vm.addresses).toEqual([address]);
      });
    });

    test('emits event when submit button is clicked', () => {
      wrapper.setData({
        selectKeyForm: {
          network: 'ETH-TESTNET',
          address: 'c2d7cf95645d33006175b78989035c7c9061d3f9',
        },
      });
      wrapper.vm.$forceUpdate();
      wrapper.find('.submit-button').trigger('click');
      expect(wrapper.emitted().sign).toBeTruthy();
    });
  });
});
