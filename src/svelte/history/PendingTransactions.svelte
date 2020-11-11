<script>
	//Components
    import { PendingTransaction }  from '../Router.svelte'

    export let pendingTransactions
</script>

<style>
.pending-box{
    border-bottom: 1px solid var(--divider-dark);
    padding: 0px 0px 2rem;
}

</style>

<div class="pending-box">
    {#if pendingTransactions.length > 0}
        {#each pendingTransactions as pendingTransaction, index}
            <PendingTransaction {pendingTransaction} first={index === 0} last={(index + 1) === pendingTransactions.length}/>
        {/each}
    {:else}
        <div class="text-secondary text-body2">No pending transactions</div>
    {/if}
</div>