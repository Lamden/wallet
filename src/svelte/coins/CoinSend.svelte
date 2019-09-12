<script>
    //Stores
    import { allTotals } from '../../js/stores.js';

    //Utils
    import { copyToClipboard } from '../../js/utils.js'


    export let coin;
    let selected;
    let tx_value = 0;
    let reciever_address = '';

    $: totalBalance = $allTotals.coinTotals[coin.network][coin.symbol].balance || 0;
    $: totalUSDValue = $allTotals.coinTotals[coin.network][coin.symbol].USD_value || 0;

</script>

<style>
    div{
        display: grid;
    }
</style>

<h2> Send {coin.name} </h2>
<div>
    <span>Public Key</span>
    <span><small>{coin.name} {totalBalance} {coin.symbol}</small></span>
    <span><small>${totalUSDValue}</small></span>
</div>
<div>
    <select id='ddPubkeys' bind:value={selected}>
        {#each  Object.keys(coin.pubkeys) as pubKey}
            <option value={coin.pubkeys[pubKey]}>{coin.pubkeys[pubKey].nickname}</option>
        {/each}
    </select>
</div>
<button on:click={() => copyToClipboard(selected.vk)}>copy to clipboard</button>

<div>
    Amount
    <input type="text" bind:value={tx_value} />
    <small>USD Value 0.0001</small>
</div>
<div>
    To Address
    <input type="text" bind:value={reciever_address} />
</div>
