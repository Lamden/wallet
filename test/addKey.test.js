import { createLocalVue, mount } from '@vue/test-utils';
import ElementUI from 'element-ui';
import addKey from '../src/popup/components/addKey';
import storage from '../src/utils/key_storage';

const localVue = createLocalVue();
localVue.use(ElementUI);

describe('addKey.test.js', () => {
  let wrapper;

  beforeEach(() => {
    localStorage.clear();
    storage.unlockStorage('12345');

    wrapper = mount(
      addKey,
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

  test('enables add key button when network and key are given', () => {
    expect(wrapper.find('#add-key-btn').element.disabled).toBe(true);
    wrapper.setData({
      addKeyForm: {
        network: 'ETH-TESTNET',
        privateKey: '3a1076bf45ab87712ad64ccb3b10217737f7faacbf2872e88fdd9a537d8fe266',
      },
    });
    wrapper.vm.$forceUpdate();
    expect(wrapper.find('#add-key-btn').element.disabled).toBe(false);
  });

  test('adds key to storage', () => {
    expect(wrapper.find('#add-key-btn').element.disabled).toBe(true);
    wrapper.setData({
      addKeyForm: {
        network: 'ETH-TESTNET',
        privateKey: '3a1076bf45ab87712ad64ccb3b10217737f7faacbf2872e88fdd9a537d8fe266',
      },
    });
    wrapper.vm.$forceUpdate();
    wrapper.find('#add-key-btn').trigger('click');
    expect(storage.getAvailableKeys()).toEqual({
      'ETH-TESTNET': [
        'c2d7cf95645d33006175b78989035c7c9061d3f9',
      ],
    });
  });

  test('displays error on failed signing', () => {
    wrapper.setData({
      addKeyForm: {
        network: 'ETH-TESTNET',
        privateKey: 'invalid_key',
      },
    });
    wrapper.vm.$forceUpdate();
    wrapper.find('#add-key-btn').trigger('click');
    expect(wrapper.find('.el-form-item__error').text()).toEqual('Invalid private key');
  });
});
