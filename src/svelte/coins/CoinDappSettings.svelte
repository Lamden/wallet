<script>
    import { onMount, getContext } from 'svelte';

    //Utils
    import { copyToClipboard } from '../../js/utils.js'

	//Stores
    import { TxStore, currentNetwork, BalancesStore } from '../../js/stores/stores.js';

    //Components
	import { Components }  from '../Router.svelte'
    const { Button, DropDown } = Components;
    
    //Images
    import copyWhite from '../../img/menu_icons/icon_copy_white.svg';
    import copyGreen from '../../img/menu_icons/icon_copy_green.svg';
    import plusWhite from '../../img/menu_icons/icon_plus-white.svg';
    import deleteIcon from '../../img/menu_icons/icon_delete.svg';

	//Context
    const { close, setPage } = getContext('coinDappOptions_functions');

    //Props
    export let coin;
    export let dappInfo;
    export let stampRatio;

    let selectedWallet = {};
    let copySuccessful = false;
    let options = [
        {id: 'preapproval-btn', name: 'Pre-Approve', desc: 'automatic transactions', icon: plusWhite, color: 'purple', click: () => showPreApprove() },
        {id: 'preapproval-btn', name: 'Revoke Access', desc: 'remove access to wallet', icon: deleteIcon, color: 'grey', click: () => showRevokeAccess() }
    ]

    $: symbol = coin.is_token ? coin.token_symbol : coin.symbol;
    $: balance = BalancesStore.getBalance($currentNetwork.url, coin.vk).toLocaleString('en') || '0'
    $: stampPreApproval = parseInt(dappInfo[$currentNetwork.type].stampPreApproval) || 0;
    $: stampsUsed = parseInt(dappInfo[$currentNetwork.type].stampsUsed) || 0;
    $: stampsRemaining = stampPreApproval - stampsUsed
    $: ratio = 0;
    $: numOfTransactions =  0
    $: totalStamps = 0

    onMount(() => {
        stampRatio.then(res => ratio = res)
        try{
            numOfTransactions =  $TxStore[$currentNetwork.url][dappInfo.vk].length
            totalStamps = calcStamps($TxStore[$currentNetwork.url][dappInfo.vk]) 
        }catch (e){
            numOfTransactions =  0
            totalStamps = 0
        }
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

    const calcStamps = (txList) => {
        let stampCount = 0
        txList.forEach(tx => {
            if (typeof tx.resultInfo !== 'undefined'){
                if (!isNaN(tx.resultInfo.stampsUsed)){
                    stampCount = parseInt(stampCount) + parseInt(tx.resultInfo.stampsUsed)
                }
            }
        })
        return stampCount;
    }

</script>

<style>
.dapp-info{
    border-left: 1px solid var(--divider-color);
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
.purple{
    background-color: var(--primary-color);
}

.purple:hover{
    background-color: #5121de;
}

.grey{
    background-color: var(--bg-color-grey);
}

.grey:hover{
    background-color: #444444;
}

.buttons{
    align-items: center;
}
.icon{
    width: 20px;
}
.icon.copy{
    margin-left: 12px;
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
.outside-link{
    word-break: break-word;
}
</style>

<div id="coin-dapp-settings" class="text-primary">
    <h1>{`${dappInfo.appName} Settings`}</h1>
    <div class="dapp-info text-subtitle3">
        {#if dappInfo}
            
            <div class="flex-row align-center">
                <p>Homepage:</p>
                <a class="outside-link" href={dappInfo.url} rel="noopener noreferrer" target="_blank">{dappInfo.url}</a>
            </div>
            <div class="flex-row align-center">
                <p>Contract Name:</p>
                <p>{dappInfo[$currentNetwork.type].contractName}</p>
            </div>
            <div class="flex-row align-center">
                <p>Accout Address:</p>
                <div class="outside-link" on:click={copyWalletAddress}>{dappInfo.vk}</div>
                <div class="icon copy">
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
            <div class="flex-row align-center">
                <p>Pre-Approved Stamps Remaining:</p>
                <p>{`${stampsRemaining.toLocaleString()} (${stampsRemaining/ratio} ${$currentNetwork.currencySymbol})`}</p>
                <p>{` / ${stampPreApproval.toLocaleString()} stamps`}</p>
            </div>
            <div class="flex-row align-center">
                <p>Transaction Count:</p>
                <p>{`${numOfTransactions.toLocaleString()}`}</p>
            </div>
            <div class="flex-row align-center">
                <p>Total Stamps Used:</p>
                <p>{`${totalStamps.toLocaleString()} stamps (${totalStamps/ratio} ${$currentNetwork.currencySymbol})`}</p>
            </div>
        {/if}
    </div>
    <div class="options-box flex-row">
        {#each options as option}
            <div id={option.id} class="options flex-column"
                class:grey={ option.color === 'grey'}
                class:purple={ option.color === 'purple'}
                on:click={option.click}>
                <div class="icon" >{@html option.icon}</div>
                <div class="option-name text-subtitle2">{option.name}</div>
                <div class="option-desc text-caption">{option.desc}</div>
            </div>
        {/each}
    </div>

    <div class="buttons flex-column">
        <Button classes={'button__solid'} 
            width={'232px'}
            margin={'0 0 0 0'}
            name="Back" 
            click={() => close()} />    
    </div>

</div>
