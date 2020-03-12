<script>
    import { getContext } from 'svelte'

    //Components
    import { Components } from '../Router.svelte';
    const { Button } = Components;

    //Images
    import successCircle from '../../img/menu_icons/icon_success_circle.svg';
    import errorCircle from '../../img/menu_icons/icon_error-circle.svg';
    import warning from '../../img/menu_icons/icon_warning.svg';

    //Context
    const { getModalData } = getContext('app_functions');

    const { txData, closeModal, coin  } = getModalData();

    $: txInfo = txData.txInfo;
    $: type = txData.resultInfo.type;
    $: resultInfo = txData.resultInfo;
    $: errorInfo = resultInfo.errorInfo || [];
    $: timestamp = new Date(txData.timestamp).toLocaleString()

</script>

<style>
.message-box{
    min-width: 500px;
}

.section{
    margin-top: 1rem;
}

.result-info{
    align-items: center;
}

.result-message{
    align-items: center;
    justify-content: center;
    margin-right: 22px;
}

.item-title{
    margin-right: 10px;
}

.icon{
    margin-right: 14px;
    width: 22px;
    height: 22px;
}

.checkmark{
    width: 22px;
}

.errors{
    color: red;
}

.buttons{
    padding: 42px 0;
    justify-content: center;
}
</style>

<div class="message-box flex-column">
    <h1>Transaction Information</h1>
    <div class="flex-row text-body2">
        {#if typeof txData.hash !== 'undefined'}
            <div class="item-title">Hash</div>
            <div class="text-body2 text-primary-dark">{txData.hash}</div>
        {/if}
    </div>
    <div class="flex-row text-body2">
        <div class="item-title">TimeStamp</div>
        <div class="text-primary-dark">{timestamp}</div>
    </div>
    <div class="result-info flex-column">
        <div class="result-message flex-row text-body2">
            {#if type === 'error'}<div id={"error"} class="icon">{@html errorCircle}</div>{/if}  
            {#if type === 'warning'}<div id={"warning"} class="icon">{@html warning}</div>{/if}
            {#if type === 'success'}<div id={"success"} class="icon checkmark">{@html successCircle}</div>{/if}
            <h4>{resultInfo.title}</h4>
        </div>
        <div class="text-subtitle3">{resultInfo.subtitle}</div>
        <div class="text-subtitle2">{resultInfo.message}</div>
        
    </div>

    {#if errorInfo.length > 0}
        <h4>Errors</h4>
        {#each errorInfo as error}
            <div class="errors text-body2">{error}</div>
        {/each}
    {/if}

    <h4>Transaction Details</h4>
    <div>
        <div class="flex-row text-body2">
            <div class="item-title">Wallet Nickname</div>
            <div class="text-primary-dark">{coin.nickname}</div>
        </div>
        <div class="flex-row text-body2">
            <div class="item-title">Sender Key</div>
            <div class="text-primary-dark">{txInfo.senderVk}</div>
        </div>
        <div class="flex-row text-body2">
            <div class="item-title">Contract Name</div>
            <div class="text-primary-dark">{txInfo.contractName}</div>
        </div>
        <div class="flex-row text-body2">
            <div class="item-title">Method Name</div>
            <div class="text-primary-dark">{txInfo.methodName}</div>
        </div>
        <div class="flex-row text-body2">
            <div class="item-title">Stamp Limit</div>
            <div class="text-primary-dark">{txInfo.stampLimit}</div>
        </div>
    </div>
    <div>
        <div class="section text-body1">Kwargs</div>
        {#each Object.keys(txInfo.kwargs) as kwarg}
            <div class="flex-row text-body2">
                <div class="item-title">{kwarg}</div>
                <div class="text-primary-dark">{txInfo.kwargs[kwarg]}</div>
            </div>
        {/each}
    </div>

    <div class="buttons flex-row">
        <Button 
            id={'txInfoBox-back-btn'} 
            classes={'button__solid button__purple'} 
            width={'232px'}
            margin={'0 7px'}
            name={"back"}
            click={() => closeModal()} />
    </div>
</div>
