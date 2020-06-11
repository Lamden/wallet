<script>
    import { getContext } from 'svelte';
    
	//Stores
    import { currentNetwork } from '../../js/stores/stores.js';

    //Components
	import { Components }  from '../Router.svelte'
    const { Button, InputBox } = Components;

    //Utils
    import { hashStringValue } from '../../js/utils.js'

    //Images
    import warning from '../../img/menu_icons/icon_warning.svg';

    //Context
    const { appHome } = getContext('app_functions');
    const { setMessage, setPage, home, close } = getContext('coinDappOptions_functions');

    //DOM Nodes
    let formObj, passwordObj;

    //Props
    export let dappInfo

    let passwordOkay = false;
    let revokeAllAccess = false;
    const buttons = [
        {id: 'close-btn', name: 'ok', click: () => appHome(), class: 'button__solid button__purple'}
    ]
    let message = {buttons, type: 'success'}
    let allNetworks = ['mockchain', 'testnet', 'mainnet']

    const handleSubmit = (form) => {
        if (passwordOkay){
            if (formObj.checkValidity()){
                let networks = [$currentNetwork.type]
                if (revokeAllAccess){
                    networks = allNetworks
                }
                chrome.runtime.sendMessage({type: 'revokeDappAccess', data: {dappInfo, networks}}, (response) => {
                    if (!response || chrome.runtime.lastError){
                        message.text =`There was an error removing access for ${dappInfo.appName}`
                        message.type = 'error'
                        setMessage(message)
                        setPage(4);
                    } else {
                        message.text =`${dappInfo.appName}'s Wallet Access Has Been Revoked`
                        setMessage(message)
                        setPage(5);
                    }
                })  
            }
        }else{
            chrome.runtime.sendMessage({type: 'validatePassword', data: hashStringValue(passwordObj.value)}, (valid) => {
                if (!valid || chrome.runtime.lastError){
                    setValidity(passwordObj, "Incorrect Password")
                    passwordOkay = false;
                } else {
                    passwordOkay = valid;
                }
            })
        }
    }

    const setValidity = (node, message) => {
        node.setCustomValidity(message);
        node.reportValidity();
    }

    const refreshValidityKeyup = (e) => {
        if (e.detail.keyCode !== 13) setValidity(passwordObj, '')
    }
</script>

<style>
.buttons{
    align-items: center;
    margin: 0 0 1rem;
}
.bullets {
    border-left: 1px solid var(--divider-color);
    padding-left: 20px;
}
.bullets p > a{
    margin: 0 5px;
}
.bullets > .flex-row{
    align-items: center;
}
.flex-row > .text-cyan{
    margin-left: 5px;
}
.button-red{
    color: #FFFFFF;
    background: red;
}

.button-purple{
    color: #FFFFFF;
    background: var(--primary-color);
}

.content-box{
    margin: 1rem 0;
}

.warning-message{
    align-items: center;
    justify-content: center;
}

.icon{
    margin-right: 10px;
    width: 20px;
}

.submit{
    width: 260px;
}
</style>

<div class="coin-delete">
    <h1> {`${dappInfo.appName} - Revoke Wallet Access`} </h1>
    <h2>You are about to do the following:</h2>
    <div class="bullets text-subtitle2">
        <div class="flex-row">
            <p class="flex-row">
                {`Prevent `}
                <a class="outside-link" href={dappInfo.url} rel="noopener noreferrer" target="_blank">{dappInfo.url}</a>
                {`from sending transactions through this Account on Lamden's `}
            </p>
            <div class="text-cyan">{`${$currentNetwork.type.toUpperCase()}.`}</div>
        </div>
        <p>{`This action will NOT delete the Account from your Lamden Wallet.`}</p>
    </div>

    <form on:submit|preventDefault={() => handleSubmit(formObj) } bind:this={formObj} target="_self">
        <div class="content-box">
            {#if passwordOkay ==- false}
                <InputBox
                    id={'pwd-input'}
                    bind:thisInput={passwordObj}
                    label={"Password"}
                    placeholder={`Enter Lamden Wallet Password`}
                    styles={`margin-bottom: 17px;`}
                    on:changed={() => setValidity(passwordObj, '')}
                    on:keyup={refreshValidityKeyup}
                    inputType={"password"}
                    required={true}/>
            {:else}
                <div id={'warning-msg'} class="warning-message flex-row">
                    <div class="icon" >{@html warning}</div>
                    <h6>{`Please Confirm ${dappInfo.appName} Access Removal`}</h6>
                </div>
            {/if}
        </div>
        <div class="buttons flex-column">
            <input  class="button__solid submit submit-button submit-button-text submit"
                    class:button-red={passwordOkay}
                    class:button-purple={!passwordOkay}
                    type="submit" 
                    value={passwordOkay ? "Revoke Access" : "Validate Wallet Password"}>
            <Button 
                    id={"back-btn"}
                    classes={'button__solid buttom__purple'} 
                    width={'260px'}
                    margin={'10px 0 0 0'}
                    name="Back" 
                    click={() => home()} />  
        </div>
    </form>
</div>