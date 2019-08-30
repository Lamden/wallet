<script>
    import { copyToClipboard } from '../../js/utils.js'

    export let coin;
    let selected;

</script>

<h2> Receive {coin.name} </h2>
<div>
    <span>Public Key</span>
    <span><small>{coin.name} {coin.totalBalance} {coin.symbol}</small></span>
    <span><small>${coin.totalUsdBalance.toFixed(2)}</small></span>
</div>
<div>
    <select id='ddPubkeys' bind:value={selected}>
        {#each coin.pubkeysList as key}
            <option value={key}>{key.label}</option>
        {/each}
    </select>
</div>
<a href="javascript:void(0)" on:click={() => copyToClipboard(selected.address)}>copy to clipboard</a>