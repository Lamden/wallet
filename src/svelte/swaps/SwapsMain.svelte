<script>
    import { setContext, getContext } from 'svelte';

	//Components
    import { Components, SwapsPages }  from '../Router.svelte'
    const { Steps, Step } = Components;
    import NavLogo from '../nav/NavLogo.svelte';

    //Stores
    import { SwapsStore, currentNetwork, networkKey } from '../../js/stores/stores.js'

    //Context
    const { switchPage } = getContext('app_functions');

    setContext('functions', {
        changeStep: (step) => {
            if (step === 0 && currentStep === 0) switchPage('Swaps');
            else if (step === 0) currentStep = back;
            else currentStep = step;
        },
        setSwapInfo: (info) => {swapInfo = info},
        getSwapInfo: () => { return swapInfo },
        setMetamaskApprovalResponse: (txResponse) => {metamaskApprovalResponse = txResponse},
        setHasPreviousApproval: (value) => hasPreviousApproval = value,
        setMetamaskTxResponse: (txResponse, amount) => {metamaskSwapTxResponse = txResponse; createSwap(amount)},
        setSwapStatus: (info) => {swapStatus = info},
        getSwapStatus: () => { return swapStatus },
        setSwapResult: (info) => {swapResult = info; updateSwap()},
        getSwapResult: () => { return swapResult },
        setAnswers: (value) => answers = value,
        getAnswers: () => {return answers},
        setLamdenWallet: (wallet) => lamdenWallet = wallet,
        getLamdenWallet: () => { return lamdenWallet },
        getLamdenAddress: () => { return lamdenWallet.vk },
        getEthAddress: () => { return swapInfo.address },
        getTokenBalance: () => { return swapInfo.tokenBalance.value },
        getApprovalAmount: () => { return swapAmount },
        getChainInfo: () => { return swapInfo.chainInfo},
        getTxHash: (type) => { return getTxHash(type)},
        createSwap: () => createSwap(),
        isContinue: false,
        getStepList: () => progressSteps
    });

    let currentStep = 0;
    let swapInfo = {};
    let lamdenWallet = {}
    let swapAmount = 0;
    let metamaskApprovalResponse = {};
    let metamaskSwapTxResponse = {};
    let swapStatus = {};
    let swapResult = {};
    let answers = [];
    let hasPreviousApproval = false;

    let steps = [
        {page: 'SwapsDisclaimer_Questions', hideSteps: false, back: 0},
        {page: 'SwapsDisclaimer_TokensExchange', hideSteps: false, back: 0},
        {page: 'SwapsDisclaimer_ExchangeTerms', hideSteps: false, back: 0},
        {page: 'SwapsChooseLamden', hideSteps: false, back: 0},
        {page: 'SwapsConnectMetamask', hideSteps: false, back: 3},
        {page: 'SwapsSendApproval', hideSteps: false, back: 4},
        {page: 'SwapsSendEthTx', hideSteps: false, back: 0, hideBack: true},
        {page: 'SwapsPerformSwap', hideSteps: false, back: 0, hideBack: true}
    ]

    let progressSteps = [
                {number: 1, name: 'Disclaimer & Questionnaire', desc: 'accept'},
                {number: 2, name: 'Lamden Account', desc: 'choose'},
                {number: 3, name: 'MetaMask', desc: 'connect'},
                {number: 4, name: `Ethereum ${$currentNetwork.currencySymbol}`, desc: 'approve & send'},
                {number: 5, name: `Lamden ${$currentNetwork.currencySymbol}`, desc: 'receive'}
            ]

    $: currentPage = steps[currentStep].page;
    $: hideSteps = steps[currentStep].hideSteps;
    $: back = steps[currentStep].back;
    $: hideBack = steps[currentStep].hideBack ? false : true;

    const getTxHash = (type) => {
        if (type === "approval") return metamaskApprovalResponse.transactionHash
        if (type === "swapTx") return metamaskSwapTxResponse.transactionHash
    }

    const createSwap = (amount) => {
        swapAmount = amount;
        SwapsStore.createSwap(
            networkKey($currentNetwork),
            swapInfo,
            getTxHash("swapTx"), 
            getTxHash("approval"),
            lamdenWallet.vk, 
            amount, 
            answers
        )
    }

    const updateSwap = () => {
        if (swapResult.success) SwapsStore.updateLamdenTxHash(networkKey($currentNetwork), getTxHash("swapTx"), swapResult.success)
        if (swapResult.error) SwapsStore.updateStatus(networkKey($currentNetwork), getTxHash("swapTx"), "error", swapResult.error, swapResult.hash)
    }
    
</script>


<div class="flow-layout">
    <div class="flow-header">
        <NavLogo />
    </div>
    <div class="flow-content">
        <svelte:component this={SwapsPages[currentPage]} />
    </div>
    <div class="flow-steps" class:flow-hide-steps={hideSteps}>
        <Steps {back} {hideBack}/>
    </div>
</div>

