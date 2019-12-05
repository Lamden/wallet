<script>
    import { getContext } from 'svelte';

    //Utils
    import { copyToClipboard } from '../../js/utils.js'

	//Stores
    import { CoinStore } from '../../js/stores/stores.js';

    //Components
	import { Components }  from '../../js/router.js'
    const { Button, DropDown } = Components;
    
    //Images
    import { icons } from '../../js/images.js';
    const { copyWhite, copyGreen, del, edit } = icons;

	//Context
    const { getModalData } = getContext('app_functions');
    const { close, setPage, setSelectedCoin } = getContext('coinmodify_functions');

    let selectedWallet;
    let copySuccessful;
    let options = [
        {id: 'modify-copy-btn', name: 'Copy', desc: 'Key to Clipboard', icon: copyWhite, color: 'purple', click: () => copyWalletAddress() },
        {id: 'modify-edit-btn', name: 'Edit', desc: 'Wallet Nickname', icon: edit, color: 'purple', click: () => showEdit() },
        {id: 'modify-delete-btn', name: 'Delete', desc: 'Coin from Wallet', icon: del, color: 'grey', click: () => showDelete() },
    ]

    $: coin = getModalData();
    $: symbol = coin.is_token ? coin.token_symbol : coin.symbol;
    $: balance = coin.balance ? coin.balance : 0;

    function showEdit(){
        setSelectedCoin(selectedWallet);
        setPage(2);
    }

    function showDelete(){
        setSelectedCoin(selectedWallet);
        setPage(3);
    }
    function copyWalletAddress(){
        copyToClipboard(selectedWallet.vk)
        copySuccessful = true;
    }

    function coinList(){
        return $CoinStore.map(c => {
            return {
                value: c,
                name: `${c.nickname} - ${c.vk.substring(1, 55 - c.nickname.length)}...`,
                selected: coin === c ? true : false
            }
        })
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
    width: 215px;
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

.grey{
    background-color: var(--bg-color-grey);
}

.buttons{
    align-items: center;
}
.copy-message-icon{
    margin-right: 11px;
}
</style>

<div class="modify text-primary">
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
                {`${selectedWallet.symbol} - ${!selectedWallet.balance ? 0 : selectedWallet.balance} ${selectedWallet.symbol}`}
            </strong> 
        {/if}
    </div>
    <div class="options-box flex-row">
        {#each options as option}
            <div id={option.id} class="options flex-column"
                class:grey={ option.color === 'grey'}
                class:purple={ option.color === 'purple'}
                on:click={option.click}>
                <img src={option.icon} alt={`${option.name} icon`} />
                <div class="option-name text-subtitle2">{option.name}</div>
                <div class="option-desc text-caption">{option.desc}</div>
            </div>
        {/each}
    </div>
    <div class="results">
        {#if copySuccessful}
            <div class="copy-message flex-row text-caption2">
                <img class="copy-message-icon" src={copyGreen} alt="copy icon" />
                Wallet Address Copied
            </div>
        {/if}
    </div>
    <div class="buttons flex-column">
        <Button classes={'button__solid'} 
            width={'232px'}
            margin={'0 0 0 0'}
            name="Home" 
            click={() => close()} />    
    </div>

</div>
