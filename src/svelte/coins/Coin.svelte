<script>
    import whitelabel from '../../../whitelabel.json'

    import { getContext, setContext, afterUpdate, createEventDispatcher } from 'svelte';
	import { fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';

    //Stores
    import { currentNetwork, BalancesStore, balanceTotal, DappStore, networkKey } from '../../js/stores/stores.js';

    //Components
    import CryptoLogos from '../components/CryptoLogos.svelte';

    //Utils
    import { displayBalance, getKeyValue, createCharmKey, formatValue } from '../../js/utils.js'  

    //Images
    import linkedAccount from '../../img/misc/linked_account.svg'
    import logo from '../../img/logo.svg'
    import charm_default from '../../img/misc/charm_default.svg';

    const dispatch = createEventDispatcher()

    // Props
    export let coin;

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
    $: dappInfo = $DappStore[getDappInfo($DappStore, coin)] || undefined
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
        let res = await getKeyValue($currentNetwork, dappNetworkInfo.contractName, info.variableName, createCharmKey(info, coin.vk), info.formatAs || 'number')
        return  formatValue(res, info.formatAs)
    }

    const handleBrokenCharmIcon = (index) => {
        brokenCharmIconLink[index] = true; 
    }

    const handleReorderUp = () => dispatch('reorder', {id: coin.id, direction: "up"})
    const handleReorderDown = () => dispatch('reorder', {id: coin.id, direction: "down"})
    
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
    background-color: var(--bg-secondary)
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
    position: relative;
    width: 32px;
    margin: 0 36px 0 16px;
}
.dapp-linked-account-logo{
    position: absolute;
    bottom: 0;
    right: 0;
    width: 14px;
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
    background: var(--bg-secondary);
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
    id={`coin-row-${coin.id}`} 
    class="coin-box" 
    on:click={ /*() => switchPage('CoinDetails', coin)*/ null}
    in:fly="{{delay: 0, duration: 500, x: 0, y: 25, opacity: 0.0, easing: quintOut}}"
    >
    {#if whitelabel.mainPage.logo.show}
        <div class="logo flex-column">
            {#if dappInfo}
                {#if dappLogo && !brokenIconLink}
                    <img class="dapp-logo" src={`${dappInfo.url}${dappLogo}`} alt="dapp logo" on:error={() => brokenIconLink = true}>
                {:else}
                    <div class="dapp-logo">
                        {@html logo}
                        <div class="dapp-linked-account-logo"> 
                            {@html linkedAccount}
                        </div>
                    </div>
                {/if}
            {:else}
                <CryptoLogos {coin} styles={`width: 32px; margin: 0 36px 0 16px;`}/>
            {/if}
        </div>
    {/if}
    {#if whitelabel.mainPage.account_info.show}
        <div class="name text text-body1">
            <div class="name-box">
                <div class="text-body1">
                    {#if dappInfo}
                        {`${dappInfo.appName}`}
                    {:else}
                        {`${coin.nickname}`}
                    {/if}
                </div>
                {#if whitelabel.mainPage.account_info.show_network_name}
                    <div id={`coin-nickname-${coin.id}`} class="text-body2 text-secondary nickname">
                        {`${coin.name}`} 
                    </div>
                {/if}
            </div>
        </div>
    {/if}
    {#if whitelabel.mainPage.amount.show}
        <div class="amount flex-column">
            <div class="text-body1">{`${balanceStr} ${$currentNetwork.currencySymbol}`}</div>
        </div>
    {/if}
    {#if whitelabel.mainPage.portfolio.show}
        {#if watching}
            <div class="text-body2 text-secondary watching-text percent">{"watching"}</div>
        {:else}
            <div class="percent text text-body1"> {`${percent}`}</div>
        {/if}
    {/if}
    <div class="flex-col">
         <button on:click={handleReorderUp}>up</button>
          <button on:click={handleReorderDown}>down</button>
    </div>
   
</div>
{#if typeof dappInfo !== 'undefined' && $currentNetwork.lamden}
    <!--
    {#each dappCharms as charm, index}
        <div class="flex-row charm-row">
            {#if !brokenCharmIconLink[index]}
                <img class="charm-img" src={`${dappInfo.url}${charm.iconPath}`} alt={`${charm.name} logo`} on:error={() => brokenCharmIconLink[index] = true}>
            {:else}
                <div class="charm-img">{@html charm_default}</div>
            {/if}
            <label class="text-body2" style={"margin-right: 10px;"}>{charm.name}: </label>
            {#await getItemValue(charm) then response}
                <label class="text-body2 text-secondary">{formatValue(response)}</label>
            {/await}
        </div>
    {/each}
    -->
    <div class="dapp-info">
        <button on:click={() => switchPage('CoinDetails', coin)}>details</button>
        <p>{`linked to `}
            <a class="text-link" href={dappInfo.url} rel="noopener noreferrer" target="_blank">{dappInfo.url}</a>
        </p>
    </div>
{/if}

