<script>
	//Components
    import { PendingTransaction }  from '../Router.svelte'

    export let pendingTransactions
</script>

<style>
.pending-box{
    border-bottom: 1px solid #383838;
    padding: 0px 0px 20px;
}

</style>

<div class="pending-box">
    {#if pendingTransactions.length > 0}
        {#each pendingTransactions as pendingTransaction}
            <PendingTransaction {pendingTransaction}/>
        {/each}
    {:else}
        <div class="text-primary-dark text-body2">No pending transactions</div>
    {/if}
</div>