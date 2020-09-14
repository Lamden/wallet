<script>
    import { onMount, getContext } from 'svelte';
    import { fade } from 'svelte/transition';
    
    //Stores
    import { steps } from '../../js/stores/stores.js';

	//Components
	import { Components }  from '../Router.svelte'
    const { Button, InputBox } = Components;

    //Utils
    import { hashStringValue } from '../../js/utils.js'

    //Context
    const { changeStep, setPassword } = getContext('functions');

    //DOM Nodes
    let formObj, pwdObj;

    onMount(() => {
        steps.set({
                currentStep: 1,
                stepList: [
                    {number: 1, name: 'Verify', desc:'Wallet Password'},
                    {number: 2, name: 'Decrypt', desc:'View Stored Keys'},
                ]
            });
    })

    const handleSubmit = () => {
        chrome.runtime.sendMessage({type: 'validatePassword', data: hashStringValue(pwdObj.value)}, (valid) => {
            if (!valid || chrome.runtime.lastError){
                setValidity(pwdObj, "Incorrect Password")
            } else {
                setPassword(hashStringValue(pwdObj.value))
                changeStep(2);
            }
        })
    }

    const setValidity = (node, message) => {
        node.setCustomValidity(message);
        node.reportValidity();
    }

    const refreshValidityKeyup = (e) => {
        if (e.detail.keyCode !== 13) setValidity(pwdObj, '')
    }

</script>

<style>
a{
    text-decoration: unset;
}
input{
    margin-bottom: 1rem;
}
</style>

<div class="flex-row flow-page" in:fade="{{delay: 0, duration: 200}}">
    <div class="flex-column flow-content-left">
        <h6>Verify Your Password</h6>
        
        <div class="flow-text-box text-body1 text-primary">
            Enter your Lamden wallet password to continue.
        </div>

        <form id="password_from" on:submit|preventDefault={() => handleSubmit() } bind:this={formObj} target="_self">
            <InputBox
                bind:thisInput={pwdObj}
                label={"Wallet Password"}
                placeholder={`Enter Wallet Password`}
                margin="0 0 1rem 0"
                on:changed={() => setValidity(pwdObj, '')}
                on:keyup={refreshValidityKeyup}
                inputType={"password"}
                required={true}
                autofocus={true} />
        </form>
        <div class="flex-column flow-buttons">
            <input  form="password_from"
                    class="button__solid button__purple submit submit-button submit-button-text submit-button-size"
                    type="submit" 
                    value={"Confirm Password"} />
            <a  class="text-caption text-secondary" 
                href="https://docs.lamden.io/wallet/" 
                target="_blank" 
                rel="noopener noreferrer" >
                Help & FAQ
            </a>        
        </div>
    </div>
    <div class="flex-column flow-content-right" > </div>
</div>
