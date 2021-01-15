<script>
    import whitelabel from '../../../whitelabel.json'

    import { getContext, setContext, afterUpdate, createEventDispatcher } from 'svelte';
	import { fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';

    //Stores
    import { currentNetwork, BalancesStore, balanceTotal, DappStore, networkKey, TokenBalancesStore } from '../../js/stores/stores.js';

    //Components
    import CryptoLogos from '../components/CryptoLogos.svelte';

    //Utils
    import { displayBalance, getKeyValue, createCharmKey, formatValue, stringToFixed, getTokenBalance } from '../../js/utils.js'  

    //Images
    import linkedAccount from '../../img/misc/linked_account.svg'
    import logo from '../../img/logo.svg'
    import charm_default from '../../img/misc/charm_default.svg';

    const dispatch = createEventDispatcher()

    // Props
    export let coin;
    export let token;

    const formats = {
        'number': {default: 0},
        'string': {default: 'None'}
    }

    let brokenIconLink = false;
    let brokenCharmIconLink = [];

    //Context
    const { switchPage } = getContext('app_functions');
    
    $: netKey = networkKey($currentNetwork)
    $: watching = coin.sk === "watchOnly"
    $: balance = BalancesStore.getBalance($currentNetwork, coin.vk)
    $: balanceStr = balance ? displayBalance(stringToFixed(balance, 8)) : '0'
    $: percent = typeof $balanceTotal[netKey] === 'undefined' ? "" : toPercentString();
    $: dappInfo = $DappStore[getDappInfo($DappStore, coin)] || undefined
    $: dappNetworkInfo = dappInfo ? dappInfo[$currentNetwork.type] : undefined
    $: dappCharms = dappNetworkInfo ? dappNetworkInfo.charms || [] : []
    $: dappLogo = dappInfo ? dappInfo.logo || false : false

    $: tokenBalance = token && coin ? displayBalance(stringToFixed(getTokenBalance(netKey, coin.vk, token.contractName, $TokenBalancesStore), 8)) : "0"

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



    const handleReorderUp = () => dispatch('reorderAccount', {id: coin.id, direction: "up"})
    const handleReorderDown = () => dispatch('reorderAccount', {id: coin.id, direction: "down"})
    
</script>

<style>
.row-box{
    padding: 1rem 28px 0.5rem 16px;
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

.amount{
    padding-left: 15px;
    flex-grow: 1;
    justify-content: center;
}

.percent{
    justify-content: flex-end;
	width: 90px;
    flex-grow: 1;
}

.watching-text{
    display: flex;
    align-items: center;
}
.dapp-logo{
    position: relative;
    width: 32px;
    margin: 0 36px 0 0;
}
.dapp-linked-account-logo{
    position: absolute;
    bottom: 0;
    right: 0;
    width: 14px;
}
.name-box{
    line-height: 1.1;
}
.token-balance{
    margin-bottom: 0.25rem;
}
</style>

<div 
    id={`coin-row-${coin.id}`} 
    class="row-box flex-column" 
    on:click={ /*() => switchPage('CoinDetails', coin)*/ null}
    in:fly="{{delay: 0, duration: 500, x: 0, y: 25, opacity: 0.0, easing: quintOut}}"
    >
    <div class="flex-row flex-center-center">
        {#if whitelabel.mainPage.logo.show}
            <div class="logo flex-center-center">
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
                    <CryptoLogos {coin} styles={`width: 32px; margin: 0 36px 0 0;`}/>
                {/if}
            </div>
        {/if}
        {#if whitelabel.mainPage.account_info.show}
            <div class="name text text-body1">
                <div class="name-box">
                    <div class="nickname text-body1 " on:click={() => switchPage('CoinDetails', coin)}>
                        {#if dappInfo}
                            {`${dappInfo.appName}`}
                        {:else}
                            {`${coin.nickname}`}
                        {/if}
                    </div>
                    {#if typeof dappInfo !== 'undefined' && $currentNetwork.lamden}
                        <a class="text-link text-subtitle1" href={dappInfo.url} rel="noopener noreferrer" target="_blank">{dappInfo.url}</a>
                    {/if}
                </div>
            </div>
        {/if}
        {#if whitelabel.mainPage.amount.show}
                <div class="amount flex-column">
                    {#if token}
                        <div class="token-balance text-body1">{`${tokenBalance} ${token.tokenSymbol}`}</div>
                    {/if}
                    <div class="text-body3 text-primary-dim"
                         class:text-body1={!token}
                         class:text-body3={typeof token !== "undefined"}
                    >
                        {`${balanceStr} ${$currentNetwork.currencySymbol}`}
                    </div>
                </div>

        {/if}
        
        {#if whitelabel.mainPage.portfolio.show && !token}
            {#if watching}
                <div class="text-body2 text-primary-dim watching-text percent ">{"watching"}</div>
            {:else}
                <div class="percent text text-body1  weight-200"> {`${percent}`}</div>
            {/if}
        {/if}
    </div>
    <div class="flex-row flex-center-end">
    <!--
        {#if !token}
            <div class="flex-row show-on-hover">
                <button class="button__text text-body2" on:click={handleReorderUp}>up</button>
                <button class="button__text text-body2" on:click={handleReorderDown}>down</button>
            </div>
            
        {/if}-->
        <button class="button__text details-button text-body2 weight-200" on:click={() => switchPage('CoinDetails', coin)}>details</button>
    </div>
</div>


