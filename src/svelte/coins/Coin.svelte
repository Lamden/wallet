<script>
    import whitelabel from '../../../whitelabel.json'

    import { getContext, setContext, afterUpdate, createEventDispatcher } from 'svelte';
	import { fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';

    //Stores
    import { currentNetwork, BalancesStore, balanceTotal, networkKey, TokenBalancesStore, DappStore, TokenStore } from '../../js/stores/stores.js';

    //Images
    import arrowIn from '../../img/arrow_in.svg';
    import arrowOut from '../../img/arrow_out.svg';
    import accountBG from '../../img/account_border.svg';

    //Images
    import hero_bg from '../../img/backgrounds/hero_bg.png';  
    //Components
    import CryptoLogos from '../components/CryptoLogos.svelte';
    import { CoinDivider, Token, Components}  from '../Router.svelte'
    const { Identicons, TokenLogo } = Components;

    //Utils
    import { 
        formatAccountAddress, 
        displayBalance, 
        getKeyValue, 
        createCharmKey, 
        formatValue, 
        stringToFixed, 
        getTokenBalance, 
        copyToClipboard, 
        toBigNumber
    } from '../../js/utils.js'  

    //Images
    import logo from '../../img/logo.svg'

    //Icons
    import CheckmarkIcon from '../icons/CheckmarkIcon.svelte';
    import CopyIcon from '../icons/CopyIcon.svelte';
    import DirectionalChevronIcon from '../icons/DirectionalChevronIcon.svelte'

    const dispatch = createEventDispatcher()

    // Props
    export let coin;
    export let token;
    export let refreshTx;

    const formats = {
        'number': {default: 0},
        'string': {default: 'None'}
    }

    let divElm;

    let copied = false;
    let collapse = false;

    $: direction= collapse?"down":"right"

    //Context
    const { switchPage, openModal } = getContext('app_functions');

    const genericIcon_base64_svg = "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiPjxjaXJjbGUgc3Ryb2tlPSJub25lIiBmaWxsPSIjOGU3Yjk4IiByPSI0OCUiIGN4PSI1MCUiIGN5PSI1MCUiPjwvY2lyY2xlPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDUwIDUwKSBzY2FsZSgwLjY5IDAuNjkpIHJvdGF0ZSgwKSB0cmFuc2xhdGUoLTUwIC01MCkiIHN0eWxlPSJmaWxsOiNmZmZmZmYiPjxzdmcgZmlsbD0iI2ZmZmZmZiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgdmVyc2lvbj0iMS4xIiBzdHlsZT0ic2hhcGUtcmVuZGVyaW5nOmdlb21ldHJpY1ByZWNpc2lvbjt0ZXh0LXJlbmRlcmluZzpnZW9tZXRyaWNQcmVjaXNpb247aW1hZ2UtcmVuZGVyaW5nOm9wdGltaXplUXVhbGl0eTsiIHZpZXdCb3g9IjAgMCA1OCA4OCIgeD0iMHB4IiB5PSIwcHgiIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIj48ZGVmcz48c3R5bGUgdHlwZT0idGV4dC9jc3MiPgogICAKICAgIC5maWwwIHtmaWxsOiNmZmZmZmZ9CiAgIAogIDwvc3R5bGU+PC9kZWZzPjxnPjxwYXRoIGNsYXNzPSJmaWwwIiBkPSJNMCAyNGMwLC0zMSA1OCwtMzMgNTgsLTEgMCwxOSAtMTksMTggLTIzLDM2IC0yLDkgLTE0LDggLTE0LC0yIDAsLTE3IDE0LC0xOCAyMCwtMjkgNCwtOCAtMywtMTYgLTExLC0xNiAtMTcsMCAtMTEsMTkgLTIyLDE5IC00LDAgLTgsLTMgLTgsLTd6bTI4IDY0Yy0xMiwwIC0xMSwtMTggMCwtMTggMTIsMCAxMiwxOCAwLDE4eiI+PC9wYXRoPjwvZz48L3N2Zz48L2c+PC9zdmc+";
    
    $: netKey = networkKey($currentNetwork)
    $: watching = coin.sk === "watchOnly"
    $: balance = BalancesStore.getBalance($currentNetwork, coin.vk)
    $: balanceStr = balance ? displayBalance(stringToFixed(balance, 8)) : '0'
    $: percent = typeof $balanceTotal[netKey] === 'undefined' ? "" : toPercentString();

    $: tokenBalance = token && coin ? getTokenBalance(netKey, coin.vk, token.contractName, $TokenBalancesStore) : "0"
    $: tokenBalanceTruncated = stringToFixed(tokenBalance.toString(), 8)
    $: tokenBalanceString = displayBalance(tokenBalanceTruncated)
    $: hasVisibleBalance = toBigNumber(tokenBalanceTruncated).isGreaterThan(0)


    $: dapps = $DappStore ? Object.values($DappStore).filter(app => !!app[$currentNetwork.type] && app.vk === coin.vk).map((app, index) => {
		app.id = index
		return app
	}) : []

    $: tokenList = getTokens(netKey, coin.vk, $TokenStore, $TokenBalancesStore)
    $: tokensNum = tokenList.length
    $: isVaultAccount = coin.type==="vault";


    afterUpdate(() => {
        balance = BalancesStore.getBalance($currentNetwork, coin.vk)
        balanceStr = balance ? balance.toLocaleString('en') : '0'
        percent = typeof $balanceTotal[networkKey($currentNetwork)] === 'undefined' ? "0.0 %" : toPercentString();
    })

    const toPercentString = () => {
        if (isNaN((balance / $balanceTotal[networkKey($currentNetwork)]))) return '0.0 %'
        return ((balance / $balanceTotal[networkKey($currentNetwork)])* 100).toFixed(2).toString() + ' %'
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

    const handleSend = () => {
        if(token){
            openModal('TokenLamdenSend', {
                token, 
                coin,
                txMethod: "transfer",
                refreshTx: () => refreshTx()
            })
        } else {
            openModal("CoinLamdenSend", { coin, refreshTx: () => refreshTx() })
        }
    }

    const handleReceive = () => {
        openModal("CoinLamdenReceive", {coin})
    }

    const handleCollapse = () => {
        collapse = !collapse;
    }

    const getTokens = (netKey, vk, tokenStore, tokenBalancesStore) => {
        if (!tokenStore[netKey]) return [];
        if (!tokenBalancesStore[netKey]) return [];
        if (!tokenBalancesStore[netKey][vk]) return [];
        let tokens = []
        Object.keys(tokenBalancesStore[netKey][vk]).forEach(key => {
            let item = tokenStore[netKey].find(t => t.contractName === key)
            if (item) {
                item.balance = tokenBalancesStore[netKey][vk][key]
                tokens.push(item)
            }
        });
        return tokens;
    }
</script>

<style>
.wrap{
    width: 100%;
    height: 100%;
    margin: 0.5rem 0;
    box-sizing: border-box;
    border-radius: 6px;
    background-image: linear-gradient(#A26BFA, #4F06C6);
}
.wrap-leagyc{
    background: var(--outline);
}
.wrap-second{
    background-color: var(--bg-primary);
    margin: 2px;
    box-sizing: border-box;
    border-radius: 6px;
}
.row-box{
    padding: 0.625rem 0 0.625rem 0px;
    box-sizing: border-box;
}

.text{
    display: flex;
    align-items: center;
    flex-wrap: wrap;
}

.logo{
    display: flex;
    justify-content: center;
    margin: 0 34px 0 34px;
    padding: 5px;
    background: black;
    border-radius: 999px;
    border: 3px solid var(--color-grey-3);
}

.name{
	width: 234px;
}

.amount{
    padding-left: 15px;
    width: 240px;
    justify-content: center;
}

.percent{
    justify-content: flex-end;
	width: 90px;
    margin-right: 28px;
    flex-grow: 1;
}
.name-box{
    line-height: 1.1;
    text-decoration: underline;
}
.token-balance{
    margin-bottom: 0.25rem;
}

.address{
    background: var(--primary-color);
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
.coin-btn{
    padding: 6px 12px;
    margin-left: 10px;
    font-size: 1em;
}

.send-btn{
    margin-left: 14px;
}

.coin-btn > .icon{
    width: 12px;
    height: 12px;
    margin-left: 8px;
}

.dapps{
    margin: 0 8px;   
    display: flex;
    align-items: center;
}

.dapps .avatar{
    display: inline-block;
    width: 23px;
    height: 23px;
    border-radius: 50%;
    border: 2px solid white;
    background: var(--bg-secondary);
    overflow: hidden;
    cursor: pointer;
}
.dapps .avatar:not(:first-child) {
    margin-left: -8px;
}

.dapps .avatar:hover{
    position: relative;
    width: 25px;
    height: 25px;
    z-index: 635;
}
.dapps .avatar img{
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    vertical-align: middle;
}

.coinmenus{
    padding-left: 80px;
    margin-bottom: 1.5rem;
    margin-top: 1rem;
}
.header-text{
	display: flex;
	align-items: center;
}
.header{
	display: flex;
	flex-direction: row;
	width: 100%;
	padding: 0.5rem 80px;
	margin-bottom: 0.5rem;
	font-weight: 800;
    background: rgba(170, 170, 170, 0.1);
    box-sizing: border-box;
}
.active-bg{
    background: linear-gradient(95.08deg, rgba(162, 107, 250, 0.1) 2.49%, rgba(79, 6, 198, 0.1) 97.19%);
}
.collapse-btn{
    margin-left: 28px;
    cursor:pointer
}
.tokenlist{
    padding-left: 64px;
    margin-bottom: 2rem;
}
.tokensnum{
    flex-grow: 1;
}
.header-amount{
    margin-left: 242px;
}
.textwhite{
    color: white!important;;
}
</style>
{#if !token || (token && hasVisibleBalance)}
    <div class="wrap" class:wrap-leagyc={!isVaultAccount}>
        <div class="wrap-second">
    <div 
        id={`coin-row-${coin.id}`} 
        bind:this={divElm}
        class="row-box flex-column text-body1"
        class:active-bg={collapse}
        class:textwhite={isVaultAccount}
        class:text-primary-dim={!isVaultAccount}
        >
        <div class="coin-main-row flex-row flex-center-center">
            <div class="collapse-btn" on:click={handleCollapse}>
                <DirectionalChevronIcon strokeWidth={2.75} direction={direction} width="16px" color="white"/>
            </div>
            {#if whitelabel.mainPage.logo.show}
                <div class="logo flex-center-center">
                    <Identicons margin="0" iconValue={coin.vk} width="50px"/>
                </div>
            {/if}
            {#if whitelabel.mainPage.account_info.show}
                <div class="name text weight-300">
                    <div class="name-box">
                        <div id={`coin-nickname-${coin.id}`}  class="nickname text-white" on:click={() => switchPage('CoinDetails', coin)}>
                            {`${coin.nickname}`}
                        </div>
                    </div>
                </div>
            {/if}
            {#if whitelabel.mainPage.amount.show}
                    <div class="amount flex-column">
                        {#if token}
                            <div class="token-balance">{`${tokenBalanceString} ${token.tokenSymbol}`}</div>
                        {/if}
                        <div>
                            {`${balanceStr} ${$currentNetwork.currencySymbol}`}
                        </div>
                    </div>

            {/if}
            
            <div class="text  weight-400 tokensnum"> {`${tokensNum} ${tokensNum===1?'token':'tokens'}`}</div>        

            {#if whitelabel.mainPage.portfolio.show && !token}
                {#if !watching}
                    <div class="percent text  weight-400"> {`${percent}`}</div>
                {/if}
            {/if}
        </div>
        {#if collapse}
            <div class="flex-row coinmenus">
                {#if !token}
                    <div class="flex-row flex-align-center">
                        <button class="button__small button__primary reorder-button" on:click={handleReorderUp}>
                            <DirectionalChevronIcon  width="8px" color="white"/>
                        </button>
                        <button class="button__small button__primary reorder-button" on:click={handleReorderDown}>
                            <DirectionalChevronIcon  width="8px" direction="down" color="white"/>
                        </button>
                    </div>   
                {/if}
                {#if coin.sk !== "watchOnly"}
                    <button id="send-btn" class:send-btn={!token} class="button__small button__primary coin-btn flex-row" on:click={handleSend}>
                        {`Send ${token? token.tokenSymbol : $currentNetwork.currencySymbol}`}
                        <div class="icon">{@html arrowOut}</div>
                    </button>
                    <button id="receive-btn" class="button__small button__primary coin-btn flex-row" on:click={handleReceive}>
                        {`Receive ${token? token.tokenSymbol : $currentNetwork.currencySymbol}`}
                        <div class="icon">{@html arrowIn}</div>
                    </button>
                {/if}
                <button class="button__small address coin-btn flex-row" 
                        class:success={copied} 
                        on:click={handleAddressCopy} 
                        title="copy account address"
                >
                    {formatAccountAddress(coin.vk, 7, 0)}
                    <div class="icon-copy">
                        {#if !copied}
                            <CopyIcon width="9px" color="var(--font-primary)"/>
                        {:else}
                            <CheckmarkIcon width="10px" color="var(--success-color)"/>
                        {/if}
                    </div>
                </button>
                {#if coin.sk !== "watchOnly"}
                    <div class="dapps">
                        {#each dapps as dapp (dapp.appName)}
                            <span class="avatar" on:click={() => switchPage('ConnectionDetails', dapp)}>
                                <img src={`${dapp.url}${dapp.logo}`} alt="" /> 
                            </span>
                        {/each}
                    </div> 
                {/if}
            </div>
            {#if tokenList.length > 0}
                <div class="header header-text divider">
                        <div class="header-name header-text">
                            My Tokens
                        </div>
                        <div class="header-amount header-text">Amount</div>
                </div>
                <div class="tokenlist">
                    {#each tokenList as token (token.contractName) }
                        <Token {token} vk={coin.vk}/>
                    {/each}
                </div>
			{/if}
		{/if}
    </div>
    </div>
    </div>
{/if}