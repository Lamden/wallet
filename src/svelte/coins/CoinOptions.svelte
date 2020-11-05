<script>
    import { getContext } from 'svelte';

    //Utils
    import { copyToClipboard, displayBalance } from '../../js/utils.js'

	//Stores
    import { CoinStore, currentNetwork, BalancesStore, dappsDropDown } from '../../js/stores/stores.js';

    //Components
	import { Components }  from '../Router.svelte'
    const { Button, DropDown } = Components;
    
    //Images
    import copyWhite from '../../img/menu_icons/icon_copy_white.svg';
    import copyGreen from '../../img/menu_icons/icon_copy_green.svg';
    import edit from '../../img/menu_icons/icon_edit.svg';
    import del from '../../img/menu_icons/icon_delete.svg';

	//Context
    const { getModalData } = getContext('app_functions');
    const { close, setPage, setSelectedCoin, setMessage, setDappInfo } = getContext('coinmodify_functions');

    let selectedWallet;
    let copySuccessful;
    let options = [
        {id: 'modify-copy-btn', name: 'Copy Account', desc: 'Address to Clipboard', icon: copyWhite, color: 'purple', click: () => copyWalletAddress() },
        {id: 'modify-edit-btn', name: 'Edit', desc: 'Account Nickname', icon: edit, color: 'purple', click: () => showEdit() },
        {id: 'modify-delete-btn', name: 'Delete', desc: 'Coin from Wallet', icon: del, color: 'grey', click: () => showDelete() },
    ]
    const buttons = [
        {id: 'close-btn', name: 'Close', click: () => close(), class: 'button__solid button__purple'}
    ]
    let message = {buttons}

    $: coin = getModalData();
    $: nickname = coin.nickname;
    $: symbol = coin.is_token ? coin.token_symbol : coin.symbol;
    $: balance = !selectedWallet ? '0' : displayBalance(BalancesStore.getBalance($currentNetwork, selectedWallet.vk)) || '0'
    $: dAppList = makeDappList($dappsDropDown)
    $: dAppInfo = undefined;

    const showEdit = () => {
        setSelectedCoin(selectedWallet);
        setPage(2);
    }

    const showDelete = () => {
        setSelectedCoin(selectedWallet);
        setPage(3);
    }

    const copyWalletAddress = () => {
        copyToClipboard(selectedWallet.vk)
        copySuccessful = true;
    }

    const coinList = () => {
        return $CoinStore.map(c => {
            return {
                value: c,
                name: `${c.nickname} - ${c.vk.substring(0, 70 - c.nickname.length)}...`,
                selected: coin === c ? true : false
            }
        })
    }

    const makeDappList = (dAppsList) => {
        if (!selectedWallet) return []
        dAppInfo = undefined;
        let list = [...dAppsList]
        list.forEach(dapp => {
            if (dapp.value.vk === selectedWallet.vk) dAppInfo = {...dapp.value};
        });
        if (!dAppInfo) {
            setDappInfo(undefined)
            list.unshift({
                value: undefined,
                name: "Select from approved dApps",
                selected: true,
            });
            return list
        }else{
            setDappInfo(dAppInfo)
        }
        return []
    }

    const associateDapp = (dapp) => {
        if (dapp){
            let data = {
                dappInfo: dapp,
                newVk: selectedWallet.vk
            }
            chrome.runtime.sendMessage({type: 'reassignDappAccess', data}, (dappAdded) => {
                if (dappAdded !== 'canceled'){
                    if (!dappAdded || chrome.runtime.lastError) {
                        message.text = 'Unable to create dApp relationship'
                        message.type = 'error'
                    }else{
                        message.text = `This wallet is now associated with ${dapp.appName}`
                        message.type = 'success'
                    }
                    setMessage(message)
                    setPage(6)  
                }
            })
        }
    }

    const setSelectedWallet = (wallet) => {
        selectedWallet = wallet;
        nickname = wallet.nickname;
        dAppList = makeDappList($dappsDropDown)
    }
</script>

<style>
.options-box{
    justify-content: space-evenly;
    margin-top: 1rem;
}
.options{
    cursor: pointer;
    box-sizing: border-box;
    align-items: center;
    justify-content: space-between;
    width: 150px;
    height: 95px;
    border-radius: 8px;
    padding: 16px 0;
}
p, a{
    margin: 0.5rem 0;
}

.linked-account{
    margin: 1rem 0 2rem;
}

.coin-info{
    text-align: right;
}
.results{
    margin-top: 7px;
    height: 32px;
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
.copy-message-icon{
    margin-right: 11px;
    width: 12px;
}
.icon{
    width: 20px;
}
.relationship{
    margin-top: 0;
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
</style>

<div id="coin-options" class="text-primary">
    <h2> {`${nickname} Options`} </h2>
    <DropDown
        id={'wallets-dd'}
        items={coinList()} 
        label={'Selected Account'}
        on:selected={(e) => setSelectedWallet(e.detail.selected.value)}
    />
    {#if selectedWallet}
        <p class="coin-info text-subtitle2">
            {`${balance} ${$currentNetwork.currencySymbol}`}
        </p>
    {/if}
    {#if dAppInfo}
        <h3>Currenty Linked Account</h3>
        <div class="flex-row linked-account">
            <img class="app-icon" src="{dAppInfo.url + dAppInfo.logo}" alt="{dAppInfo.appName} logo"/>
            <a href="{dAppInfo.url}" class="outside-link text-body1" rel="noopener noreferrer">{`${dAppInfo.appName}`}</a>
        </div>
        
    {/if}

    {#if dAppList.length > 0}
        <h3>Create Linked Account</h3>
        <DropDown
            id={'dapps-dd'}
            items={dAppList} 
            label={'Currently Linked Apps'}
            margin="0 0 2rem"
            on:selected={(e) => associateDapp(e.detail.selected.value)}
        />
    {/if}

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
    <div class="results">
        {#if copySuccessful}
            <div id={"copy-address"} class="copy-message flex-row text-caption2">
                <div class="copy-message-icon" >{@html copyGreen}</div>
                Account Address Copied
            </div>
        {/if}
    </div>
    <div class="buttons flex-column">
        <Button classes={'button__solid'} 
            width={'232px'}
            margin={'0 0 0 0'}
            name="Back" 
            click={() => close()} />    
    </div>

</div>
