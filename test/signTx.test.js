import { createLocalVue, mount } from '@vue/test-utils';
import ElementUI from 'element-ui';
import VueClipboard from 'vue-clipboard2';
import sign from '../src/popup/components/signTx';
import storage from '../src/utils/key_storage';

const localVue = createLocalVue();
localVue.use(ElementUI);
localVue.use(VueClipboard);

describe('unlock.test.js', () => {
  let wrapper;
  const txData = '095ea7b30000000000000000000000007657ca877fac31d20528b473162e39b6e152fd2e00000000000000000000000000000000000000000000003635c9adc5dea00000';
  const tx = `f8693e8504a817c80082b2089453e546387a0d054e7ff127923254c0a679da6dbf80b844${txData}808080`;

  beforeAll(() => {
    storage.unlockStorage('12345');
    storage.addKey('ETH-TESTNET', '3a1076bf45ab87712ad64ccb3b10217737f7faacbf2872e88fdd9a537d8fe266');
    localStorage.setItem('lastNetwork', 'ETH-TESTNET');
    localStorage.setItem('lastAddress', 'c2d7cf95645d33006175b78989035c7c9061d3f9');
  });

  beforeEach(() => {
    wrapper = mount(
      sign,
      {
        propsData: { storage },
        localVue,
      },
    );
  });

  test('signs transaction', () => {
    const button = wrapper.find('.submit-button');
    const unsignedTxInput = wrapper.find('textarea');
    const signedTxInput = wrapper.findAll('textarea').at(1);

    unsignedTxInput.element.value = tx;
    unsignedTxInput.trigger('input');

    button.trigger('click');

    expect(signedTxInput.element.value.length).toBeGreaterThan(tx.length);
    expect(signedTxInput.element.value).toMatch(txData);
  });

  test('shows copy to clipboard button instead of sign button after successful signing', () => {
    const button = wrapper.find('.submit-button');
    const unsignedTxInput = wrapper.find('textarea');

    unsignedTxInput.element.value = tx;
    unsignedTxInput.trigger('input');

    button.trigger('click');

    expect(wrapper.find('.copy-button').exists()).toBe(true);
    expect(wrapper.find('.submit-button').exists()).toBe(false);
  });

  test('enables button when unsigned transaction is given', () => {
    expect(wrapper.find('.submit-button').element.disabled).toBe(true);
    const input = wrapper.find('textarea');
    input.element.value = 'invalid_tx';
    input.trigger('input');
    expect(wrapper.find('.submit-button').element.disabled).toBe(false);
  });

  test('displays error on failed signing', () => {
    const input = wrapper.find('textarea');
    const button = wrapper.find('.submit-button');
    input.element.value = 'invalid_tx';
    input.trigger('input');
    button.trigger('click');
    expect(wrapper.find('.el-form-item__error').text()).toEqual('Invalid transaction');
  });
});
