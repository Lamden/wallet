<script>
    import { getContext, setContext, afterUpdate } from 'svelte';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

    //Stores
    import { currentNetwork, BalancesStore, balanceTotal, DappStore, networkKey } from '../../js/stores/stores.js';

    //Components
    import CryptoLogos from '../components/CryptoLogos.svelte';

    //Utils
    import { displayBalance, getKeyValue, createCharmKey } from '../../js/utils.js'  

    //Images
    import lamden_logo_white_linked from '../../img/misc/lamden_logo_white_linked.svg'
    import charm_default from '../../img/misc/charm_default.svg';

    // Props
    export let coin;
    export let id;

    const formats = {
        'number': {default: 0},
        'string': {default: 'None'}
    }

    let brokenIconLink = false;
    let brokenCharmIconLink = [];

    //Context
    const { switchPage } = getContext('app_functions');
    
    $: watching = coin.sk === "watchOnly"
    $: balance = BalancesStore.getBalance($currentNetwork, coin.vk)
    $: balanceStr = balance ? displayBalance(balance) : '0'
    $: percent = typeof $balanceTotal[networkKey($currentNetwork)] === 'undefined' ? "" : toPercentString();
    $: dappInfo = $DappStore[getDappInfo($DappStore)] || undefined
    $: dappNetworkInfo = dappInfo ? dappInfo[$currentNetwork.type] : undefined
    $: dappCharms = dappNetworkInfo ? dappNetworkInfo.charms || [] : []
    $: dappLogo = dappInfo ? dappInfo.logo || false : false

    afterUpdate(() => {
        balance = BalancesStore.getBalance($currentNetwork, coin.vk)
        balanceStr = balance ? balance.toLocaleString('en') : '0'
        percent = typeof $balanceTotal[networkKey($currentNetwork)] === 'undefined' ? "0.0 %" : toPercentString();
    })

    const toPercentString = () => {
        if (isNaN((balance / $balanceTotal[networkKey($currentNetwork)]))) return '0.0 %'
        return ((balance / $balanceTotal[networkKey($currentNetwork)])* 100).toFixed(2).toString() + ' %'
    }
    const getDappInfo = (dappStore) => {
        return Object.keys(dappStore).find(f => dappStore[f].vk === coin.vk)
    }

    const getItemValue = async (info) => {
        return await getKeyValue($currentNetwork, dappNetworkInfo.contractName, info.variableName, createCharmKey(info, coin.vk), info.formatAs || 'number')
    }

    const handleBrokenCharmIcon = (index) => {
        brokenCharmIconLink[index] = true; 
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
p > a {
    margin: 0 5px;
}
.charm-img{
    width: 25px;
    margin: 0 10px 0 0;
}
.charm-row{
    align-items: center;
    padding-left: 100px;
    margin-bottom: 5px;
}
.name-box{
    line-height: 1.5;
}
</style>

<div 
    id={`coin-row-${id}`} 
    class="coin-box" 
    on:click={ () => switchPage('CoinDetails', coin)}
    in:fly="{{delay: 0, duration: 500, x: 0, y: 25, opacity: 0.0, easing: quintOut}}"
    >
    <div class="logo flex-column">
        {#if dappInfo}
            {#if dappLogo && !brokenIconLink}
                <img class="dapp-logo" src={`${dappInfo.url}${dappLogo}`} alt="dapp logo" on:error={() => brokenIconLink = true}>
            {:else}
                <div class="dapp-logo">{@html lamden_logo_white_linked}</div>
            {/if}
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
        <div class="text-body2 text-primary-dark watching-text percent">{"watching"}</div>
    {:else}
        <div class="percent text text-body1"> {`${percent}`}</div>
    {/if}
</div>
{#if typeof dappInfo !== 'undefined' && $currentNetwork.lamden}
    {#each dappCharms as charm, index}
        <div class="flex-row charm-row">
            {#if !brokenCharmIconLink[index]}
                <img class="charm-img" src={`${dappInfo.url}${charm.iconPath}`} alt={`${charm.name} logo`} on:error={() => brokenCharmIconLink[index] = true}>
            {:else}
                <div class="charm-img">{@html charm_default}</div>
            {/if}
            <label class="text-body2" style={"margin-right: 10px;"}>{charm.name}: </label>
            {#await getItemValue(charm) then response}
                <label class="text-body2 text-primary-dark">{response}</label>
            {/await}
        </div>
    {/each}
    <div class="dapp-info">
        <p>{`linked to `}
            <a class="outside-link" href={dappInfo.url} rel="noopener noreferrer" target="_blank">{dappInfo.url}</a>
        </p>
    </div>
{/if}

