import { createLocalVue, mount } from '@vue/test-utils';
import ElementUI from 'element-ui';
import transactionDetails from '../src/popup/components/transactionDetails';

const localVue = createLocalVue();
localVue.use(ElementUI);

describe('tranasctionDetails.test.js', () => {
  let wrapper;
  const refundTx = '0xf8ab820126843b9aca00830186a094ce07ab9477bc20790b88b398a2a9e0f626c7d26380b844f66c75e5bbe4d5cd691' +
    '2a71bffb87d2f947c6f5101c89a44000000000000000000000000000000000000000000000000d867f293ba129629a9f9355fa285b8d3711' +
    'a90921ca0072f47d9ba2bb0d40f8cce6dc05ae3915fcd41693f547fd8efef8467bf2ec78fa01d70f38f800bdf9bad5c709ff8c99482dbeb5' +
    'd5c7f2195adf6a18282dd01d82f';

  const redeemTx = '0xf88981af843b9aca00830186a094ce07ab9477bc20790b88b398a2a9e0f626c7d26380a4eda1122caf1bda832a650fe' +
    '01e752466da03dd9bb05d2bf3fb7360aecf6f65b7da023c651ba058a6b15a04f4304e7b419fe8d03968acfb949f85e2341bcf3a733e2fffc' +
    '5255aa0624ba57de2e2f18c5a5a7a87d74d021d5b5ab2f4b8dae6572f26784f167d1d1e';

  const atomicSwapTx = '0xf90132820137850306dc42008302251694ce07ab9477bc20790b88b398a2a9e0f626c7d263865af3107a4000b8c' +
    '47337c993000000000000000000000000000000000000000000000000000000005b87aeccf714d9f27131ef2e4ea5dbc25972dbb1f50b7f7' +
    '3000000000000000000000000000000000000000000000000d867f293ba129629a9f9355fa285b8d3711a909200000000000000000000000' +
    '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000' +
    '0000000000000000000000000000000000000000000000000000000001ca039dcaccce3dcacc9bc141832c980ed10ae7cc0b143bdc9318ba' +
    '0a1195e4e305da02171f8a926421ac98bd78c922323260c8294e1a53983283165ba3c58ee2d2aad';

  const atomicSwapTokenTx = '0xf9012b820162843b9aca008302c12e94ce07ab9477bc20790b88b398a2a9e0f626c7d26380b8c47337c993' +
    '000000000000000000000000000000000000000000000000000000005bacf0c73d085dc345e443ec2d627d1d0291f8330d7dd16400000000' +
    '0000000000000000000000000000000000000000d867f293ba129629a9f9355fa285b8d3711a909200000000000000000000000053e54638' +
    '7a0d054e7ff127923254c0a679da6dbf00000000000000000000000000000000000000000000000000000000000000010000000000000000' +
    '0000000000000000000000000000000000038d7ea4c680001ca08fbcbd7c51658ba26b6ead7ecb6c6f7b5baca8fb32dfeb1adf0914060047' +
    '39d7a03dd1138b6bcf4ec1a897b9900f4bb58c4d471043b203982dec41c01ba2202373';

  const approveTx = '0xf8aa820168843b9aca0082b1889453e546387a0d054e7ff127923254c0a679da6dbf80b844095ea7b3000000000000' +
    '000000000000ce07ab9477bc20790b88b398a2a9e0f626c7d263000000000000000000000000000000000000000000000000002386f26fc1' +
    '00001ca07fa5641cfe70ea131f0e393230bebd237d0d8f5d502e368a160d4ee9e8d40608a022673e264ce60df8e3eb3e787a2c6600bdaf38' +
    '6e0db3b3ab06222cdae668505c';

  const transferTx = '0xf86f8232d985037baef359830186a094d867f293ba129629a9f9355fa285b8d3711a9092884563918244f40000801' +
    'ba020feda6bddda27f1f545ae84226d7a811d0b1c7ec14fa40f068288c6aea1e88ca00c96371d3e7fc1ea49ba347d7e4dd2ab16326efb0c7' +
    '9ca1231fb77b1216fb2a4';

  describe('extractDetailsFromEth', () => {
    beforeEach(() => {
      wrapper = mount(
        transactionDetails,
        {
          propsData: {
            signData: {
              network: 'ETH',
              address: '0x999f348959e611f1e9eab2927c21e88e48e6ef45',
              rawTx: '',
            },
          },
          localVue,
        },
      );
    });

    test('atomic swap transaction details', () => {
      const expected = [
        {
          label: wrapper.vm.labels.recipientAddress,
          value: '0xce07ab9477bc20790b88b398a2a9e0f626c7d263',
        },
        {
          label: wrapper.vm.labels.txType,
          value: 'Atomic swap',
        },
        {
          label: wrapper.vm.labels.value,
          value: '100000000000000',
        },
        {
          label: wrapper.vm.labels.participantAddress,
          value: '0xd867f293ba129629a9f9355fa285b8d3711a9092',
        },
        {
          label: wrapper.vm.labels.expirationDate,
          value: '2018-08-30 08:46:04 (UTC)',
        },
      ];

      expect(wrapper.vm.extractDetailsFromEth(atomicSwapTx)).toEqual(expected);
    });

    test('atomic swap token transaction details', () => {
      const expected = [
        {
          label: wrapper.vm.labels.recipientAddress,
          value: '0xce07ab9477bc20790b88b398a2a9e0f626c7d263',
        },
        {
          label: wrapper.vm.labels.txType,
          value: 'Atomic swap token',
        },
        {
          label: wrapper.vm.labels.tokenAddress,
          value: '0x53e546387a0d054e7ff127923254c0a679da6dbf',
        },
        {
          label: wrapper.vm.labels.value,
          value: '1000000000000000',
        },
        {
          label: wrapper.vm.labels.participantAddress,
          value: '0xd867f293ba129629a9f9355fa285b8d3711a9092',
        },
        {
          label: wrapper.vm.labels.expirationDate,
          value: '2018-09-27 15:01:27 (UTC)',
        },
      ];

      expect(wrapper.vm.extractDetailsFromEth(atomicSwapTokenTx)).toEqual(expected);
    });

    test('redeem transaction details', () => {
      const expected = [
        {
          label: wrapper.vm.labels.recipientAddress,
          value: '0xce07ab9477bc20790b88b398a2a9e0f626c7d263',
        },
        {
          label: wrapper.vm.labels.txType,
          value: 'Redeem swap',
        },
        {
          label: wrapper.vm.labels.secret,
          value: '0xaf1bda832a650fe01e752466da03dd9bb05d2bf3fb7360aecf6f65b7da023c65',
        },
      ];

      expect(wrapper.vm.extractDetailsFromEth(redeemTx)).toEqual(expected);
    });

    test('refund transaction details', () => {
      const expected = [
        {
          label: wrapper.vm.labels.recipientAddress,
          value: '0xce07ab9477bc20790b88b398a2a9e0f626c7d263',
        },
        {
          label: wrapper.vm.labels.txType,
          value: 'Refund swap',
        },
        {
          label: wrapper.vm.labels.secretHash,
          value: '0xbbe4d5cd6912a71bffb87d2f947c6f5101c89a44',
        },
        {
          label: wrapper.vm.labels.participantAddress,
          value: '0xd867f293ba129629a9f9355fa285b8d3711a9092',
        },
      ];

      expect(wrapper.vm.extractDetailsFromEth(refundTx)).toEqual(expected);
    });

    test('approve token transaction details', () => {
      const expected = [
        {
          label: wrapper.vm.labels.recipientAddress,
          value: '0x53e546387a0d054e7ff127923254c0a679da6dbf',
        },
        {
          label: wrapper.vm.labels.txType,
          value: 'Approve token',
        },
        {
          label: wrapper.vm.labels.approvedFor,
          value: '0xce07ab9477bc20790b88b398a2a9e0f626c7d263',
        },
        {
          label: wrapper.vm.labels.value,
          value: '10000000000000000',
        },
      ];

      expect(wrapper.vm.extractDetailsFromEth(approveTx)).toEqual(expected);
    });

    test('coin transfer transaction details', () => {
      const expected = [
        {
          label: wrapper.vm.labels.recipientAddress,
          value: '0xd867f293ba129629a9f9355fa285b8d3711a9092',
        },
        {
          label: wrapper.vm.labels.txType,
          value: 'Coin transfer',
        },
        {
          label: wrapper.vm.labels.value,
          value: '5000000000000000000',
        },
      ];

      expect(wrapper.vm.extractDetailsFromEth(transferTx)).toEqual(expected);
    });

  });
});
