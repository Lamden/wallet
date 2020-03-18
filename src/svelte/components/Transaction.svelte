<script>
    import { getContext, onMount } from 'svelte'

	//Stores
    import { allNetworks, CoinStore } from '../../js/stores/stores.js';

    //Components
	import { Components }  from '../Router.svelte'
    const { Button } = Components;

    //images
    import successCircle from '../../img/menu_icons/icon_success_circle.svg';
    import errorCircle from '../../img/menu_icons/icon_error-circle.svg';

    //Context
    const { openModal, closeModal } = getContext('app_functions');
    
    //Props
    export let txData;

    $: txInfo = txData.txInfo;
    $: senderVk = txInfo.senderVk
    $: coin = $CoinStore.find(f => f.vk === senderVk);
    $: coinNickname = typeof coin === 'undefined' ? '*deleted wallet' : coin.nickname; 
    $: error = txData.resultInfo.type === "error";
    $: stampsUsed = txData.resultInfo.stampUsed
    $: network = $allNetworks.find(f => `${f.host}:${f.port}` === txData.network)
    $: currencySymbol = network.currencySymbol || ''
    $: errorInfo = txData.resultInfo.errorInfo || []
    $: errorMsg = typeof errorInfo[0] === 'undefined' ? "" : errorInfo[0]

    const openHashLink = () => {
        window.open(`${txData.network}/tx?hash=${txData.hash}`, '_blank');
    }

    const processErrorMessage = (err) => {
        if (err === "Transaction sender has too few stamps for this transaction."){
            return `Not enough ${currencySymbol} to complete this transaction`
        }
        else return err
    }

</script>


<style>
.tx-container{
    margin-bottom: 3rem;
    background-color: rgba(38, 38, 38, 0.64);
    border-radius: 4px;
}

.hash-box{
    min-width: fit-content;
    padding: 8px 10px 6px;
    justify-content: space-between;
    border-radius: 4px 4px 0 0;
    background-color: var(--primary-color);        
}

.hash-link{
    word-break: break-word;
}

.time-icon{
    margin-left: 20px;
    min-width: fit-content;
}

.time{
    margin-right: 20px;
}

.error{
    color: red;
}

.nickname{
    min-width: fit-content;
}

.info-box{
    justify-content: space-between;
    padding: 0.5rem 12px 0.5rem 0;
}

.details {
    flex-wrap: wrap;
    align-items: center;
}

.details > div {
    margin-left: 10px;
}

.info{
    margin-top: -1rem;
    margin-bottom: 0.5rem;
    line-height: unset;
}

.item-margin{
    margin-left: 6px;
}

.icon-size{
    min-width: 20px;
    max-width: 20px;
}
.name-button{
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-grow: 1;
    justify-content: flex-end;
    flex-wrap: wrap;
}


</style>

<div class='tx-container flex-column'>
    <div class="hash-box flex-row">
        {#if typeof txData.hash !== 'undefined'}
            <div class="hash-link text-subtitle2 " on:click={openHashLink}>{txData.hash}</div>
        {:else}
            <div class="error text-subtitle2 ">{processErrorMessage(errorMsg)}</div>
        {/if}
        <div class="time-icon flex-row"> 
            <div class="time text-body1"> {new Date(txData.timestamp).toLocaleTimeString()} </div>
            <div class="icon-size">{@html error ? errorCircle : successCircle}</div>
        </div>
        
    </div>
    <div class="info-box starting-margin flex-row text-body1">
        <div class="details flex-row text-body1">
            <div class="flex-row">
                <div>{`contract : `}</div>
                <div class="text-primary-dark item-margin">{` ${txInfo.contractName}`}</div>
            </div>
            <div class="flex-row">
                <div>{`method : `}</div>
                <div class="text-primary-dark item-margin">{` ${txInfo.methodName}`}</div>
            </div>
            {#if txInfo.contractName === 'currency' && txInfo.methodName === 'transfer'}
                <div class="flex-row">
                    <div>{`amount : `}</div>
                    <div class="text-primary-dark item-margin">{`${txInfo.kwargs.amount || 0} ${currencySymbol}`}</div>
                </div>
            {/if}
        </div>

        <div class="flex-row name-button">
            <div class="nickname text-subtitle3 text-primary-dark">{coinNickname}</div>
            <Button 
                name={"tx details"}
                classes="button__transparent button__blue"
                padding={'5px 10px'}
                margin={'0 0 0 10px'}
                click={() => openModal('TxInfoBox', {txData, coin, closeModal})}
            />
        </div>
    </div>
</div>

