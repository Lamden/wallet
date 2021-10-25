<script>
    import whitelabel from '../../../whitelabel.json'

    import { getContext } from 'svelte';
    
	//Stores
    import { currentNetwork } from '../../js/stores/stores.js';

    //Components
	import { Components }  from '../Router.svelte'
    const { Button, InputBox } = Components;

    //Utils
    import { hashStringValue } from '../../js/utils.js'

    //Images
    import caution from '../../img/menu_icons/icon_caution.svg';

    //Context
    const { appHome } = getContext('app_functions');
    const { setMessage, setPage } = getContext('connectionOption_functions');

    //DOM Nodes
    let formObj, passwordObj;

    //Props
    export let dappInfo

    let passwordOkay = false;
    let revokeAllAccess = false;
    const buttons = [
        {id: 'close-btn', name: 'ok', click: () => appHome(), class: 'button__solid button__primary'}
    ]
    let message = {buttons, type: 'success'}

    const handleSubmit = (form) => {
        if (passwordOkay){
            if (formObj.checkValidity()){
                let networks = [$currentNetwork.type]
                if (revokeAllAccess){
                    networks = [$currentNetwork.type]
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
    #coin-dapp-revoke{
        background: inherit;
    }
    .buttons{
        align-items: center;
        margin: 0 0 1rem;
    }
    .bullets {
        border-left: 1px solid var(--divider-dark);
        padding-left: 20px;
    }
    .bullets p > a{
        margin: 0 5px;
    }
    .bullets > .flex-row{
        align-items: center;
    }
    .flex-row > .text-accent{
        margin-left: 5px;
    }

    .content-box{
        width: 260px;
        margin: 1rem auto 2rem;
    }

    .caution-message{
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

<div id="coin-dapp-revoke">
    <h2> {`${dappInfo.appName} - Revoke Wallet Access`} </h2>
    <h3>You are about to do the following:</h3>
    <div class="bullets text-subtitle2">
        <div class="flex-row">
            <p class="flex-row">
                {`Prevent `}
                <a class="text-link" href={dappInfo.url} rel="noopener noreferrer" target="_blank">{dappInfo.url}</a>
                {`from sending transactions through this Account on Lamden's `}
            </p>
            <div class="text-accent">{`${$currentNetwork.type.toUpperCase()}.`}</div>
        </div>
        <div id={'caution-msg'} class="flex-row caution-message">
            <div class="icon" >{@html caution}</div>
            <p class="text-body-1">{`This action will NOT delete the Account from your ${whitelabel.companyName} Wallet.`}</p>
        </div>
    </div>

    <form on:submit|preventDefault={() => handleSubmit(formObj) } bind:this={formObj} target="_self">
        <div class="content-box">
            {#if passwordOkay ==- false}
                <InputBox
                    id={'pwd-input'}
                    bind:thisInput={passwordObj}
                    label={"Password"}
                    placeholder={`Enter ${whitelabel.companyName} Wallet Password`}
                    on:changed={() => setValidity(passwordObj, '')}
                    on:keyup={refreshValidityKeyup}
                    inputType={"password"}
                    required={true}/>
            {/if}
        </div>
        <div class="buttons flex-column">
            <input  class="button__solid submit submit-button submit-button-text submit"
                    class:button__red={passwordOkay}
                    class:button__primary={!passwordOkay}
                    type="submit" 
                    value={passwordOkay ? "Revoke Access" : "Validate Wallet Password"}>
            <Button 
                    id={"back-btn"}
                    classes={'button__solid buttom__primary'} 
                    width={'260px'}
                    margin={'10px 0 0 0'}
                    name="Back" 
                    click={() => setPage(1)} />  
        </div>
    </form>
</div>