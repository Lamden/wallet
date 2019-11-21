<script>
    import { onMount, getContext, setContext} from 'svelte';

    //Stores
    import { SettingsStore } from '../../js/stores/stores.js';

    //Utils
    import { logos } from '../../js/crypto/logos.js';

    // Props
    export let coin;

    //Context
    const { switchPage } = getContext('switchPage');
    
    $: watching = coin.sk === 'watchOnly';

    $: logo = coin.logo ? coin.logo : logos[coin.network][coin.symbol.replace("-", "_")] || logos[coin.network].default ;
    $: symbol = coin.symbol;
    $: balance = coin.balance ? coin.balance : 0;

</script>

<style>
.container{
    display: grid;
    grid-auto-flow: column;
}

.logo {
    width: 64px;
    height: 64px;
}
</style>

<div class="container">
    <img class="logo" src={logo} alt={`${coin.name} logo`} />
    <h2 on:click={ () => switchPage('CoinDetails', coin)} style="cursor: pointer;">
        {#if watching }👀{/if}{` ${coin.name} - ${coin.nickname}`} 
    </h2>
    <ul>
        <li>{`balance ${ balance } ${ symbol }`}</li>
        {#if watching}
            <li>Watching Coin</li>
        {/if}
    </ul>
</div>
