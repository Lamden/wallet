<script>
    import { onMount } from 'svelte'
    export let pendingTransaction

    onMount(() => {
        console.log(pendingTransaction)
    })
</script>

<style>
.pending-transaction{

}

.hash{

}

.time-date{
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    min-width: fit-content;
    flex-grow: 1;
}
</style>


<div class='pending-transaction flex-column'>
    <div class="time-date">
        <div> {`Sent ${new Date(pendingTransaction.txSendResult.timestamp).toLocaleString()}`} </div>
    </div>
    <div class="hash">
        <div> {pendingTransaction.txHash}</div>
    </div>
</div>