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

    const handleSubmit = async () => {
        if (addType === 2) validatePrivateKey();
        if (addType === 3) validatePublicKey();
        
        if (formObj.checkValidity()){
            if (addType === 1) {
                createAndSaveKeys();
            } else {
                saveKeys();
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
                SettingsStore.setLastCoinAddedDate();
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

    const finish = () => {
        chrome.runtime.sendMessage({type: 'balancesStoreUpdateAll', data: $currentNetwork.getNetworkInfo()})
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
</style>

<form  class="flex-column" on:submit|preventDefault={() => handleSubmit() } 
    target="_self" bind:this={formObj}>
        <h3 class="header">Choose Action</h3>
        <div class="button-group flex-row">
            {#each buttonGroup as button, index}
                <Button
                    id={button.id} 
                    classes={`button__solid ${button.class}`} 
                    width={'222px'}
                    name={button.name}
                    click={button.click}
                    tabIndex={"-1"} />
            {/each}        
        </div>
        
        {#if addType === 2}
            <InputBox
                id="private-key"
                margin="0 0 1rem 0"
                bind:thisInput={privateKeyObj}
                label={"Enter Private Key"}
                placeholder={`Private Key`}
                on:changed={refreshValidity}
                on:keyup={refreshValidityKeyup}
                spellcheck={false}
                required={true}
            />
        {/if}

        {#if addType === 3}
            <InputBox
                id="public-key"
                margin="0 0 1rem 0"
                bind:thisInput={publicKeyObj}
                label={"Enter Account Address"}
                placeholder={`Account Address`}
                on:changed={refreshValidity}
                on:keyup={refreshValidityKeyup}
                spellcheck={false}
                required={true}
            />
        {/if}

        <InputBox
            id={"nickname"}
            margin="0 0 2rem 0"
            bind:thisInput={nicknameObj}
            placeholder={`Account Nickname`}
            label={"Account Nickname (Optional)"}
        />

        <div class={"submit-button-box flex-column"}>
            <input class="button__solid button__primary submit submit-button submit-button-text submit-button-size" type="submit" value="Save">
        </div>
</form>