<script>
    import { getContext, setContext } from 'svelte';

    //Components
    import { Modals, Components } from '../Router.svelte';
    const { Button } = Components;
    //Stores 
    import { BalancesStore } from '../../js/stores/stores'
	//Context
    const { closeModal } = getContext('app_functions');

	setContext('coinmodify_functions', {
        nextPage: () => currentStep = currentStep + 1,
        setPage: (num) => currentStep = num,
        setSelectedCoin: (coin) => selectedCoin = coin,
        setHash: (value) => hash = value,
        getSelectedAccount: () => {return selectedCoin},
        setDappInfo: (value) => dappInfo = value,
        getDappInfo: () => {return dappInfo},
        setResult: (result) => resultInfo = result,
        setMessage: (msg) => message = msg,
        home: () => currentStep = 1,
        close: () => closeModal(),
        deleteCoin: (resolve) => deleteCoin(resolve),
    });
    
    let resultInfo = {}
    let message = '';
    let hash = '';
    let selectedCoin;
    let dappInfo = undefined;
    let steps = [
        {page: 'CoinOptions', cancelButton: false},
        {page: 'CoinEditNickname', cancelButton: true},
        {page: 'CoinDelete', cancelButton: true},
        {page: 'CoinDeleting', cancelButton: false},
        {page: 'ResultBox', cancelButton: false},
        {page: 'MessageBox', cancelButton: false},
    ]
    let currentStep = 1;

    const deleteCoin = (resolve, string) => {
        chrome.runtime.sendMessage({type: 'coinStoreDelete', data: {account: selectedCoin, string: hash}}, (result) => {
            if (!result || chrome.runtime.lastError) {
                resolve(false)
            }
            BalancesStore.refreshAllCache()
            resolve(result)
        })
    }
</script>

<style>
.coin-modify{
    width: 550px;
    background: inherit;
}
.cancel-button{
    display: flex;
    justify-content: center;
}
</style>

<div class="coin-modify">
    <svelte:component this={Modals[steps[currentStep - 1].page]} coin={selectedCoin} result={resultInfo} {message} />
    {#if steps[currentStep - 1].cancelButton}
        <div class="cancel-button">
            <Button id="cancel-modal-btn"
                    classes={'button__text text-caption'} 
                    width={'125px'}
                    height={'24px'}
                    padding={0}
                    name="Cancel" 
                    click={() => closeModal()} />    
        </div>
    {/if}
</div>