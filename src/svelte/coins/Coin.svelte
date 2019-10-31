<script>
    import { onMount, getContext, setContext} from 'svelte';

    //Stores
    import { SettingsStore, MarketInfoStore, currencyCode } from '../../js/stores/stores.js';

    //Utils
    import { toCurrencyFormat } from '../../js/utils.js';
    import { fromWEI } from '../../js/crypto/wallets.js';
    import { logos } from '../../js/crypto/logos.js';

    // Props
    export let coin;

    //Context
    const { switchPage } = getContext('switchPage');
    
    $: watching = coin.sk === 'watchOnly';

    $: logo = coin.logo ? coin.logo : logos[coin.network][coin.symbol.replace("-", "_")] || logos[coin.network].default ;
    $: symbol = coin.is_token ? coin.token_symbol : coin.symbol;
    $: balance = coin.balance ? coin.balance : 0;
    $: fiat_value = () => {
        try{
            return $MarketInfoStore[coin.symbol] ? $MarketInfoStore[coin.symbol].quote[$currencyCode].price : 0;
        } catch (e){
            return 0;
        }
    }
    $: testnet = coin.network_symbol.includes('TESTNET') ? true : false;


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

    .tooltip {
    position: relative;
    display: inline-block;
    border-bottom: 1px dotted black;
    }

    .tooltip .tooltiptext {
    visibility: hidden;
    width: 120px;
    background-color: black;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 5px 0;
    
    /* Position the tooltip */
    position: absolute;
    z-index: 1;
    top: -5px;
    left: 105%;
    }

    .tooltip:hover .tooltiptext {
    visibility: visible;
    }
</style>

<div class="container">
    <img class="logo" src={logo} alt={`${coin.name} logo`} />
    <h2 on:click={ () => switchPage('CoinDetails', coin)} style="cursor: pointer;">
        {#if watching }👀{/if}{` ${coin.name} - ${coin.nickname}`} 
    </h2>
    <ul>
        <li>{`balance ${ balance } ${ symbol }`}</li>
        {#if !testnet}
            <li class="tooltip">{`USD Value (${ toCurrencyFormat( fiat_value(), $currencyCode ) })`}
                <span class="tooltiptext"> {fiat_value()} </span>
            </li>
        {/if}
        {#if watching}
            <li>Watching Coin</li>
        {/if}
    </ul>
</div>
