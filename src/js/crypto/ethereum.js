const validators = require('types-validate-assert')
const { validateTypes } = validators;
const ABIs = require('./eth-abis')
const createMetaMaskProvider = require('metamask-extension-provider')
const Web3 = require('web3')
var web3;

const ethNetworks = {
    '1': {
        tauContract: '0xc27a2f05fa577a83ba0fdb4c38443c0718356501',
        swapContract: '0x5e20ddde9ec5386ea2f4d24b7f33d747169d6b07',
        chainName: 'Main Network',
        tauSymbol: 'TAU',
        blockExplorer: 'https://etherscan.io'
    },
    '42': {
        tauContract: '0x4ffc081f1538b40ba5086a742fb8a46e31117f0e',
        swapContract: '0x5e20ddde9ec5386ea2f4d24b7f33d747169d6b07',
        chainName: 'Kovan Network',
        tauSymbol: 'dTAU',
        blockExplorer: 'https://kovan.etherscan.io'
    }
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
        else if(validateTypes.isStringWithValue(address)) return address
        return null
    }
    try {
        let response = await web3.eth.requestAccounts().then(address => getAddress(address))
        return response
    }catch (e){
        return {error: e.message}
    }
}

const getChainInfo = async () => {
    let web3 = getWeb3();
    const chainID = await web3.eth.getChainId()
    if (typeof ethNetworks[chainID] === 'undefined') return {error: `Unsupported Chain ${chainID}.  Please swich you network in Metamask to Kovan or MainNet.`}
    let chainInfo = {};
    if (typeof ethNetworks[chainID] !== 'undefined')  chainInfo = ethNetworks[chainID]
    return {chainID, ...chainInfo};
}


const sendApprovalTx = async (approvalFrom, approvalTo, tokenContract, amount ) => {
    
    let web3 = getWeb3();
    let amountToWei;

    if (!web3.utils.isAddress(approvalFrom)) return {error: "'Approval From' ETH address is invalid"}
    if (!web3.utils.isAddress(approvalTo)) return {error: "'Approval To' ETH address is invalid"}
    if (!web3.utils.isAddress(tokenContract)) return {error: 'Not an ERC20 contract address'}

    //Convert Amount to WEI
    try{
        amountToWei = web3.utils.toWei(amount.toString(), 'ether')
        alert("SWAP TX: " + JSON.stringify({amount, amountToWei}))
    } catch (e) {
        return {error: 'Invalid Amount provided'}
    }

    // Get ERC20 Token contract instance
    let contract = new web3.eth.Contract(ABIs.ERC20, tokenContract);

    //Create Approve Transactions
    let approvalTx = contract.methods.approve(approvalTo, amountToWei)

    //Send Transfer
    try{
        let response =  await approvalTx.send({from: approvalFrom}).then(res => {console.log(res); return res})
        return response
    }catch (e) {
        return {error: e.message}
    }
}

const sendSwapContractApproval = async (userEthAddress, amount) => {
    
    let chainInfo = await getChainInfo()
    if (typeof chainInfo.error !== 'undefined') return chainInfo
    if (chainInfo.chainID !== 42) return {error: 'Swaps only supported on Kovan network.  Please swich you network in Metamask to Kovan.'}
    let ethNetwork = ethNetworks[`${chainInfo.chainID}`]
    return await sendApprovalTx(userEthAddress, ethNetwork.swapContract, ethNetwork.tauContract, amount)
}

const sendSwapTx = async (ethSenderAddress, tokenContract, amount, lamdenAddress ) => {
    let web3 = getWeb3();
    let amountToWei;

    if (!web3.utils.isAddress(ethSenderAddress)) return {error: "'Approval From' ETH address is invalid"}
    if (!web3.utils.isAddress(tokenContract)) return {error: 'Not an ERC20 contract address'}

    //Convert Amount to WEI
    try{
        amountToWei = web3.utils.toWei(amount.toString(), 'ether')
        alert("SWAP TX: " + JSON.stringify({amount, amountToWei}))
    } catch (e) {
        return {error: 'Invalid Amount provided'}
    }

    // Get SwapContract ABI
    let contract = new web3.eth.Contract(ABIs.swapContract, tokenContract);
    //Create Approve Transactions
    let swap = contract.methods.swap(lamdenAddress, amountToWei)

    //Send Transfer
    try{
        let response =  await swap.send({from: ethSenderAddress})
        return response
    }catch (e) {
        return {error: e.message}
    }
}

const sendSwapContractTx = async (ethAddress, amount, lamdenAddress) => {
    let chainInfo = await getChainInfo()
    if (typeof chainInfo.error !== 'undefined') return chainInfo
    if (chainInfo.chainID !== 42) return {error: 'Swaps only supported on Kovan network.  Please swich you network in Metamask to Kovan.'}
    let ethNetwork = ethNetworks[`${chainInfo.chainID}`]
    let res = await sendSwapTx(ethAddress, ethNetwork.swapContract, amount, lamdenAddress)
    return res
}


const balanceOfToken = async (ethAddress, contractAddress) => {
    let web3 = getWeb3();
    if (!web3.utils.isAddress(ethAddress)) return {error: "ETH address is invalid"}
    if (!web3.utils.isAddress(contractAddress)) return {error: 'Not an ERC20 contract address'}

    //Create ERC20 contract instance
    let contract = new web3.eth.Contract(ABIs.ERC20, contractAddress);
    //Create a BalanceOf transactions and send
    let balanceTx = await contract.methods.balanceOf(ethAddress)
                    .call()
                    .then(res => res / Math.pow(10, 18))

    return {value: balanceTx}
}

const balanceOfTAU = async (userEthAddress) => {
    let chainInfo = await getChainInfo()
    if (typeof chainInfo.error !== 'undefined') return chainInfo
    let ethNetwork = ethNetworks[`${chainInfo.chainID}`]
    let balance = await balanceOfToken(userEthAddress, ethNetwork.tauContract)
    return balance
}

const checkTxStatus = async (txHash) => {
    let web3 = getWeb3();
    try{
        let response =  await web3.eth.getTransactionReceipt(txHash)
        return response
    } catch (e) {}
    return {error: 'TxHash not found'}
}

module.exports = {
    requestAccount,
    sendApprovalTx,
    sendSwapContractTx,
    sendSwapContractApproval,
    getChainInfo,
    getWeb3,
    balanceOfToken,
    balanceOfTAU,
    checkTxStatus
}