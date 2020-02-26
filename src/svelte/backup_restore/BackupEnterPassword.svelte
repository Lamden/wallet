<script>
    import { onMount, getContext } from 'svelte';
    
    //Stores
    import { CoinStore, steps } from '../../js/stores/stores.js';

	//Components
	import { Components }  from '../Router.svelte'
    const { Button, InputBox } = Components;

    //Utils
    import { hashStringValue } from '../../js/utils.js'

    //Context
    const { changeStep } = getContext('functions');

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

    function handleSubmit(){
        chrome.runtime.sendMessage({type: 'validatePassword', data: hashStringValue(pwdObj.value)}, (valid) => {
            if (!valid || chrome.runtime.lastError){
                pwdObj.setCustomValidity("Incorrect Password");
            } else {
                pwdObj.setCustomValidity('');
            }
            pwdObj.reportValidity()
            if (formObj.checkValidity()){
                changeStep(2);
            }
        })
    }

    function refreshValidityKeyup(e){ 
        if (e.detail.keyCode !== 13) pwdObj.setCustomValidity('');
    }

    function refreshValidity(e){
        e.detail.target.setCustomValidity('');
    }

</script>

<style>
.backup-password{
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    width: 498px;
    padding: 0px 24px 0 242px;
    justify-content: center;
}

.text-box{
    margin-bottom: 75px;
}
.buttons{
     margin-bottom: 16px;
}

a{
    text-decoration: unset;
}
</style>

<div class="backup-password">
    <h6>Verify Your Password</h6>
    
    <div class="text-box text-body1 text-primary">
        Enter your Lamden wallet password to continue.
    </div>

    <form on:submit|preventDefault={() => handleSubmit() } bind:this={formObj} target="_self">
        <InputBox
            bind:thisInput={pwdObj}
            label={"Wallet Password"}
            placeholder={`Enter Wallet Password`}
            styles={`margin-bottom: 17px;`}
            on:changed={refreshValidity}
            on:keyup={refreshValidityKeyup}
            inputType={"password"}
            required={true}
            autofocus={true} />

        <div class="buttons flex-column">
            <input  class="button__solid button__purple submit submit-button submit-button-text submit-button-size"
                    type="submit" 
                    value={"Confirm Password"} />
        </div>
    </form>

    <a  class="text-caption text-secondary" 
        href="https://www.lamden.io" 
        target="_blank" 
        rel="noopener noreferrer" >
        Help & FAQ
    </a>
</div>