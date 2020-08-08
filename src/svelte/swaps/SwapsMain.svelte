<script>
    import { setContext, getContext } from 'svelte';

	//Components
    import { Components, SwapsPages }  from '../Router.svelte'
    const { Steps, Step } = Components;
    import NavLogo from '../nav/NavLogo.svelte';

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
        setMetamaskTxResponse: (txResponse) => {metamaskTxResponse = txResponse},
        setSwapStatus: (info) => {swapStatus = info},
        getSwapStatus: () => { return swapStatus },
        setSwapResult: (info) => {swapResult = info},
        getSwapResult: () => { return swapResult },
        setLamdenWallet: (wallet) => lamdenWallet = wallet,
        getLamdenWallet: () => { return lamdenWallet },
        getLamdenAddress: () => { return lamdenWallet.vk },
        getEthAddress: () => { return swapInfo.address },
        getTokenBalance: () => { return swapInfo.tokenBalance.value },
        getApprovalAmount: () => { return getApprovalAmount() },
        getChainInfo: () => { return swapInfo.chainInfo},
        getTxHash: () => { return metamaskTxResponse.transactionHash} 
    });

    let currentStep = 0;
    let swapInfo = {};
    let lamdenWallet = {}
    let metamaskTxResponse = {};
    let swapStatus = {};
    let swapResult = {};

    let steps = [
        {page: 'SwapsChooseLamden', hideSteps: false, back: 0},
        {page: 'SwapsConnectMetamask', hideSteps: false, back: 0},
        {page: 'SwapsSendApproval', hideSteps: false, back: 1},
        {page: 'SwapsCheckStatus', hideSteps: false, back: 2},
        {page: 'SwapsPerformSwap', hideSteps: false, back: 0}
    ]

    $: currentPage = steps[currentStep].page;
    $: hideSteps = steps[currentStep].hideSteps;
    $: back = steps[currentStep].back;
    $: hideBack = steps[currentStep].hideBack ? false : true;

    const getApprovalAmount = () => {
        try{
            return metamaskTxResponse.events.Approval.returnValues.value / Math.pow(10, 18)
        }catch (e){
            return 0
        }
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

