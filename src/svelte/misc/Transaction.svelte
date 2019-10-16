<script>

export let txInfo;
export let coin;

console.log(txInfo)
console.log(coin)

$: symbol = coin.is_token ? coin.token_symbol : coin.symbol;

</script>

<a href={txInfo.txResult.transaction_link} class="txInfo-link" rel="noopener noreferrer" target="_blank">
    {#if txInfo.txResult.sent}
        {`Sent ${txInfo.txInfo.value} (${ symbol }) on ${new Date(txInfo.txResult.sent)}`}
    {:else}
        {`Failed ${txInfo.txInfo.value} (${ symbol })`}
    {/if}
</a>