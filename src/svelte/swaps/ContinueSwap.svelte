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
        getTxHash: () => swap.eth_swap_txHash
    });

    let currentStep = 0;

    let steps = [
        {page: 'SwapsPerformSwap', hideSteps: true}
    ]

    $: swap = $SettingsStore.currentPage.data || undefined

    $: currentPage = steps[currentStep].page;
    $: hideSteps = steps[currentStep].hideSteps;
    $: back = steps[currentStep].back;
    $: hideBack = steps[currentStep].hideBack ? false : true;


    onMount(() => {
        //if (!swap || swap.status === "success") switchPage("Swaps", undefined)
        //switchPage("ContinueSwap", undefined)
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

