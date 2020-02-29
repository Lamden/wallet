<script>
    import { onMount, getContext, setContext } from 'svelte';
    
	//Stores
    import { CoinStore, coinMeta, password, breadcrumbs } from '../../js/stores/stores.js';

    //Components
    import { Modals, Components } from '../Router.svelte';
    const { Button } = Components;

	//Context
    const { closeModal } = getContext('app_functions');

	setContext('coinmodify_functions', {
        nextPage: () => currentStep = currentStep + 1,
        setPage: (num) => currentStep = num,
        setSelectedCoin: (coin) => selectedCoin = coin,
        setResult: (result) => resultInfo = result,
        setMessage: (msg) => message = msg,
        home: () => currentStep = 1,
        close: () => closeModal(),
        deleteCoin: (resolve) => deleteCoin(resolve),
    });
    
    let resultInfo = {}
    let message = '';
    let selectedCoin;
    let steps = [
        {page: 'CoinOptions', cancelButton: false},
        {page: 'CoinEditNickname', cancelButton: true},
        {page: 'CoinDelete', cancelButton: true},
        {page: 'CoinDeleting', cancelButton: false},
        {page: 'ResultBox', cancelButton: false},
        {page: 'MessageBox', cancelButton: false},
    ]
    let currentStep = 1;

    function deleteCoin(resolve){
        chrome.runtime.sendMessage({type: 'coinStoreDelete', data: selectedCoin}, (result) => {
            if (!result || chrome.runtime.lastError) {
                resolve(false)
            }
            resolve(result)
        })
    }
</script>

<style>
.coin-modify{
    width: 750px;
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
            <Button classes={'button__text text-caption'} 
                    width={'125px'}
                    height={'24px'}
                    padding={0}
                    name="Cancel" 
                    click={() => closeModal()} />    
        </div>
    {/if}
</div>