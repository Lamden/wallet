import { createLocalVue, mount } from '@vue/test-utils';
import ElementUI from 'element-ui';
import manage from '../src/popup/components/manageKeys';
import storage from '../src/utils/key_storage';

const localVue = createLocalVue();
localVue.use(ElementUI);

describe('manageKeys.test.js', () => {
  let wrapper;

  beforeEach(() => {
    localStorage.clear();
    storage.unlockStorage('12345');
    storage.addKey('ETH-TESTNET', '3a1076bf45ab87712ad64ccb3b10217737f7faacbf2872e88fdd9a537d8fe266');
    storage.addKey('BTC-TESTNET', 'cSYq9JswNm79GUdyz6TiNKajRTiJEKgv4RxSWGthP3SmUHiX9WKe');

    wrapper = mount(
      manage,
      {
        propsData: { storage },
        localVue,
        stubs:
          {
            'el-select': '<input class="select" />',
          },
        sync: false,
      },
    );
  });

  test('removes selected key', () => {
    wrapper.setData({
      removeKeyForm: {
        network: 'ETH-TESTNET',
        address: 'c2d7cf95645d33006175b78989035c7c9061d3f9',
      },
    });
    wrapper.vm.$forceUpdate();
    wrapper.find('.submit-button').trigger('click');
    expect(storage.getAvailableKeys()).toEqual({
      'BTC-TESTNET': [
        'msJ2ucZ2NDhpVzsiNE5mGUFzqFDggjBVTM',
      ],
    });
  });

  test('disables inputs and button when there are no keys in storage', (done) => {
    localStorage.clear();
    wrapper.vm.updateAvailable();
    localVue.nextTick(() => {
      expect(wrapper.findAll('.select').at(0).element.disabled).toBe(true);
      expect(wrapper.findAll('.select').at(1).element.disabled).toBe(true);
      expect(wrapper.find('.submit-button').element.disabled).toBe(true);
      done();
    });
  });

  test('emits event when back button is clicked', () => {
    wrapper.find('.back-button').trigger('click');
    expect(wrapper.emitted().select).toBeTruthy();
  });

  test('shows number of keys in the manage tab label', () => {
    expect(wrapper.find('#tab-manage').element.textContent).toBe('Manage keys (2)');
  });

  test('updates available addresses and selected address on network change', () => {
    expect(wrapper.vm.addresses).toEqual(['msJ2ucZ2NDhpVzsiNE5mGUFzqFDggjBVTM']);
    wrapper.setData({
      removeKeyForm: {
        network: 'ETH-TESTNET',
      },
    });
    wrapper.vm.handleNetworkChange();
    expect(wrapper.vm.addresses).toEqual(['c2d7cf95645d33006175b78989035c7c9061d3f9']);
    expect(wrapper.vm.removeKeyForm.address).toEqual('c2d7cf95645d33006175b78989035c7c9061d3f9');
  });
});
