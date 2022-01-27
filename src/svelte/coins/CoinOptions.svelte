<script>
    import { getContext } from 'svelte';

    //Utils
    import { copyToClipboard, displayBalance } from '../../js/utils.js'

	//Stores
    import { CoinStore, currentNetwork, BalancesStore } from '../../js/stores/stores.js';

    //Components
	import { Components }  from '../Router.svelte'
    const { Button, DropDown } = Components;
    
    //Icons
    import CopyIcon from '../icons/CopyIcon.svelte'
    import DeleteIcon from '../icons/DeleteIcon.svelte'
    import EditIcon from '../icons/EditIcon.svelte'

	//Context
    const { getModalData } = getContext('app_functions');
    const { close, setPage, setSelectedCoin} = getContext('coinmodify_functions');

    let selectedWallet;
    let options = [
        {id: 'modify-view-btn', name: 'View', desc: 'Private Key', iconComponent: CopyIcon, color: 'primary', click: () => viewWalletSk() },
        {id: 'modify-edit-btn', name: 'Edit', desc: 'Account Nickname', iconComponent: EditIcon, color: 'primary', click: () => showEdit() },
        {id: 'modify-delete-btn', name: 'Delete', desc: 'Coin from Wallet', iconComponent: DeleteIcon, color: 'grey', click: () => showDelete() },
    ]

    $: coin = getModalData();
    $: nickname = coin.nickname;
    $: balance = !selectedWallet ? '0' : displayBalance(BalancesStore.getBalance($currentNetwork, selectedWallet.vk)) || '0'

    const showEdit = () => {
        setSelectedCoin(selectedWallet);
        setPage(2);
    }

    const showDelete = () => {
        setSelectedCoin(selectedWallet);
        setPage(3);
    }

    const viewWalletSk = () => {
        setSelectedCoin(selectedWallet);
        setPage(7);
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

    const setSelectedWallet = (wallet) => {
        selectedWallet = wallet;
        nickname = wallet.nickname;
    }
</script>

<style>
#coin-options{
    background: inherit;
}
p{
    margin: 0.5rem 0;
}

.coin-info{
    text-align: right;
}

.buttons{
    margin-top: 2rem;
    align-items: center;
}

.options-box{
    margin-top: 2rem;
}

h2{
    margin: 1rem 0 0.5rem;
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
    <div class="buttons flex-column">
        <Button classes={'button__solid'} 
            width={'232px'}
            margin={'0 0 0 0'}
            name="Back" 
            click={() => close()} />    
    </div>

</div>
