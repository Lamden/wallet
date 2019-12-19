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
    $: icon = txData.error ? handDown :  handUp;

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

.details{
    justify-content: center;
    width: 150px;
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
        <img class="icon-size" src={txData.error ? errorCircle : successCircle} alt={`success/failure icon`} />
    </div>
    <div class="args flex-column text-body1">
        {#each Object.keys(txInfo.args) as arg}
            <div class="detail-name no-bottom-margin">{arg}</div>
            <div class="text-primary-dark">
                {txInfo.args[arg].type === 'fixedPoint' ? txInfo.args[arg].value.toFixed(8).toString() : txInfo.args[arg].value}
            </div>
        {/each}
    </div>
    <div class="time-date">
        <div> {new Date(txData.date).toLocaleDateString()} </div>
        <div> {new Date(txData.date).toLocaleTimeString()} </div>
    </div>
</div>
<CoinDivider />