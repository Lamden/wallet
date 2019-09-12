<script>
    import { onMount, getContext, setContext} from 'svelte';

    //Stores
    import { SettingsStore, allTotals } from '../../js/stores.js';

    //Utils
    import { toCurrencyFormat } from '../../js/utils.js';
    import { logos } from '../../js/crypto/logos.js';

    // Props
    export let coin;
    
    const { switchPage } = getContext('switchPage');

    console.log($allTotals.coinTotals[coin.network][coin.symbol])

    $: totalBalance = $allTotals.coinTotals[coin.network][coin.symbol].balance || 0;
    $: totalUSDValue = $allTotals.coinTotals[coin.network][coin.symbol].USD_value || 0;

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
    <h2 on:click={ () => switchPage('CoinDetails', coin)} style="cursor: pointer;">{coin.name}</h2>
    <ul>
        <li>{`# of addresses ${Object.keys(coin.pubkeys).length}`}</li>
        <li>{`balance ${ totalBalance } ${ coin.symbol }`}</li>
        <li>{`USD Value (${ toCurrencyFormat(totalUSDValue) })`}</li>
    </ul>
</div>
