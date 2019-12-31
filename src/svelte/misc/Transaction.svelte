<script>
    //Stores
    import { CoinStore } from '../../js/stores/stores.js';

    //Router
    import { CoinDivider } from '../../js/router.js';

    //images
    import { icons } from '../../js/images.js';
    const { handDown, handUp, errorCircle, successCircle } = icons;
    
    //Props
    export let txData;
    
    $: coin = txData.sender
    $: txInfo = txData.txInfo;
    $: error = txData.resultInfo.type === "error" ? true : false
    $: errorMsg = () => {
        if (typeof txData.resultInfo.subtitle === 'string' ) return error ? txData.resultInfo.subtitle : '';
        if (typeof txData.resultInfo.subtitle === 'object' ) return error ? txData.resultInfo.title : '';
        return '';
    }
    $: icon = error ? handDown :  handUp;
    $: stampsUsed = txData.result.stamps_used ? txData.result.stamps_used : 0;

</script>


<style>
.tx-box{
    display: flex;
    flex-direction: row;
    padding: 12px 0;
}

.hand-icon-box {
    display: flex;
    align-items: center;
    justify-items: center;
    width: 221px;
}

.hand-icon {
    width: 43px;
    height: 55px;
    margin-right: 15px;
}

.args{
    flex-grow: 1;
}

.stamps{
    justify-content: center;
    align-items: center;
    width: 198px;
}

.error-msg{
    display: flex;
    align-content: center;
    margin-left: 220px;
    height: 20px;
}

.icon{
    display: flex;
    align-items: center;
}

.icon-size{
    width: 25px;
    margin: 0 35px;
}
.time-date{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    
    width: 200px;
}

</style>

<div class="tx-box text-body1">
    <div class="hand-icon-box ">
        <img class="hand-icon" src={icon} alt={`hand logo`} />
        <div class="flex-column text-body1">
            {txInfo.contractName}
            <div>{txInfo.methodName}</div>
        </div>
        <img class="icon-size" src={error ? errorCircle : successCircle} alt={`success/failure icon`} />
    </div>
    <div class="args flex-column text-body1">
        {#each Object.keys(txInfo.args) as arg}
            <div class="detail-name no-bottom-margin">{arg}</div>
            <div class="text-primary-dark">
                {txInfo.args[arg].type === 'fixedPoint' ? txInfo.args[arg].value.toFixed(8).toString() : txInfo.args[arg].value}
            </div>
        {/each}
    </div>
    <div class="flex-column stamps">
        <div>{'Stamps Used'}</div>
        <div class="text-primary-dark">{stampsUsed}</div>
    </div>
    <div class="time-date">
        <div> {new Date(txData.date).toLocaleDateString()} </div>
        <div> {new Date(txData.date).toLocaleTimeString()} </div>
    </div>
</div>
{#if error}
    <div class="error-msg text-subtitle text-primary-dark">
        {errorMsg()}
    </div>
{/if}
<CoinDivider />