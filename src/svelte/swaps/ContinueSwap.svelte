<script>
    import { onMount, setContext, getContext } from 'svelte';

	//Components
    import { Components, SwapsPages }  from '../Router.svelte'
    const { Steps, Step } = Components;
    import NavLogo from '../nav/NavLogo.svelte';

    //Stores
    import { SwapsStore, currentNetwork, networkKey, SettingsStore } from '../../js/stores/stores.js'

    //Context
    const { switchPage } = getContext('app_functions');

    setContext('functions', {
        getApprovalAmount: () => swap.amount,
        getLamdenAddress: () => swap.lamdenAddress,
        getChainInfo: () => swap.swapInfo.chainInfo,
        getEthAddress: () => swap.swapInfo.address,
        setSwapResult: (info) => updateSwap(info),
        getAnswers: () => swap.answers,
        getTxHash: () => swap.eth_swap_txHash,
        getStepList: () => progressSteps,
        isContinue: true,
    });

    let currentStep = 0;

    let steps = [
        {page: 'SwapsPerformSwap', hideSteps: false, back: false}
    ]

    let progressSteps = [
            {number: 1, name: 'Disclaimers', desc: 'accept'},
            {number: 2, name: 'Lamden Account', desc: 'choose'},
            {number: 3, name: 'Connect MetaMask', desc: 'connect'},
            {number: 4, name: `Ethereum ${$currentNetwork.currencySymbol}`, desc: 'approve & send'},
            {number: 5, name: `Lamden ${$currentNetwork.currencySymbol}`, desc: 'receive'}
        ]

    $: swap = $SettingsStore.currentPage.data || undefined

    $: currentPage = steps[currentStep].page;
    $: hideSteps = steps[currentStep].hideSteps;
    $: back = steps[currentStep].back;
    $: hideBack = steps[currentStep].hideBack ? false : true;


    onMount(() => {
        if (!swap) switchPage("Swaps", undefined)
    })

    const getApprovalAmount = () => {
        SwapStore[networkKey($currentNetwork)][eth]
    }

    const updateSwap = (info) => {
        if (info.success) SwapsStore.updateLamdenTxHash(networkKey($currentNetwork), swap.eth_swap_txHash, info.success)
        if (info.error) SwapsStore.updateStatus(networkKey($currentNetwork), swap.eth_swap_txHash, "error", info.error)
    }
    
</script>


<div class="flow-layout">
    <div class="flow-header">
        <NavLogo />
    </div>

    {#if typeof swap !== 'undefined'}
        <div class="flow-content">
            <svelte:component this={SwapsPages[currentPage]} />
        </div>
    {/if}
    
    <div class="flow-steps" class:flow-hide-steps={hideSteps}>
        <Steps {back} {hideBack}/>
    </div>
</div>

