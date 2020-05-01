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
            if (step === -1 && currentStep === 0) switchPage('Swaps');
            else if (step === -1) currentStep = back;
            else currentStep = step;
        },
        setSwapInfo: (info) => {console.log(info); swapInfo = info},
        getSwapInfo: () => { return swapInfo },
        setMetamaskTxResponse: (txResponse) => {console.log(txResponse); metamaskTxResponse = txResponse},
        setSwapStatus: (info) => {console.log(info); swapStatus = info},
        getSwapStatus: () => { return swapStatus },
        setSwapResult: (info) => {console.log(info); swapResult = info},
        getSwapResult: () => { return swapResult },
        setLamdenWallet: (wallet) => lamdenWallet = wallet,
        getLamdenWallet: () => { return lamdenWallet },
        getLamdenAddress: () => { return lamdenWallet.vk },
        getEthAddress: () => { return swapInfo.address },
        getTokenBalance: () => { return swapInfo.tokenBalance.value },
        getApprovalAmount: () => { return getApprovalAmount() },
        getChainInfo: () => { console.log(swapInfo.chainInfo); return swapInfo.chainInfo},
        getTxHash: () => { console.log(metamaskTxResponse.transactionHash); return metamaskTxResponse.transactionHash} 
    });

    let currentStep = 0;
    let swapInfo = {};
    let lamdenWallet = {}
    let metamaskTxResponse = {};
    let swapStatus = {};
    let swapResult = {};

    let SwapsSteps = [
        {page: 'SwapsChooseLamden', hideSteps: false, back: 0},
        {page: 'SwapsConnectMetamask', hideSteps: false, back: 0},
        {page: 'SwapsSendApproval', hideSteps: false, back: 1},
        {page: 'SwapsCheckStatus', hideSteps: false, back: 2},
        {page: 'SwapsPerformSwap', hideSteps: false, back: 0},
        {page: 'SwapsFinish', hideSteps: false, back: 0},
    ]

    $: currentPage = SwapsSteps[currentStep].page;
    $: hideSteps = SwapsSteps[currentStep].hideSteps;
    $: back = SwapsSteps[currentStep].back;

    const getApprovalAmount = () => {
        try{
            return metamaskTxResponse.events.Approval.returnValues.value / Math.pow(10, 18)
        }catch (e){
            console.log(e)
            return 0
        }
    }
    
</script>

<style>
.layout{
    display: flex;
    flex-direction: column;
    flex-grow: 1;
}

.content{
    flex-grow: 1;
    display: flex;
}

.header{
    display: flex;
    flex-direction: row;
    position: absolute;
    left: 0%;
    right: 0%;
    top: 0%;
    bottom: 0%;
    right: 0;
    height: 97px;
    border-bottom: 1px solid #3D3D3D;
}

.steps{
    display: flex;
    justify-content: center;
    height: 180px;
}

.hide-steps{
    display: none;
}

:global(.swaps-intro){
    flex-grow:1;
    padding-top: 100px;
}
:global(.content-left){
    box-sizing: border-box;
    padding: 0px 24px 0 60px;
    width: 316px;
    justify-content: flex-start;
}
:global(.content-right){
    align-items: center;
    justify-content: flex-start;
    flex-grow: 1;
    padding: 3rem 5% 0;
    width: calc(100vw - 498px);
    max-width: 800px;
}
:global(.content-left > .text-box){
    margin: 1rem 0;
}
:global(.content-left > .buttons){
    flex-grow: 1;
    max-height: 250px;
    justify-content: flex-end;
}

@media (min-width: 900px) {
    :global(.content-left){
        padding: 0px 24px 0 242px;
        min-width: 498px;
    }
    :global(.content-right){
        width: calc(100vw - 625px);
    }
}
</style>

<div class="layout">
    <div class="header">
        <NavLogo />
    </div>
    <div class="content">
        <svelte:component this={SwapsPages[currentPage]} />
    </div>
    <div class="steps" class:hide-steps={hideSteps}>
        <Steps {back}/>
    </div>
</div>

