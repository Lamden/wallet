// import abi from 'abi-decoder';
const abi = require('abi-decoder');

const atomicSwapABIs = [
  {
    constant: false,
    inputs: [
      {
        name: '_expiration',
        type: 'uint256',
      },
      {
        name: '_hash',
        type: 'bytes20',
      },
      {
        name: '_participant',
        type: 'address',
      },
      {
        name: '_token',
        type: 'address',
      },
      {
        name: '_isToken',
        type: 'bool',
      },
      {
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'initiate',
    outputs: [],
    payable: true,
    stateMutability: 'payable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: '',
        type: 'address',
      },
      {
        name: '',
        type: 'bytes20',
      },
    ],
    name: 'swaps',
    outputs: [
      {
        name: 'expiration',
        type: 'uint256',
      },
      {
        name: 'initiator',
        type: 'address',
      },
      {
        name: 'participant',
        type: 'address',
      },
      {
        name: 'value',
        type: 'uint256',
      },
      {
        name: 'isToken',
        type: 'bool',
      },
      {
        name: 'token',
        type: 'address',
      },
      {
        name: 'exists',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_secret',
        type: 'bytes32',
      },
    ],
    name: 'redeem',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_hash',
        type: 'bytes20',
      },
      {
        name: '_participant',
        type: 'address',
      },
    ],
    name: 'refund',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: '_initiator',
        type: 'address',
      },
      {
        indexed: false,
        name: '_participant',
        type: 'address',
      },
      {
        indexed: false,
        name: '_expiration',
        type: 'uint256',
      },
      {
        indexed: false,
        name: '_hash',
        type: 'bytes20',
      },
      {
        indexed: false,
        name: '_token',
        type: 'address',
      },
      {
        indexed: false,
        name: '_isToken',
        type: 'bool',
      },
      {
        indexed: false,
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'InitiateSwap',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: '_participant',
        type: 'address',
      },
      {
        indexed: true,
        name: '_hash',
        type: 'bytes20',
      },
      {
        indexed: false,
        name: '_secret',
        type: 'bytes32',
      },
    ],
    name: 'RedeemSwap',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: '_initiator',
        type: 'address',
      },
      {
        indexed: false,
        name: '_participant',
        type: 'address',
      },
      {
        indexed: false,
        name: '_hash',
        type: 'bytes20',
      },
    ],
    name: 'RefundSwap',
    type: 'event',
  },
];

const tokenABIs = [
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [
      {
        name: '',
        type: 'string',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'spender',
        type: 'address',
      },
      {
        name: 'tokens',
        type: 'uint256',
      },
    ],
    name: 'approve',
    outputs: [
      {
        name: 'success',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'totalSupply',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'from',
        type: 'address',
      },
      {
        name: 'to',
        type: 'address',
      },
      {
        name: 'tokens',
        type: 'uint256',
      },
    ],
    name: 'transferFrom',
    outputs: [
      {
        name: 'success',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [
      {
        name: '',
        type: 'uint8',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: '_totalSupply',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'tokenOwner',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        name: 'balance',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'owner',
    outputs: [
      {
        name: '',
        type: 'address',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [
      {
        name: '',
        type: 'string',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'to',
        type: 'address',
      },
      {
        name: 'tokens',
        type: 'uint256',
      },
    ],
    name: 'transfer',
    outputs: [
      {
        name: 'success',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'spender',
        type: 'address',
      },
      {
        name: 'tokens',
        type: 'uint256',
      },
      {
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'approveAndCall',
    outputs: [
      {
        name: 'success',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'newOwner',
    outputs: [
      {
        name: '',
        type: 'address',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'tokenAddress',
        type: 'address',
      },
      {
        name: 'tokens',
        type: 'uint256',
      },
    ],
    name: 'transferAnyERC20Token',
    outputs: [
      {
        name: 'success',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'tokenOwner',
        type: 'address',
      },
      {
        name: 'spender',
        type: 'address',
      },
    ],
    name: 'allowance',
    outputs: [
      {
        name: 'remaining',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    payable: true,
    stateMutability: 'payable',
    type: 'fallback',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: '_from',
        type: 'address',
      },
      {
        indexed: true,
        name: '_to',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        name: 'tokens',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'tokenOwner',
        type: 'address',
      },
      {
        indexed: true,
        name: 'spender',
        type: 'address',
      },
      {
        indexed: false,
        name: 'tokens',
        type: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
  },
];

abi.addABI(atomicSwapABIs);
abi.addABI(tokenABIs);

// export default abi;
module.exports = abi;
