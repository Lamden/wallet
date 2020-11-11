<script>
    //Stores
    import { CoinStore } from '../../js/stores/stores.js';

    export let pendingTransaction
    export let first
    export let last

    $: senderVk = pendingTransaction.txInfo.senderVk
    $: coin = $CoinStore.find(f => f.vk === senderVk);
    $: coinNickname = coin.nickname
    $: networkType = pendingTransaction.networkInfo.type.toUpperCase()
    $: url = pendingTransaction.networkInfo.url
    $: hash = pendingTransaction.txHash
    $: timestamp = new Date(pendingTransaction.txSendResult.timestamp).toLocaleString()
    $: txInfo = pendingTransaction.txInfo

    const openHashLink = () => {
        window.open(`${url}/tx?hash=${pendingTransaction.txHash}`, '_blank');
    }
</script>

<style>
.pending-transaction{
    height: 62px;
    padding: 0.5rem 0px
}

.padding-top{
    padding-top: 0;
}

.padding-bottom{
    padding-bottom: 0;
}

.divider{
    border-bottom: 1px dashed var(--divider-dark);
}

.info{
    width: 90%;
    justify-content: space-evenly;
}

.item{
    margin-left: 4px;
}

.item-spacing{
    margin-left: 20px;
}

.time-date{
    align-items: flex-end;
    min-width: fit-content;
    justify-content: flex-end;
}
</style>

<div class='pending-transaction flex-row' class:padding-top={first} class:padding-bottom={last} class:divider={!last}>
    <div class="info flex-column">
        <div class="text-subtitle3"> {coinNickname}</div>
        <div class="text-link clickable primary"> {hash}</div>
        <div class="items flex-row">
            <div>{`contract :`}</div>
            <div class="item text-secondary">{txInfo.contractName}</div>
            <div class="item-spacing">{`method :`}</div>
            <div class="item text-secondary">{txInfo.methodName}</div>
            <div class="item-spacing">{`kwargs :`}</div>
            <div class="item text-secondary">{Object.keys(txInfo.kwargs).length}</div>
        </div>
    </div>
    <div class="time-date flex-column">
        <div class="text-subtitle2"> {`Sent ${timestamp}`} </div>
        <div class="text-secondary text-body2"> {`${networkType}`} </div>
        <div class="text-subtitle1 text-secondary"> {`${url}`} </div>
    </div>
</div>