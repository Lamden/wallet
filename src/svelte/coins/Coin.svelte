<script>
    import { onMount, getContext, setContext} from 'svelte';

    //Stores
    import { SettingsStore } from '../../js/stores.js';

    //Utils
    import { toCurrencyFormat } from '../../js/utils.js';
    import { fromWEI } from '../../js/crypto/wallets.js';
    import { logos } from '../../js/crypto/logos.js';

    // Props
    export let coin;

    const { switchPage } = getContext('switchPage');
    $: watching = coin.sk === 'watchOnly';

    $: logo = logos[coin.network][coin.symbol.replace("-", "_")] || logos[coin.network].default ;

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
        <li>{`balance ${ coin.balance } ${ coin.symbol }`}</li>
        <li>{`USD Value (${ toCurrencyFormat(coin.USD_value) })`}</li>
        {#if watching}
            <li>Watching Coin</li>
        {/if}
    </ul>
</div>
