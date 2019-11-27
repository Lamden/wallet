<script>
    //Stores
    import { CoinStore } from '../../js/stores/stores.js';

    //images
    import { icons } from '../../js/images.js';
    const { handDown, handUp} = icons;
    
    //Props
    export let txInfo;
    
    $: coin = txInfo.coin
    $: icon = txInfo.type === 'Sent' ? handUp :  handDown;

</script>


<style>
.tx-box{
    display: flex;
    flex-direction: row;
    height: 63px;
    padding: 12px 0;
}

.icon-box {
    display: flex;
    align-items: center;
    justify-items: center;
    width: 221px;
}

.icon {
    width: 43px;
    height: 55px;
    margin-right: 15px;
}

.amount{
    flex-grow: 1;
    display: flex;
    align-items: center;
}

.time-date{
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    width: 200px;
}

</style>

<div class="tx-box text-body1">
    <div class="icon-box ">
        <img class="icon" src={icon} alt={`${txInfo.type} logo`} />
        {`${txInfo.type}`} 
    </div>
    <div class="amount text">
        {`${txInfo.amount} ${coin.name} ${coin.symbol}`}
    </div>
    <div class="time-date">
        <div> {new Date(txInfo.date).toLocaleDateString()} </div>
        <div> {new Date(txInfo.date).toLocaleTimeString()} </div>
    </div>
</div>