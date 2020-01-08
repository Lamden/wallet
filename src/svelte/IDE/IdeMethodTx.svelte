<script>
    //Props
    export let modalData;

    $: contractName = modalData.contractName;
    $: methodName = modalData.methodName;
    $: methodArgs = modalData.args;

</script>

{contractName}
{methodName}
{#each methodArgs as arg}
    {arg}
{/each}
