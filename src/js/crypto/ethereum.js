const validators = require('types-validate-assert')
const { validateTypes } = validators;
const ABIs = require('./eth-abis')
const createMetaMaskProvider = require('metamask-extension-provider')
const Web3 = require('Web3')
var web3;

const ethNetworks = {
    '1': {
        tauContract: '0xc27a2f05fa577a83ba0fdb4c38443c0718356501',
        controller: '0x00000C8e84545a5aF04a308D4c1F2e42Ff1B6C05',
        chainName: 'Main Network',
        tauSymbol: 'TAU',
        blockExplorer: 'https://etherscan.io'
    },
    '42': {
        tauContract: '0x3e26ae9e0ad08de30f28f1f12a73e776729131bd',
        controller: '0x00000C8e84545a5aF04a308D4c1F2e42Ff1B6C05',
        chainName: 'Kovan Network',
        tauSymbol: 'dTAU',
        blockExplorer: 'https://kovan.etherscan.io'
    }
}

const testSendAllowance = (amount) => {
    requestAccount()
    .then(address => {
        console.log(address)
        if (validateTypes.isArrayWithValues(address)){
            sendAllowance(address[0], amount)
            .catch(err => console.log(err))
        }else{
            throw Error(`MetaMask not setup`)
        }
    })
    .catch(err => console.log(err))
}

const getWeb3 = () => {
    if (typeof web3 === 'undefined'){
        const provider = createMetaMaskProvider()
        web3 = new Web3(provider)
        return web3
    }
    return web3
}

const requestAccount = async () => {
    let web3 = getWeb3();
    const getAddress = (address) => {
        if (validateTypes.isArrayWithValues(address)) return address[0]
        else if(validateTypes.isArrayWithValues(address)) return address
        return null
    }
    try {
        return await web3.eth.requestAccounts().then(address => getAddress(address))
    }catch (e){
        throw new Error(e.message)
    }
}

const getChainId = async () => {
    let web3 = getWeb3();
    const chainID = await web3.eth.getChainId()
    if (typeof ethNetworks[chainID] === 'undefined') throw Error(`Unsupported Chain ${chainID}.  Please swich you network in Metamask to Kovan or MainNet.`)
    let chainInfo = {};
    if (typeof ethNetworks[chainID] !== 'undefined')  chainInfo = ethNetworks[chainID]
    return {chainID, ...chainInfo};
}


const sendAllowance = async (userEthAddress, amount) => {
    let web3 = getWeb3();

    let chainInfo = await getChainId()
    if (typeof chainInfo === 'undefined') throw Error('Swaps only supported on Kovan network.  Please swich you network in Metamask to Kovan.')
    if (chainInfo.chainID !== 42) throw Error('Swaps only supported on Kovan network.  Please swich you network in Metamask to Kovan.')
    let ethNetwork = ethNetworks[`${chainInfo.chainID}`]

    // Get ERC20 Token contract instance
    let contract = new web3.eth.Contract(ABIs.ERC20, ethNetwork.tauContract);
    // calculate ERC20 token amount in WEI
    let amountToWei = web3.utils.toWei(amount, 'ether')
    // call transfer function
    return contract.methods.approve(ethNetwork.controller, amountToWei).send({from: userEthAddress})
}

const balanceOfToken = async (ethAddress, contractAddress) => {
    let web3 = getWeb3();
    let contract = new web3.eth.Contract(ABIs.ERC20, contractAddress);
    return await contract.methods.balanceOf(ethAddress).call()
                    .then(res => res / Math.pow(10, 18))
}

const balanceOfTAU = async (userEthAddress) => {
    let chainInfo = await getChainId()
    let ethNetwork = ethNetworks[`${chainInfo.chainID}`]
    let balance = await balanceOfToken(userEthAddress, ethNetwork.tauContract).catch(err => console.log(err))
    return balance
}

const checkTxStatus = async (txHash) => {
    let web3 = getWeb3();
    let response =  await web3.eth.getTransactionReceipt(txHash)
    console.log(response)
    return response
}

module.exports = {
    requestAccount,
    sendAllowance,
    getChainId,
    testSendAllowance,
    balanceOfToken,
    balanceOfTAU,
    checkTxStatus
}