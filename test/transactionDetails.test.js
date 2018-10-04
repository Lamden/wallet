import { createLocalVue, mount } from '@vue/test-utils';
import ElementUI from 'element-ui';
import transactionDetails from '../src/popup/components/transactionDetails';

const localVue = createLocalVue();
localVue.use(ElementUI);

describe('tranasctionDetails.test.js', () => {
  let wrapper;

  describe('extractDetailsFromEth', () => {
    const refundTx = '0xf8ab820126843b9aca00830186a094ce07ab9477bc20790b88b398a2a9e0f626c7d26380b844f66c75e5bbe4d5cd6' +
      '912a71bffb87d2f947c6f5101c89a44000000000000000000000000000000000000000000000000d867f293ba129629a9f9355fa285b8d' +
      '3711a90921ca0072f47d9ba2bb0d40f8cce6dc05ae3915fcd41693f547fd8efef8467bf2ec78fa01d70f38f800bdf9bad5c709ff8c9948' +
      '2dbeb5d5c7f2195adf6a18282dd01d82f';

    const redeemTx = '0xf88981af843b9aca00830186a094ce07ab9477bc20790b88b398a2a9e0f626c7d26380a4eda1122caf1bda832a650' +
      'fe01e752466da03dd9bb05d2bf3fb7360aecf6f65b7da023c651ba058a6b15a04f4304e7b419fe8d03968acfb949f85e2341bcf3a733e2' +
      'fffc5255aa0624ba57de2e2f18c5a5a7a87d74d021d5b5ab2f4b8dae6572f26784f167d1d1e';

    const atomicSwapTx = '0xf90132820137850306dc42008302251694ce07ab9477bc20790b88b398a2a9e0f626c7d263865af3107a4000b' +
      '8c47337c993000000000000000000000000000000000000000000000000000000005b87aeccf714d9f27131ef2e4ea5dbc25972dbb1f50' +
      'b7f73000000000000000000000000000000000000000000000000d867f293ba129629a9f9355fa285b8d3711a909200000000000000000' +
      '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000' +
      '000000000000000000000000000000000000000000000000000000000000000001ca039dcaccce3dcacc9bc141832c980ed10ae7cc0b14' +
      '3bdc9318ba0a1195e4e305da02171f8a926421ac98bd78c922323260c8294e1a53983283165ba3c58ee2d2aad';

    const atomicSwapTokenTx = '0xf9012b820162843b9aca008302c12e94ce07ab9477bc20790b88b398a2a9e0f626c7d26380b8c47337c9' +
      '93000000000000000000000000000000000000000000000000000000005bacf0c73d085dc345e443ec2d627d1d0291f8330d7dd1640000' +
      '00000000000000000000000000000000000000000000d867f293ba129629a9f9355fa285b8d3711a909200000000000000000000000053' +
      'e546387a0d054e7ff127923254c0a679da6dbf000000000000000000000000000000000000000000000000000000000000000100000000' +
      '000000000000000000000000000000000000000000038d7ea4c680001ca08fbcbd7c51658ba26b6ead7ecb6c6f7b5baca8fb32dfeb1adf' +
      '091406004739d7a03dd1138b6bcf4ec1a897b9900f4bb58c4d471043b203982dec41c01ba2202373';

    const approveTx = '0xf8aa820168843b9aca0082b1889453e546387a0d054e7ff127923254c0a679da6dbf80b844095ea7b30000000000' +
      '00000000000000ce07ab9477bc20790b88b398a2a9e0f626c7d263000000000000000000000000000000000000000000000000002386f2' +
      '6fc100001ca07fa5641cfe70ea131f0e393230bebd237d0d8f5d502e368a160d4ee9e8d40608a022673e264ce60df8e3eb3e787a2c6600' +
      'bdaf386e0db3b3ab06222cdae668505c';

    const transferTx = '0xf86f8232d985037baef359830186a094d867f293ba129629a9f9355fa285b8d3711a9092884563918244f400008' +
      '01ba020feda6bddda27f1f545ae84226d7a811d0b1c7ec14fa40f068288c6aea1e88ca00c96371d3e7fc1ea49ba347d7e4dd2ab16326ef' +
      'b0c79ca1231fb77b1216fb2a4';

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

  describe('extractDetailsFromBtc', () => {
    const refundTx = '0100000001637780a27c5c35c6e365f6256c61a0c107eb1896e75928b33ed79804c7319b350000000054004c5163a61' +
      '46fc5c37c106c50bded33b35cd48771c818016a2c8876a9143f8870a5633e4fdac612fba47525fef082bbe9616704c8a9825bb17576a91' +
      '4812ff3e5afea281eb3dd7fce9b077e4ec6fba08b6888ac0000000001404b4c00000000001976a914812ff3e5afea281eb3dd7fce9b077' +
      'e4ec6fba08b88acc8a9825b';

    const redeemTx = '0100000001637780a27c5c35c6e365f6256c61a0c107eb1896e75928b33ed79804c7319b350000000075202f47c6303' +
      '5e0e7cb91bbd133ba777744be017cdb01dbd991e0064177a18c23eb514c5163a6146fc5c37c106c50bded33b35cd48771c818016a2c887' +
      '6a9143f8870a5633e4fdac612fba47525fef082bbe9616704c8a9825bb17576a914812ff3e5afea281eb3dd7fce9b077e4ec6fba08b688' +
      '8ac0000000001404b4c00000000001976a9143f8870a5633e4fdac612fba47525fef082bbe96188ac00000000';

    const atomicSwapTx = '0100000001a33b6620d661cbcb66b55aaa92035b7b35be8c615ad543c13c04c2fe7040391e01000000000000000' +
      '002809698000000000017a91470c8a1bdc8562687140dbcaf23899371b0c9b934878dc67f18000000001976a914812ff3e5afea281eb3d' +
      'd7fce9b077e4ec6fba08b88ac00000000';

    const transferTx = '01000000011635376c0db52c71efc64a8549d659f357f8e8883e4234741fd5acd9d519c29b0100000000000000000' +
      '25e1d0000000000001976a9143f8870a5633e4fdac612fba47525fef082bbe96188ac11753705000000001976a914812ff3e5afea281eb' +
      '3dd7fce9b077e4ec6fba08b88ac00000000';

    beforeEach(() => {
      wrapper = mount(
        transactionDetails,
        {
          propsData: {
            signData: {
              network: 'BTC-TESTNET',
              address: 'msJ2ucZ2NDhpVzsiNE5mGUFzqFDggjBVTM',
              rawTx: '',
              contract: '63a61410e782cf04f3fdca80e303788f769b17f58f58798876a9143f8870a5633e4fdac612fba47525fef082bbe96' +
                '16704981db75bb17576a914812ff3e5afea281eb3dd7fce9b077e4ec6fba08b6888ac',
            },
          },
          localVue,
        },
      );
    });

    test('atomic swap transaction details', () => {
      const expected = [
        [
          {
            label: wrapper.vm.labels.value,
            value: '10000000',
          },
          {
            label: wrapper.vm.labels.participantAddress,
            value: 'mmJtKA92Mxqfi3XdyGReza69GjhkwAcBN1',
          },
          {
            label: wrapper.vm.labels.expirationDate,
            value: '2018-10-05 08:15:20 (UTC)',
          },
          {
            label: wrapper.vm.labels.txType,
            value: 'Atomic swap',
          },
        ],
        [
          {
            label: wrapper.vm.labels.value,
            value: '411027085',
          },
          {
            label: wrapper.vm.labels.txType,
            value: 'Coin transfer',
          },
          {
            label: wrapper.vm.labels.recipientAddress,
            value: 'msJ2ucZ2NDhpVzsiNE5mGUFzqFDggjBVTM',
          },
        ],
      ];

      expect(wrapper.vm.extractDetailsFromBtc(atomicSwapTx)).toEqual(expected);
    });

    test('redeem transaction details', () => {
      const expected = [
        [
          {
            label: wrapper.vm.labels.txType,
            value: 'Redeem swap',
          },
          {
            label: wrapper.vm.labels.expirationDate,
            value: '2018-08-26 13:23:20 (UTC)',
          },
          {
            label: wrapper.vm.labels.secretHash,
            value: '6fc5c37c106c50bded33b35cd48771c818016a2c',
          },
          {
            label: wrapper.vm.labels.recipientAddress,
            value: 'mmJtKA92Mxqfi3XdyGReza69GjhkwAcBN1',
          },
          {
            label: wrapper.vm.labels.value,
            value: '5000000',
          },
        ],
      ];

      expect(wrapper.vm.extractDetailsFromBtc(redeemTx)).toEqual(expected);
    });

    test('refund transaction details', () => {
      const expected = [
        [
          {
            label: wrapper.vm.labels.txType,
            value: 'Refund swap',
          },
          {
            label: wrapper.vm.labels.expirationDate,
            value: '2018-08-26 13:23:20 (UTC)',
          },
          {
            label: wrapper.vm.labels.secretHash,
            value: '6fc5c37c106c50bded33b35cd48771c818016a2c',
          },
          {
            label: wrapper.vm.labels.participantAddress,
            value: 'mmJtKA92Mxqfi3XdyGReza69GjhkwAcBN1',
          },
          {
            label: wrapper.vm.labels.recipientAddress,
            value: 'msJ2ucZ2NDhpVzsiNE5mGUFzqFDggjBVTM',
          },
          {
            label: wrapper.vm.labels.value,
            value: '5000000',
          },
        ],
      ];

      expect(wrapper.vm.extractDetailsFromBtc(refundTx)).toEqual(expected);
    });

    test('coin transfer transaction details', () => {
      const expected = [
        [
          {
            label: wrapper.vm.labels.value,
            value: '7518',
          },
          {
            label: wrapper.vm.labels.txType,
            value: 'Coin transfer',
          },
          {
            label: wrapper.vm.labels.recipientAddress,
            value: 'mmJtKA92Mxqfi3XdyGReza69GjhkwAcBN1',
          },
        ],
        [
          {
            label: wrapper.vm.labels.value,
            value: '87520529',
          },
          {
            label: wrapper.vm.labels.txType,
            value: 'Coin transfer',
          },
          {
            label: wrapper.vm.labels.recipientAddress,
            value: 'msJ2ucZ2NDhpVzsiNE5mGUFzqFDggjBVTM',
          },
        ],
      ];

      expect(wrapper.vm.extractDetailsFromBtc(transferTx)).toEqual(expected);
    });
  });
});
