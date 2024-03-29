<script>
    import { onMount, getContext } from 'svelte';

    //Utils
    import { copyToClipboard, displayBalance } from '../../js/utils.js'

	//Stores
    import { currentNetwork, BalancesStore } from '../../js/stores/stores.js';

    //Components
	import { Components }  from '../Router.svelte'
    const { Button } = Components;
    
    //Images
    import verified_app from '../../img/menu_icons/icon_verified_app.svg'
    import copyWhite from '../../img/menu_icons/icon_copy_white.svg';
    import copyGreen from '../../img/menu_icons/icon_copy_green.svg';
    import plusWhite from '../../img/menu_icons/icon_plus.svg';
    import deleteIcon from '../../img/menu_icons/icon_delete.svg';

	//Context
    const { close, setPage } = getContext('coinDappOptions_functions');

    //Props
    export let coin;
    export let dappInfo;
    export let stampRatio;

    let selectedWallet = {};
    let copySuccessful = false;


    $: symbol = coin.is_token ? coin.token_symbol : coin.symbol;
    $: balance = displayBalance(BalancesStore.getBalance($currentNetwork, coin.vk).toLocaleString('en'))
    $: trustedApp = dappInfo[symbol].trustedApp;
    $: ratio = 0;
    $: addressLink = `${$currentNetwork.blockExplorer}/addresses/${coin.vk}`
    $: options = [
        {id: 'preapproval-btn', name: 'Automatic Transactions', desc: `get rid of popups`, icon: verified_app, color: 'primary', click: () => showPreApprove() },
        {id: 'revoke-btn', name: 'Revoke Access', desc: `remove access to ${symbol}`, icon: deleteIcon, color: 'grey', click: () => showRevokeAccess() }
    ]

    onMount(() => {
        stampRatio.then(res => ratio = res)
    })

    const showPreApprove = () => {
        setPage(2);
    }

    const showRevokeAccess = () => {
        setPage(3);
    }

    const copyWalletAddress = () => {
        copyToClipboard(dappInfo.vk)
        copySuccessful = true;
    }
</script>

<style>
#coin-dapp-settings{
    background: inherit;
}

.dapp-info{
    border-left: 1px solid var(--divider-dark);
    padding-left: 20px;
}
.options-box{
    justify-content: center;
    margin: 2rem 0;
}
.options{
    cursor: pointer;
    box-sizing: border-box;
    align-items: center;
    justify-content: space-between;
    width: 175px;
    height: 100px;
    border-radius: 8px;
    padding: 16px 0;
    margin: 0 20px;

}

.options:hover{
    filter: brightness(125%);
}

.icon{
    width: 20px;
}
.icon.copy{
    margin-left: 12px;
    cursor: pointer;
}
p{
    line-height: 0;
}
.flex-row > p {
    margin-right: 12px;
    min-width: fit-content;
}
.flex-row.align-center{
    align-items: center;
}
.text-link{
    font-size: 0.9em;
    word-break: break-word;
}

.trusted-icon{
    width: 25px;
    margin: 1rem 15px 0 0;
    position: relative;
    top: 5px;
}
</style>

<div id="coin-dapp-settings" class="text-primary">
    <div class="flex-row dapp-name">
        {#if trustedApp}
            <div class="trusted-icon" title="automatic transactions ON">
                {@html verified_app}
            </div>
        {/if}
        <h2>{`${dappInfo.appName} Settings`}</h2>
    </div>
    
    <div class="dapp-info text-subtitle3">
        {#if dappInfo}
            
            <div class="flex-row align-center">
                <p>Homepage:</p>
                <a class="text-link" href={dappInfo.url} rel="noopener noreferrer" target="_blank">{dappInfo.url}</a>
            </div>
            <div class="flex-row align-center">
                <p>Contract Name:</p>
                <p>{dappInfo[symbol].contractName}</p>
            </div>
            <div class="flex-row align-center">
                <p>Account Address:</p>
                <a class="text-link" href={addressLink} rel="noopener noreferrer" target="_blank">{dappInfo.vk}</a>
                <div class="icon copy" on:click={copyWalletAddress}>
                    {#if copySuccessful}
                        {@html copyGreen}
                    {:else}
                        {@html copyWhite}
                    {/if}
                </div>
            </div>
            <div class="flex-row align-center">
                <p>Balance:</p>
                <p>{`${balance} ${$currentNetwork.currencySymbol}`}</p>
            </div>
        {/if}
    </div>
    <div class="options-box flex-row">
        {#each options as option}
            <div id={option.id} class="options flex-column"
                class:options-box-grey={ option.color === 'grey'}
                class:options-box-primary={ option.color === 'primary'}
                on:click={option.click}>
                <div class="icon" >{@html option.icon}</div>
                <div class="option-name text-subtitle2">{option.name}</div>
                <div class="option-desc text-caption">{option.desc}</div>
            </div>
        {/each}
    </div>
</div>
