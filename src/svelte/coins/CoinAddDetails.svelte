<script>
    import { getContext} from 'svelte';
    
	//Stores
    import { SettingsStore, CoinStore,  currentNetwork } from '../../js/stores/stores.js';

    //Components
    import { Components, CoinAddAccount, CoinAddToken } from '../Router.svelte';
    const { Button, InputBox, DropDown, MessageBox } = Components;
    
	//Utils
    import { pubFromPriv, keysFromNew, validateAddress } from '../../js/crypto/wallets.js';
    import { encryptStrHash, decryptStrHash } from '../../js/utils.js';

	//Context
    const { closeModal, getModalData } = getContext('app_functions');
    const { nextPage, setMessage, detailsPage } = getContext('coinadd_functions');
    
    //DOM NODES
    let formObj, privateKeyObj, publicKeyObj, nicknameObj
    
    let returnMessage = {type:'', text:'', buttons: []};
    let selectedInput;
    let keyPair = {};
    let addType = 1;

    let modal_selected = getModalData()

    const returnMessageButtons = [
        {id: "home-btn", name: 'Home', click: () => closeModal(), class: 'button__solid button__primary'},
        {id: "another-btn", name: 'Add Another', click: () => detailsPage(), class: 'button__solid'}
    ]

    $: buttonGroup = [
        {id:"create-new-btn", name: 'Create New', click: () => addType = 1, class: addType === 1 ? ' button__primary buttonGroup__left' : 'buttonGroup__left' },
        {id:"add-existing-btn", name: 'Add Existing', click: () => addType = 2, class: addType === 2 ? ' button__primary buttonGroup__center' : 'buttonGroup__center' },
        {id:"track-address-btn", name: 'Track Address', click: () => addType = 3, class: addType === 3 ? ' button__primary buttonGroup__right' : 'buttonGroup__right' }
    ]

    $: optionsList = [
        {name: "Account", value: {name: 'Lamden', symbol: 'TAU', contract: 'currency', network: 'lamden'}, selected: modal_selected === "account"},
        {name: "Token", value: "token", selected: modal_selected === "token"}
    ]
    $: selected = modal_selected

    const handleSelection = (e) => selected = e.detail.selected.value;

    const createOptionsList = () => {
        return 
    }
</script>

<style>
    .coin-add-details{
        width: 500px;
        background: inherit;
    }
</style>

<div  class="coin-add-details flex-column" >
    <h2 class="header">Add New Account or Token</h2>
    <div class="text-subtitle3">
        Select an item to add
    </div>
    <DropDown  
        items={optionsList}
        id={'options'} 
        label={'What to add?'}
        margin="0 0 1rem 0"
        on:selected={handleSelection}
    />
    {#if selected}

        {#if selected === "token"}
            <CoinAddToken />
        {:else}
            <CoinAddAccount {selected}/>
        {/if}
    {/if}
</div>
