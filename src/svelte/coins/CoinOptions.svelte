<script>
    import { getContext } from 'svelte';

    //Utils
    import { copyToClipboard } from '../../js/utils.js'

	//Stores
    import { CoinStore, TxStore, currentNetwork, BalancesStore } from '../../js/stores/stores.js';

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
    const { close, setPage, setSelectedCoin } = getContext('coinmodify_functions');

    let selectedWallet;
    let copySuccessful;
    let options = [
        {id: 'modify-copy-btn', name: 'Copy', desc: 'Key to Clipboard', icon: copyWhite, color: 'purple', click: () => copyWalletAddress() },
        {id: 'modify-edit-btn', name: 'Edit', desc: 'Wallet Nickname', icon: edit, color: 'purple', click: () => showEdit() },
        {id: 'delete-tx-btn', name: 'Purge Transactions', desc: 'Clear Tx History', icon: del, color: 'grey', click: () => clearTxHistory() },
        {id: 'modify-delete-btn', name: 'Delete', desc: 'Coin from Wallet', icon: del, color: 'grey', click: () => showDelete() },
    ]

    $: coin = getModalData();
    $: symbol = coin.is_token ? coin.token_symbol : coin.symbol;
    $: balance = BalancesStore.getBalance($currentNetwork.url, coin.vk).toLocaleString('en') || '0'

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

    const clearTxHistory = () => {
        TxStore.clearTx($currentNetwork, selectedWallet.vk)
    }
</script>

<style>
.options-box{
    justify-content: space-between;
    margin-top: 13px;
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
</style>

<div id="coin-options" class="text-primary">
    <h5> {`Recieve ${coin.name} ${coin.symbol}`} </h5>
    <DropDown
        id={'wallets-dd'}
        items={coinList()} 
        label={'Wallets'}
        styles="margin-bottom: 19px;"
        on:selected={(e) => selectedWallet = e.detail.selected.value}
    />

    <div class="coin-info text-subtitle3">
        {#if selectedWallet}
            {selectedWallet.name}
            <strong>
                {`${selectedWallet.symbol} - ${balance} ${$currentNetwork.currencySymbol}`}
            </strong> 
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
    <div class="results">
        {#if copySuccessful}
            <div id={"copy-address"} class="copy-message flex-row text-caption2">
                <div class="copy-message-icon" >{@html copyGreen}</div>
                Wallet Address Copied
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
