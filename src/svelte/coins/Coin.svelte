<script>
    import { getContext, setContext, afterUpdate } from 'svelte';

    //Stores
    import { currentNetwork, BalancesStore, balanceTotal, DappStore } from '../../js/stores/stores.js';

    //Components
    import CryptoLogos from '../components/CryptoLogos.svelte';

    // Props
    export let coin;
    export let id;

    //Context
    const { switchPage } = getContext('app_functions');
    
    $: watching = coin.sk === 'watchOnly';
    $: balance = BalancesStore.getBalance($currentNetwork.url, coin.vk)
    $: balanceStr = balance.toLocaleString('en')
    $: percent = typeof $balanceTotal[$currentNetwork.url] === 'undefined' ? "" : toPercentString();
    $: dappInfo = $DappStore[getDappInfo($DappStore)] || undefined
    $: dappLogo = dappInfo ? dappInfo.logo || false : false

    afterUpdate(() => {
        balance = BalancesStore.getBalance($currentNetwork.url, coin.vk)
        balanceStr = balance.toLocaleString('en')
        percent = typeof $balanceTotal[$currentNetwork.url] === 'undefined' ? "" : toPercentString();
    })

    const toPercentString = () => {
        if (isNaN((balance / $balanceTotal[$currentNetwork.url]))) return '0.0 %'
        return ((balance / $balanceTotal[$currentNetwork.url])* 100).toFixed(2).toString() + ' %'
    }
    const getDappInfo = (dappStore) => {
        return Object.keys(dappStore).find(f => dappStore[f].vk === coin.vk)
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
    margin-right: 20px;
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

.watching-text{
    display: flex;
    align-items: center;
}
.dapp-logo{
    width: 32px;
    margin: 0 36px 0 16px;
}
.dapp-info{
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
}
.dapp-info > p {
    color: var(--text-primary);
    max-width: fit-content;
    border-radius: 9px;
    background: rgba(38, 38, 38, 0.64);
    box-shadow: 0px 1px 2px rgba(8, 35, 48, 0.24), 0px 2px 6px rgba(8, 35, 48, 0.16);
    margin-top: 5px;
    padding: 6px 14px;
}
</style>

<div id={`coin-row-${id}`} class="coin-box" on:click={ () => switchPage('CoinDetails', coin)}>
    <div class="logo flex-column">
        {#if dappLogo}
            <img class="dapp-logo" src={`${dappInfo.url}${dappLogo}`} alt="dapp logo">
        {:else}
            <CryptoLogos {coin} styles={`width: 32px; margin: 0 36px 0 16px;`}/>
        {/if}
        
    </div>
    <div class="name text text-body1">
        <div class="name-box">
            <div class="text-body1">
                {#if dappInfo}
                    {`${dappInfo.appName}`}
                {:else}
                    {`${coin.nickname}`}
                {/if}
            </div>
            <div id={`coin-nickname-${id}`} class="text-body2 text-primary-dark nickname">
                {`${coin.name}`} 
            </div>
        </div>
    </div>

    <div class="amount flex-column">
        <div class="text-body1">{`${balanceStr} ${$currentNetwork.currencySymbol}`}</div>
    </div>
    {#if watching}
        <div class="text-body2 text-primary-dark watching-text">{"watching"}</div>
    {:else}
        <div class="percent text text-body1"> {`${percent}`}</div>
    {/if}
</div>
{#if typeof dappInfo !== 'undefined' && $currentNetwork.lamden}
    <div class="dapp-info">
        <p>{`Created for dapp at ${dappInfo.url}`}</p>
    </div>
{/if}

