<script>
    //Stores
    import { allTotals } from '../../js/stores.js';

    //Utils
    import { copyToClipboard } from '../../js/utils.js'


    export let coin;
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
    <span><small>{`${coin.name} - ${coin.nickname}`}</small></span>
    <span><small>{`${coin.balance} (${coin.symbol})`}</small></span>
</div>
<a href="javascript:void(0)" on:click={ () => copyToClipboard(coin.vk) }>{coin.vk}</a>
<small>click to copy public key to clipboard</small>

<div>
    Amount
    <input type="text" bind:value={tx_value} />
    <small>USD Value 0.0001</small>
</div>
<div>
    To Address
    <input type="text" bind:value={reciever_address} />
</div>
