import { createLocalVue, mount } from '@vue/test-utils';
import ElementUI from 'element-ui';
import unlock from '../src/popup/components/unlock';
import storage from '../src/utils/key_storage';

const localVue = createLocalVue();
localVue.use(ElementUI);

describe('unlock.test.js', () => {
  let wrapper;

  beforeAll(() => {
    storage.unlockStorage('12345');
    storage.addKey('ETH-TESTNET', '3a1076bf45ab87712ad64ccb3b10217737f7faacbf2872e88fdd9a537d8fe266');
    storage.lockStorage();
  });

  beforeEach(() => {
    storage.lockStorage();

    wrapper = mount(
      unlock,
      {
        propsData: { storage },
        localVue,
      },
    );
  });

  test('emits event on successful unlock', () => {
    const input = wrapper.find('.short-input input');
    const button = wrapper.find('.unlock button');
    input.setValue('12345');
    button.trigger('click');
    expect(wrapper.emitted().unlocked).toBeTruthy();
  });

  test('displays error on failed unlock', () => {
    const input = wrapper.find('.short-input input');
    const button = wrapper.find('.unlock button');
    input.setValue('1234');
    button.trigger('click');
    expect(wrapper.find('.el-form-item__error').text()).toEqual('Incorrect password');
  });
});
