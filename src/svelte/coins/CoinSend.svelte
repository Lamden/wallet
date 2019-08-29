<script>
    import { copyToClipboard } from '../../js/utils.js'

    export let coin;
    let selected;
    let tx_value = 0;
    let reciever_address = '';

</script>

<style>
    div{
        display: grid;
    }
</style>

<h2> Send {coin.name} </h2>
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
<a href="javascript:void(0)" on:click={() => copyToClipboard(selected.address, () => { alert('copied!') } )}>copy to clipboard</a>

<div>
    Amount
    <input type="text" bind:value={tx_value} />
    <small>USD Value 0.0001</small>
</div>
<div>
    To Address
    <input type="text" bind:value={reciever_address} />
</div>
