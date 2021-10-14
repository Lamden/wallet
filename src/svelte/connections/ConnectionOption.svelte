<script>
    import { getContext, setContext } from 'svelte';

    //Utils
    import { displayBalance } from '../../js/utils.js'

	//Stores
    import { CoinStore, currentNetwork, BalancesStore, DappStore } from '../../js/stores/stores.js';

    //Components
	import { Components, Modals}  from '../Router.svelte'
    const { Button, DropDown } = Components;

    //Images
    import verified_app from '../../img/menu_icons/icon_verified_app.svg'
    import deleteIcon from '../../img/menu_icons/icon_delete.svg';

    //Context
    const { getModalData, closeModal } = getContext('app_functions');
    const { setPage, setMessage } = getContext('connectionOption_functions');

    let selectedWallet
    const buttons = [
        {id: 'close-btn', name: 'Close', click: () => closeModal(), class: 'button__solid button__primary'}
    ]
    let message = {buttons}
    let next = true

    $: data = getModalData();
    $: dappInfo = $DappStore[data.url];
    $: initialVK = dappInfo.vk;
    $: appName = dappInfo.appName;
    $: balance = !selectedWallet ? '0' : displayBalance(BalancesStore.getBalance($currentNetwork, selectedWallet.vk)) || '0'
    $: options = [
        {id: 'preapproval-btn', name: 'Automatic Transactions', desc: `get rid of popups`, icon: verified_app, color: 'primary', click: () => showPreApprove() },
        {id: 'revoke-btn', name: 'Revoke Access', desc: `remove access to ${$currentNetwork.type}`, icon: deleteIcon, color: 'grey', click: () => showRevokeAccess() }
    ];

    const showPreApprove = () => {
        setPage(2)
    }

    const showRevokeAccess = () => {
        setPage(3)
    }

    const coinList = () => {
        return $CoinStore.map(c => {
            return {
                value: c,
                name: `${c.nickname} - ${c.vk.substring(0, 70 - c.nickname.length)}...`,
                selected: dappInfo.vk === c.vk ? true : false
            }
        })
    }

    const associateDapp = (wallet) => {
        console.log(wallet)
        if (wallet){
            if (initialVK === wallet.vk) return
            let data = {
                dappInfo: dappInfo,
                newVk: wallet.vk
            }
            chrome.runtime.sendMessage({type: 'reassignDappAccess', data}, (dappAdded) => {
                if (dappAdded !== 'canceled'){
                    if (!dappAdded || chrome.runtime.lastError) {
                        message.text = 'Unable to create dApp relationship'
                        message.type = 'error'
                    }else{
                        message.text = `This wallet is now associated with ${dappInfo.appName}`
                        message.type = 'success'
                    }
                    setMessage(message)
                    setPage(4)
                }
            })
        }
    }

</script>

<style>
    #dapp-options{
        background: inherit;
    }
    p, a{
        margin: 0.5rem 0;
    }
    .linked-account{
        margin: 1rem 0 2rem;
    }

    .dapp-info{
        text-align: right;
    }

    .buttons{
        align-items: center;
    }

    .back{
        margin-top: 2rem;
    }

    .icon{
        width: 20px;
    }

    h3{
        margin: 1rem 0 0;
    }
    h2{
        margin: 1rem 0 0.5rem;
    }
    .app-icon{
        width: 40px;
        height: 40px;
        margin-right: 10px;
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
</style>

<div id="dapp-options" class="text-primary">
    {#if next}
        <h2> {`${appName} Options`} </h2>
        <div class="flex-row linked-account">
            <img class="app-icon" src="{dappInfo.url + dappInfo.logo}" alt="{dappInfo.appName} logo"/>
            <a href="{dappInfo.url}" class="text-link text-body1" target="_blank" rel="noopener noreferrer">{`${dappInfo.appName}`}</a>
        </div>
        <h3>Change Linked Account</h3>
        <DropDown
            id={'wallets-dd'}
            items={coinList()} 
            label={'Selected Account'}
            on:selected={(e) => associateDapp(e.detail.selected.value)}
        />
        {#if selectedWallet}
            <p class="dapp-info text-subtitle2">
                {`${balance} ${$currentNetwork.currencySymbol}`}
            </p>
        {/if}
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
        <div class="buttons flex-column back">
            <Button classes={'button__solid'} 
                width={'232px'}
                margin={'0 0 0 0'}
                name="Back" 
                click={ ()=> { closeModal() } }
            />    
        </div>
    {/if}
</div>
