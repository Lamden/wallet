<script>
    import { getContext } from 'svelte';

    //Utils
    import { copyToClipboard, displayBalance } from '../../js/utils.js'

	//Stores
    import { CoinStore, currentNetwork, BalancesStore, dappsDropDown } from '../../js/stores/stores.js';

    //Components
	import { Components }  from '../Router.svelte'
    const { Button, DropDown } = Components;
    
    //Icons
    import CopyIcon from '../icons/CopyIcon.svelte'
    import DeleteIcon from '../icons/DeleteIcon.svelte'
    import EditIcon from '../icons/EditIcon.svelte'

	//Context
    const { getModalData } = getContext('app_functions');
    const { close, setPage, setSelectedCoin, setMessage, setDappInfo } = getContext('coinmodify_functions');

    let selectedWallet;
    let copySuccessful;
    let options = [
        {id: 'modify-copy-btn', name: 'Copy Account', desc: 'Address to Clipboard', iconComponent: CopyIcon, color: 'primary', click: () => copyWalletAddress() },
        {id: 'modify-edit-btn', name: 'Edit', desc: 'Account Nickname', iconComponent: EditIcon, color: 'primary', click: () => showEdit() },
        {id: 'modify-delete-btn', name: 'Delete', desc: 'Coin from Wallet', iconComponent: DeleteIcon, color: 'grey', click: () => showDelete() },
    ]
    const buttons = [
        {id: 'close-btn', name: 'Close', click: () => close(), class: 'button__solid button__primary'}
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
            if (!hasDapps(list)){
                list[0].name = "No Linked Account Connections Found"
            }
            return list
        }else{
            setDappInfo(dAppInfo)
        }
        return []
    }

    const hasDapps = (dappList) => {
        if (dappList.length === 1 && dappList[0].name === "Select from approved dApps") return false
        return true
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
#coin-options{
    background: inherit;
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

.buttons{
    align-items: center;
}
.copy-address-words{
    margin-left: 11px;
}
.icon{
    width: 20px;
}
.options-box{
    margin-top: 2rem;
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
            <a href="{dAppInfo.url}" class="text-link text-body1" target="_blank" rel="noopener noreferrer">{`${dAppInfo.appName}`}</a>
        </div>
        
    {/if}

    {#if selectedWallet }
        {#if selectedWallet.sk === "encrypted" }
            <h3>{dAppInfo ? "Change Linked Account" : "Link This Account To"}</h3>
            <DropDown
                id={'dapps-dd'}
                items={dAppList} 
                label={'Currently Linked Apps'}
                margin="0"
                on:selected={(e) => associateDapp(e.detail.selected.value)}
            />
        {/if}
    {/if}

    <div class="options-box flex-row">
        {#each options as option}
            <div id={option.id} class="options flex-column"
                class:options-box-grey={ option.color === 'grey'}
                class:options-box-primary={ option.color === 'primary'}
                on:click={option.click}>
                <svelte:component 
                    this={option.iconComponent} 
                    width="20px" 
                    color={option.color === "primary" ? "var(--color-white)" : "var(--font-primary)"}
                />
                <div class="option-name text-subtitle2">{option.name}</div>
                <div class="option-desc text-caption text-opacity-1">{option.desc}</div>
            </div>
        {/each}
    </div>
    <div class="results">
        {#if copySuccessful}
            <div id={"copy-address"} class="copy-message flex-row text-caption2">
                <CopyIcon width="12px" color="var(--success-color)" />
                <span class="copy-address-words">Account Address Copied</span>
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
