import { createLocalVue, mount } from '@vue/test-utils';
import ElementUI from 'element-ui';
import root from '../src/popup/root';
import storage from '../src/utils/key_storage';

const localVue = createLocalVue();
localVue.use(ElementUI);

describe('popup.test.js', () => {
  let wrapper;

  describe('locked storage', () => {
    beforeEach(() => {
      storage.lockStorage();

      global.chrome = {
        extension: {
          getBackgroundPage: () => ({
            keyStorage: storage,
          }),
        },
      };
      wrapper = mount(root, {
        localVue,
        stubs: {
          'el-select': '<el-input></el-input>',
        },
      });
    });

    test('view set to unlock when storage is locked', () => {
      expect(wrapper.vm.currentView).toEqual('unlock');
    });

    test('view switch to select-key on successful unlock', () => {
      const input = wrapper.find('.short-input input');
      const button = wrapper.find('.unlock button');
      input.setValue('12345');
      button.trigger('click');
      expect(wrapper.vm.currentView).toEqual('select-key');
    });
  });

  describe('unlocked storage', () => {
    beforeEach(() => {
      storage.unlockStorage('12345');

      global.chrome = {
        extension: {
          getBackgroundPage: () => ({
            keyStorage: storage,
          }),
        },
      };
      wrapper = mount(root, {
        localVue,
        stubs: {
          'el-select': '<input/>',
        },
      });
    });

    test('view set to select-key when storage is unlocked', () => {
      expect(wrapper.vm.currentView).toEqual('select-key');
    });
  });
});
