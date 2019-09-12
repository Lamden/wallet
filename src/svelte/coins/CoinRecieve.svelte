<script>
    //Utils
    import { copyToClipboard } from '../../js/utils.js'

    //Props
    export let coin;

    let selected;
    
</script>

<h2> Receive {coin.name} </h2>
<div>
    <span>
        Public Key
        <small>{coin.name}  {coin.symbol}</small>
        <!-- <small>${coin.totalUsdBalance.toFixed(2)}</small> -->
    </span>
</div>
<div>
    <select id='ddPubkeys' bind:value={selected}>
        {#each Object.keys(coin.pubkeys) as pubKey}
            <option value={coin.pubkeys[pubKey]}>{coin.pubkeys[pubKey].nickname}</option>
        {/each}
    </select>
</div>
<button on:click={() => copyToClipboard(selected.vk)}>copy to clipboard</button>