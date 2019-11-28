<script>
    import { onMount, getContext, setContext} from 'svelte';

    //Stores
    import { SettingsStore, themeStyle } from '../../js/stores/stores.js';

    //Utils
    import { logos } from '../../js/crypto/logos.js';

    // Props
    export let coin;

    //Context
    const { switchPage } = getContext('app_functions');
    
    $: watching = coin.sk === 'watchOnly';

    $: logo = coin.logo ? coin.logo : logos[coin.network][coin.symbol.replace("-", "_")] || logos[coin.network].default ;
    $: symbol = coin.symbol;
    $: balance = coin.balance ? coin.balance : 0;

</script>

<style>
.coin-box{
    display: flex;
    flex-direction: row;
    height: 63px;
    padding: 12px 0;
}

.logo {
    width: 32px;
    margin: 0 36px 0 16px;
}

.text{
    display: flex;
    align-items: center;
    flex-wrap: wrap;
}

.name{
	width: 234px;
}

.amount{
	flex-grow: 1;
}

.percent{
    justify-content: flex-end;
    margin-right: 28px;  
	width: 203px;
}

.svg-black{
    filter: invert(1);
}
</style>

<div class="coin-box">
    <div class="name text text-body1">
        <img class="logo" class:svg-black={$themeStyle === 'light'} src={logo} alt={`${coin.name} logo`} />
        <span class="text-body1" on:click={ () => switchPage('CoinDetails', coin)} style="cursor: pointer;">
            {#if watching }{`👀 `}{/if}{`${coin.name}`} 
        </span>
    </div>
    <div class="amount text text-body1">
        {`${ balance } ${ symbol }`}
        {#if watching}
            <li>Watching Coin</li>
        {/if}
    </div>
    <div class="percent text text-body1"> TBD %</div>
</div>
