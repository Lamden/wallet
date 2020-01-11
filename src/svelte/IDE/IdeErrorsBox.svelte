<script>
    export let errorsList = undefined;

</script>

<style>
.error-line{
    color: red;
    
}

</style>

<div class="flex-column text-body1">
    {#if errorsList.length === 0}
        <div class="no-errors">{'No Errors'}</div>
    {:else}
        {#each errorsList as error}
            <div class="error-line">{error}</div>
        {/each}
    {/if}
</div>