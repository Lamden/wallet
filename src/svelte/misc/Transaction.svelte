<script>
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
    $: stampsUsed = txData.stampUsed ? txData.stampUsed : 0;

</script>


<style>
.tx-box{
    display: flex;
    flex-direction: row;
    padding: 12px 0;
    justify-content: space-between;
}

.icon-box {
    align-items: center;
    justify-content: center;
}

.args{
    flex-grow: 1;
}

.stamps{
    justify-content: center;
    align-items: center;
}
.stamps-title{
    margin-right: 5px;
}

.error-msg{
    display: flex;
    align-content: center;
    margin-left: 220px;
    height: 20px;
}

.icon-size{
    width: 27px;
    height: 25px;
    margin: 0px 17px;
}
.time-date{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

</style>

<div class="tx-box text-body1">
    <div class="icon-box flex-row text-body1">
        <div class="icon-size">{@html error ? errorCircle : successCircle}</div>
        <div>{`${txInfo.contractName} > ${txInfo.methodName}`}</div>
    </div>
    <div class="flex-row stamps">
        <div class="stamps-title">{`Stamps Used `}</div>
        <div class="text-primary-dark">{stampsUsed}</div>
    </div>
    <div class="time-date">
        <div> {new Date(txData.timestamp).toLocaleDateString()} </div>
        <div> {new Date(txData.timestamp).toLocaleTimeString()} </div>
    </div>
</div>
{#if error}
    <div class="error-msg text-subtitle text-primary-dark">
        {errorMsg()}
    </div>
{/if}
<CoinDivider />