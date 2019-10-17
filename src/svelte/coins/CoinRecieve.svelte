<script>
    //Utils
    import { copyToClipboard } from '../../js/utils.js'

    //Props
    export let coin;

    $: symbol = coin.is_token ? coin.token_symbol : coin.symbol;
    $: balance = coin.balance ? coin.balance : 0;

</script>

<h2> Receive {coin.name} </h2>
<div>
    <span>
        Public Key
        <small>{coin.name}  {symbol}</small>
        <small>${balance}</small>
    </span>
</div>
<a class="copy-link" href="javascript:void(0)" on:click={ () => copyToClipboard(coin.vk) }>{coin.vk}</a>
<small>click address to copy</small>