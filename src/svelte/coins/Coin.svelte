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
    import { 
        formatAccountAddress, 
        displayBalance, 
        getKeyValue, 
        createCharmKey, 
        formatValue, 
        stringToFixed, 
        getTokenBalance, 
        copyToClipboard } from '../../js/utils.js'  

    //Images
    import linkedAccount from '../../img/misc/linked_account.svg'
    import logo from '../../img/logo.svg'

    //Icons
    import CheckmarkIcon from '../icons/CheckmarkIcon.svelte';
    import CopyIcon from '../icons/CopyIcon.svelte';
    import DirectionalChevronIcon from '../icons/DirectionalChevronIcon.svelte'

    const dispatch = createEventDispatcher()

    // Props
    export let coin;
    export let token;

    const formats = {
        'number': {default: 0},
        'string': {default: 'None'}
    }

    let divElm;

    let brokenIconLink = false;
    let brokenCharmIconLink = [];
    let copied = false;

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
    $: dappLogoSrc = dappLogo ? `${dappInfo.url}${dappLogo}` : undefined
    $: brokenIconLink = checkIfLogoURLBroken(dappLogoSrc)

    $: tokenBalance = token && coin ? displayBalance(stringToFixed(getTokenBalance(netKey, coin.vk, token.contractName, $TokenBalancesStore), 8)) : "0"

    afterUpdate(() => {
        balance = BalancesStore.getBalance($currentNetwork, coin.vk)
        balanceStr = balance ? balance.toLocaleString('en') : '0'
        percent = typeof $balanceTotal[networkKey($currentNetwork)] === 'undefined' ? "0.0 %" : toPercentString();
    })

    const checkIfLogoURLBroken = (logoSrc) => {
        return fetch(logoSrc, {cache: "reload"}).then(res => {
            if (res.ok && res.status === 200) return true
            else return false
        }).catch(err => false)
    }

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

    const handleAddressCopy = () => {
        copyToClipboard(coin.vk)
        copied = true;
        setTimeout(() => copied = false, 2000)
    }

    const handleReorderUp = () => {
        dispatch('reorderAccount', {id: coin.id, direction: "up"})
    }
    const handleReorderDown = () => {
        dispatch('reorderAccount', {id: coin.id, direction: "down"})
    }
    
</script>

<style>
.row-box{
    padding: 1.5rem 28px 0.25rem 16px;
}
.coin-main-row{
    margin-bottom: 0.5rem;
}
.text{
    display: flex;
    align-items: center;
    flex-wrap: wrap;
}

.logo{
    display: flex;
    justify-content: center;
    width: 68px;
    height: 35px;
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

.address{
    padding: 2px 6px;
    margin-left: 5px;
    background: var(--bg-secondary);
    cursor: pointer;
    border-radius: 16px;
}
.address:hover{
    background: var(--bg-secondary-hover);
}
.address.success{
    color: var(--success-color);
    border: 1px solid var(--success-color);
}
.icon-copy{
    width: 10px;
    height: 10px;
    margin-left: 8px;
}
</style>

<div 
    id={`coin-row-${coin.id}`} 
    bind:this={divElm}
    class="row-box flex-column" 
    on:click={ /*() => switchPage('CoinDetails', coin)*/ null}
    in:fly="{{delay: 0, duration: 500, x: 0, y: 25, opacity: 0.0, easing: quintOut}}"
    >
    <div class="coin-main-row flex-row flex-center-center">
        {#if whitelabel.mainPage.logo.show}
            <div class="logo flex-center-center">
                {#if dappInfo}
                    {#await brokenIconLink}
                        <div class="dapp-logo">
                            {@html logo}
                            <div class="dapp-linked-account-logo"> 
                                {@html linkedAccount}
                            </div>
                        </div>
                    {:then res}
                        {#if res}
                            <img class="dapp-logo" src={dappLogoSrc} alt="dapp logo" > 
                        {:else}
                            <div class="dapp-logo">
                                {@html logo}
                                <div class="dapp-linked-account-logo"> 
                                    {@html linkedAccount}
                                </div>
                            </div>
                        {/if}
                    {/await}
                {:else}
                    <CryptoLogos {coin} styles={`width: 32px; margin: 0 36px 0 0;`}/> 
                {/if}
            </div>
        {/if}
        {#if whitelabel.mainPage.account_info.show}
            <div class="name text text-body1">
                <div class="name-box">
                    <div id={`coin-nickname-${coin.id}`}  class="nickname text-body1 " on:click={() => switchPage('CoinDetails', coin)}>
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
                    <div class="text-primary-dim text-body1"
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
        {#if !token}
            <div class="flex-row show-on-hover">
                <button class="button__small reorder-button" on:click={handleReorderUp}>
                    <DirectionalChevronIcon width="8px" color="var(--font-primary-dim)"/>
                </button>
                <button class="button__small reorder-button" on:click={handleReorderDown}>
                    <DirectionalChevronIcon  width="8px" direction="down" color="var(--font-primary-dim)"/>
                </button>
            </div>    
        {/if}
        <button class="button__small address flex-row" 
                class:success={copied} 
                on:click={handleAddressCopy} 
                title="copy account address"
        >
            {formatAccountAddress(coin.vk, 10, 4)}
            <div class="icon-copy">
                {#if !copied}
                    <CopyIcon width="9px" color="var(--font-primary)"/>
                {:else}
                    <CheckmarkIcon width="10px" color="var(--success-color)"/>
                {/if}
            </div>
        </button>
    </div>
</div>