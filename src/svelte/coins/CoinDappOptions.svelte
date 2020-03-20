<script>
    import { onMount, getContext, setContext } from 'svelte';

	//Stores
    import { DappStore, currentNetwork } from '../../js/stores/stores.js';

    //Components
    import { Modals, Components } from '../Router.svelte';
    const { Button } = Components;

	//Context
    const { closeModal, getModalData } = getContext('app_functions');

	setContext('coinDappOptions_functions', {
        nextPage: () => currentStep = currentStep + 1,
        setPage: (num) => currentStep = num,
        setResult: (result) => resultInfo = result,
        setMessage: (msg) => message = msg,
        home: () => currentStep = 1,
        close: () => closeModal(),
        setPreApprovalAmount: (PreApprovalAmount, networkType) => dappInfo
    });
    
    let resultInfo = {}
    let message = '';
    let modelData = getModalData();
    let coin = modelData.coin;
    let steps = [
        {page: 'CoinDappSettings', cancelButton: false},
        {page: 'CoinDappPreApproval', cancelButton: true},
        {page: 'CoinDappRevoke', cancelButton: true},
        {page: 'MessageBox', cancelButton: true},
        {page: 'MessageBox', cancelButton: false},
    ]
    let currentStep = modelData.startPage;

    $: dappInfo = $DappStore[modelData.dappInfo.url];
    $: stampRatio = $currentNetwork.API.getVariable('stamp_cost', 'S', 'value')

</script>

<style>
.coin-dapp-options{
    width: 750px;
}
.cancel-button{
    display: flex;
    justify-content: center;
}
</style>

<div class="coin-dapp-options">
    <svelte:component this={Modals[steps[currentStep - 1].page]} {coin} {dappInfo} {stampRatio} result={resultInfo} {message} />
    {#if steps[currentStep - 1].cancelButton}
        <div class="cancel-button">
            <Button classes={'button__text text-caption'} 
                    width={'125px'}
                    height={'24px'}
                    padding={0}
                    name="Cancel" 
                    click={() => closeModal()} />    
        </div>
    {/if}
</div>