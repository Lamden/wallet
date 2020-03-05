<script>
import {onMount} from 'svelte'
    //Stores
    import { CoinStore } from '../../js/stores/stores.js';

    //Router
    import { CoinDivider } from '../Router.svelte';

    //images
    import successCircle from '../../img/menu_icons/icon_success_circle.svg';
    import errorCircle from '../../img/menu_icons/icon_error-circle.svg';
    
    //Props
    export let txData;
    
    $: txInfo = txData.txInfo;
    $: error = txData.resultInfo.type === "error";
    $: errorMsg = () => {
        if (typeof txData.resultInfo.subtitle === 'string' ) return error ? txData.resultInfo.subtitle : '';
        if (typeof txData.resultInfo.subtitle === 'object' ) return error ? txData.resultInfo.title : '';
        return '';
    }
    $: stampsUsed = txData.resultInfo.stampUsed

    onMount(() => {
        console.log(txData)
    })

    const openHashLink = () => {
        window.open(`${txData.network}/tx?hash=${txData.hash}`, '_blank');
    }

</script>


<style>
.tx-container{
    padding: 12px 0;
}
.info-box{
    justify-content: space-between;
}

.icon-box {
    justify-content: flex-start;
    width: 30%;
    min-width: fit-content;
}

.args{
    flex-grow: 1;
}

.stamps{
    justify-content: flex-start;
    align-items: center;
    min-width: fit-content;
    width: 30%;
}
.stamps-title{
    margin-right: 5px;
}

.method-name{
    margin-left: 20px;
}

.error-msg{
    display: flex;
    align-content: center;
    margin-left: 60px;
    height: 20px;
}
.starting-margin{
    margin-left: 60px; 
}

.item-margin{
    margin-left: 6px;
}

.icon-size{
    width: 27px;
    height: 25px;
    margin: 0px 17px;
}
.time-date{
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    min-width: fit-content;
    flex-grow: 1;
}


</style>

<div class='tx-container flex-column'>
    <div class="hash-link flex-column text-subtitle2 starting-margin">
        <div class="hash" on:click={openHashLink}>{txData.hash}</div>
    </div>
    <div class="info-box flex-row text-body1">
        <div class="icon-box flex-row text-body1">
            <div class="icon-size">{@html error ? errorCircle : successCircle}</div>
                <div class="flex-row">
                    <div>{`contract : `}</div>
                    <div class="text-primary-dark item-margin">{` ${txInfo.contractName}`}</div>
                </div>
                <div class="flex-row method-name">
                    <div>{`method : `}</div>
                    <div class="text-primary-dark item-margin">{` ${txInfo.methodName}`}</div>
                </div>
        </div>

        <div class="time-date">
            <div> {new Date(txData.timestamp).toLocaleDateString()} </div>
            <div> {new Date(txData.timestamp).toLocaleTimeString()} </div>
        </div>
    </div>
    <div class="starting-margin send-info">
        {#if txInfo.contractName === 'currency' && txInfo.methodName === 'transfer'}
            <div class="flex-row stamps">
                <div class="stamps-title">{`Amount `}</div>
                <div class="text-primary-dark">{txInfo.kwargs.amount || 0}</div>
            </div>
            <div class="flex-row stamps">
                <div class="stamps-title">{`To `}</div>
                <div class="text-primary-dark">{txInfo.kwargs.to || 0}</div>
            </div>
        {/if}
        <div class="flex-row stamps">
            <div class="stamps-title">{`Stamps Used `}</div>
            <div class="text-primary-dark">{stampsUsed}</div>
        </div>
    </div>
    {#if error}
        <div class="error-msg starting-margin text-subtitle text-primary-dark">
            {errorMsg()}
        </div>
    {/if}
</div>
<CoinDivider />

