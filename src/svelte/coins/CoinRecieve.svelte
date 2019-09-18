<script>
    //Utils
    import { copyToClipboard } from '../../js/utils.js'

    //Props
    export let coin;

</script>

<h2> Receive {coin.name} </h2>
<div>
    <span>
        Public Key
        <small>{coin.name}  {coin.symbol}</small>
        <small>${coin.balance}</small>
    </span>
</div>
<a href="javascript:void(0)" on:click={ () => copyToClipboard(coin.vk) }>{coin.vk}</a>
<small>click to copy public key to clipboard</small>