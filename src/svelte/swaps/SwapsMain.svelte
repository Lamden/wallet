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
        setMetamaskTxResponse: (txResponse) => {console.log(txResponse); metamaskTxResponse = txResponse},
        getSwapInfo: () => { return swapInfo },
        getAddress: () => { return swapInfo.address },
        getTokenBalance: () => { return swapInfo.tokenBalance },
        getChainInfo: () => { console.log(swapInfo.chainInfo); return swapInfo.chainInfo} 
    });

    let currentStep = 0;
    let swapInfo = {};
    let metamaskTxResponse = {};

    let SwapsSteps = [
        {page: 'SwapsConnectMetamask', hideSteps: false, back: 0},
        {page: 'SwapsSendApproval', hideSteps: false, back: 0},
    ]

    $: currentPage = SwapsSteps[currentStep].page;
    $: hideSteps = SwapsSteps[currentStep].hideSteps;
    $: back = SwapsSteps[currentStep].back;
    
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

