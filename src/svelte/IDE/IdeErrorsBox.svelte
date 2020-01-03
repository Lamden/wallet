<script>
export let errorsList = undefined;

</script>

<div class="error-box flex-column">
    {#each errorsList as error}
        <div class="error-line">{error}</div>
    {/each}
</div>