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
    const { closeModal } = getContext('app_functions');
    const { nextPage, setMessage, detailsPage } = getContext('coinadd_functions');

    //Props
    export let selected;
    
    //DOM NODES
    let formObj, privateKeyObj, publicKeyObj, nicknameObj
    
    let returnMessage = {type:'', text:'', buttons: []};
    let keyPair = {};
    let addType = 1;

    const returnMessageButtons = [
            {id: "home-btn", name: 'Home', click: () => closeModal(), class: 'button__solid button__primary'},
            {id: "another-btn", name: 'Add Another', click: () => detailsPage(), class: 'button__solid'}
        ]

    $: buttonGroup = [
            {id:"create-new-btn", name: 'Create New', click: () => addType = 1, class: addType === 1 ? ' button__primary buttonGroup__left' : 'buttonGroup__left' },
            {id:"add-existing-btn", name: 'Add Existing', click: () => addType = 2, class: addType === 2 ? ' button__primary buttonGroup__center' : 'buttonGroup__center' },
            {id:"track-address-btn", name: 'Track Address', click: () => addType = 3, class: addType === 3 ? ' button__primary buttonGroup__right' : 'buttonGroup__right' }
        ]
    $: vaultExist = $SettingsStore.isVaultCreated;

    const handleSubmit = async () => {
        // if (addType === 2) validatePrivateKey();
        // if (addType === 3) validatePublicKey();
        
        if (formObj.checkValidity()){
            if (vaultExist) {
                addNewVaultAccount();
            } else {
                switchPage('FirstCreateVault');
            }
        }
    }

    const refreshValidity = (e) => {
        e.detail.target.setCustomValidity('');
    }

    const refreshValidityKeyup = (e) => { 
        if (e.detail.keyCode !== 13) e.detail.target.setCustomValidity('');
    }

    const sendMessage = () => {
        returnMessage.buttons = returnMessageButtons
        setMessage(returnMessage)
    }

    const validatePrivateKey = () => {
        privateKeyObj.setCustomValidity('');
        try{
            keyPair.vk = pubFromPriv(selected.network, selected.symbol, privateKeyObj.value);
            keyPair.sk = privateKeyObj.value;
        } catch (e) {
            privateKeyObj.setCustomValidity(e);
        }
        privateKeyObj.reportValidity()
    }

    const validatePublicKey = () => {
        publicKeyObj.setCustomValidity('');
        try{
            keyPair.vk = validateAddress(selected.network, publicKeyObj.value);
        } catch (e) {
            publicKeyObj.setCustomValidity(e);
        }
        publicKeyObj.reportValidity()
    }

    const saveKeys = () => {
        let nickname = nicknameObj.value === '' ? `New ${selected.name} Account` : nicknameObj.value;
        let coinInfo = {
            'network': selected.network,
            'name': selected.name,
            'nickname' : nickname,
            'symbol': selected.symbol,
            'vk': keyPair.vk,
            'sk': keyPair.sk
        }
        if (addType === 3) coinInfo.sk = 'watchOnly'
        chrome.runtime.sendMessage({type: 'accountsAddOne', data: coinInfo}, (result) => {
            if (result.added){
                returnMessage = {type:'success', text: result.reason}
                if (coinInfo.sk !== 'watchOnly') SettingsStore.setLastCoinAddedDate();
                let type = coinInfo.type === 'vault'? 'vault' : coinInfo.sk === 'watchOnly'? 'watchOnly' : 'normal';
                SettingsStore.setLastCoinAddedType(type)
                chrome.runtime.sendMessage({type: 'joinSocket', data: coinInfo.vk})
                chrome.runtime.sendMessage({type: 'balancesStoreUpdateOne', data: coinInfo.vk})
            }

            if (!result.added){
                if (result.reason.includes("already exists")) returnMessage = {type:'warning', text: result.reason}
                else returnMessage = {type:'error', text: result.reason}
            }
            finish();
        })
    }

    const createAndSaveKeys = () => {
        try {
            keyPair = keysFromNew(selected.network, selected.symbol);
            saveKeys();
        } catch (e){
            returnMessage = {type:'error', text: e}
        }
    }

    const addNewVaultAccount = () => {
        let nickname = nicknameObj.value === '' ? `New Tau Account` : nicknameObj.value;
        chrome.runtime.sendMessage({type: 'addVaultAccount', data: nickname}, (result) => {
            if (result.added){
                returnMessage = {type:'success', text: result.reason}
                let type = 'vault'; 
                SettingsStore.setLastCoinAddedType(type)
                chrome.runtime.sendMessage({type: 'joinSocket', data: result.vk})
                chrome.runtime.sendMessage({type: 'balancesStoreUpdateOne', data: result.vk})
            }

            if (!result.added){
                if (result.reason.includes("already exists")) returnMessage = {type:'warning', text: result.reason}
                else returnMessage = {type:'error', text: result.reason}
            }
            finish();
        })
    }

    const finish = () => {
        sendMessage();
        nextPage();
    }
</script>

<style>
.header{
    margin-top: 30px;
}

.button-group{
    margin-bottom: 1rem;
    border-radius: 4px;
    box-shadow: var(--box-shadow-2);
    -webkit-box-shadow: var(--box-shadow-2);
    -moz-box-shadow: var(--box-shadow-2);

}
.submit-button-box{
    flex-grow: 1;
    justify-content: flex-end;
    align-items: center;
    padding-bottom: 20px;
}

.submit-button-size{
    width: 232px;
    height: 46px;
}
h3{
    margin-bottom: 0.5rem;
}
.caution{
    margin-bottom: 2rem;
}
</style>

<form  class="flex-column" on:submit|preventDefault={() => handleSubmit() } 
    target="_self" bind:this={formObj}>
        {#if vaultExist} 
            <h3 class="header">Create New Account</h3>
            <InputBox
                id={"nickname"}
                margin="0 0 2rem 0"
                bind:thisInput={nicknameObj}
                placeholder={`Account Nickname`}
                label={"Account Nickname (Optional)"}
            />
        {:else}
            <h3 class="header">Create A Vault</h3>
            <p class="text-body1 caution">You need to create a Vault before you can add accounts to it.</p>
        {/if}

        <div class={"submit-button-box flex-column"}>
            <input class="button__solid button__primary submit submit-button submit-button-text submit-button-size" type="submit" value={vaultExist?'Save':'Create'}>
        </div>
</form>