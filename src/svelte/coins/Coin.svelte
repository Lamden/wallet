<script>
    import { getContext, setContext} from 'svelte';

    //Stores
    import { SettingsStore, currentNetwork, themeStyle, CoinStore, BalancesStore, balanceTotal } from '../../js/stores/stores.js';

    //Components
    import CryptoLogos from '../components/CryptoLogos.svelte';

    // Props
    export let coin;
    export let id;

    //Context
    const { switchPage } = getContext('app_functions');
    
    $: watching = coin.sk === 'watchOnly';
    $: symbol = coin.symbol;
    $: coinBalances = !coin.balances ? {} : coin.balances
    $: balanceStore = !$BalancesStore[$currentNetwork.url] ? {[coin.vk]: 0} : $BalancesStore[$currentNetwork.url];
    $: balance = !balanceStore[coin.vk] ? 0 : balanceStore[coin.vk];
    $: percent = typeof $balanceTotal[$currentNetwork.url] === 'undefined' ? "" : toPercentString();

    function toPercentString(){
        if (isNaN((balance / $balanceTotal[$currentNetwork.url]))) return '0 %'
        return ((balance / $balanceTotal[$currentNetwork.url])* 100).toFixed(1).toString() + ' %'
    }
</script>

<style>
.coin-box{
    display: flex;
    flex-direction: row;
    min-height: 63px;
    padding: 12px 0;
    cursor: pointer;
}

.coin-box:hover{
    background-color: var(--bg-color-grey)
}

.text{
    display: flex;
    align-items: center;
    flex-wrap: wrap;
}

.logo{
    display: flex;
    justify-content: center;
}

.name{
	width: 234px;
}

.nickname{
    word-break: break-word;
}

.amount{
    padding-left: 15px;
    flex-grow: 1;
    justify-content: center;
}

.percent{
    justify-content: flex-end;
    margin-right: 28px;  
	width: 90px;
}

</style>

<div id={`coin-row-${id}`} class="coin-box" on:click={ () => switchPage('CoinDetails', coin)}>
    <div class="logo flex-column">
        <CryptoLogos {coin} black={true} styles={`width: 32px; margin: 0 36px 0 16px;`}/>
    </div>
    <div class="name text text-body1">
        <div class="name-box">
            <div class="text-body1">
                {`${coin.name}`} 
            </div>
            <div id={`coin-nickname-${id}`} class="text-body2 text-primary-dark nickname">
                {`${coin.nickname}`} 
            </div>
        </div>
    </div>

    <div class="amount flex-column">
        <div class="text-body1">{`${ balance.toLocaleString('en') } ${ symbol }`}</div>
        {#if watching}
            <div class="text-body2 text-primary-dark">{"Watching Wallet"}</div>
        {/if}
    </div>

    <div class="percent text text-body1"> {`${percent}`}</div>
</div>
