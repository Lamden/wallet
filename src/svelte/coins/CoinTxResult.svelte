<script>
    import { onMount, getContext } from 'svelte';

    //Components
    import { Components } from '../../js/router.js';
    const { Button } = Components;

    //Images
    import { icons } from '../../js/images.js';
    const { errorCircle, checkmarkWhite } = icons;

	//Context
    const { closeModal } = getContext('app_functions');
    const { home } = getContext('tx_functions');

    //Props
    export let txData;

    $: error = txData.txResult.error;
    $: resultHeader = error ? 'Transaction Failed to Send' : 'Transaction Sent Successfully'
    $: resultMessage = error ? 'Transaction Failed' : 'Transaction Sent'

    onMount(() => {
        console.log(txData)
    })

</script>

<style>
.tx-result{
    align-items: center;    
}
.icon-background{
    align-items: center;
    height: 20px;
    width: 20px;
    margin-right: 10px;
    background-color: #89ED5B;
    border-radius: 20px;
}

.icon{
    margin-right: 10px;
}

.checkmark{
    width: 83%;
    margin-left: 1px;
    filter: invert(1);
    display: flex;
    align-items: center;
}

.buttons{
    padding: 65px 0 25px;
}

.message{
    align-items: center;
    padding-top: 65px;
}
</style>

<div class="tx-result flex-column">
    <h5>{resultHeader}</h5> 
    {#if error}
        <div class="text-body1">{`Error: ${error}`}</div>
    {/if}

    <div class="message flex-row">
        {#if error}
            <img class="icon" src={errorCircle} alt="error icon" />
        {:else}
            <div class="icon-background flex-row">
                <img class="icon checkmark" src={checkmarkWhite} alt="checkmark icon" />
            </div>
        {/if}
        <h6>{resultMessage}</h6>
    </div>

    <div class="buttons flex-row">
        <Button classes={'button__solid button__purple'} 
            width={'232px'}
            margin={'0 23px 0 0'}
            name="Home" 
            click={() => closeModal()} />
        <Button classes={'button__solid'} 
            width={'232px'}
            margin={'0 0 0 0'}
            name="New Transaction" 
            click={() => home()} />
    </div>

</div>