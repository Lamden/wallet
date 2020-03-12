<script>
    import { onMount, getContext } from 'svelte';
    
    //Stores
    import { steps, obscure } from '../../js/stores/stores.js';

	//Components
	import { Components }  from '../Router.svelte'
    const { Button, InputBox } = Components;

    //Utils
    import { decryptObject, decryptStrHash, hashStringValue } from '../../js/utils.js';

    //Context
    const { setKeys, changeStep, nextPage } = getContext('functions');

    //DOM nodes
    let formObj, pwdObj;

    //Props
    export let file;
    export let keystoreFile;
    
    $: pwdHint = keystoreFile.w === "" ? "" : decryptStrHash(obscure, keystoreFile.w);

	onMount(() => {
        steps.update(current => {
            current.currentStep = 3;
            return current
        });
    });

    const handleSubmit = () => {
        if (decryptObject(pwdObj.value, keystoreFile.data)) {
            pwdObj.setCustomValidity('');
        } else {
            pwdObj.setCustomValidity("Incorrect KeyStore Password");
        }
        pwdObj.reportValidity()
        if (formObj.checkValidity()){
            setKeys(decryptObject(pwdObj.value, keystoreFile.data));
            nextPage();
        }
    }

    const refreshValidity = (e) => {
        e.detail.target.setCustomValidity('');
    }

    const refreshValidityKeyup = (e) => {
        if (e.detail.keyCode !== 13) pwdObj.setCustomValidity('');
    }
    
</script>

<style>
.restore-password{
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    width: 498px;
    padding: 0px 24px 0 242px;
    justify-content: center;
}

.text-box{
    margin: 8px 0px 40px;
}

.caption-box{
    display: inline;
    margin-bottom: 16px;
}

a{
    text-decoration: unset;
}

.submit{
    width: 100%;
    height: 40px;
    margin: 20px 0 9px;
}

.hide{
    display: none;
}

</style>

<div class="restore-password">
    <h6>Keystore File Confirmed</h6>

    <div class="text-box text-body1 text-primary">
        Nice job! Now let's enter your original Keystore file password.
    </div>

    <div class="caption-box text-caption text-secondary">
        <strong>last modified date:</strong> 
        <div class="text-primary-dark">{file.lastModifiedDate} </div>
    </div>

    <div class="caption-box text-caption text-secondary" class:hide={pwdHint === ""}>
        <div><strong>Password Hint</strong></div>
        <div id="pwd-hint" class="text-primary-dark">{pwdHint}</div>
    </div>
    
    <form on:submit|preventDefault={() => handleSubmit() } target="_self" bind:this={formObj}>
        <div class="input-box">
            <InputBox
                    id={'pwd-input'}
                    width="100%"
                    label={"Keystore Password"}
                    inputType= 'password'
                    bind:thisInput={pwdObj}
                    on:changed={refreshValidity}
                    on:keyup={refreshValidityKeyup}
                    required={true}
                    autofocus={true}/>
        </div>
        <input  id={'pwd-btn'}
                value="Confirm Password"
                class="button__solid button__purple submit-button submit-button-text submit" 
                type="submit" >
    </form>

    <a  class="text-caption text-secondary" 
        href="https://www.lamden.io" 
        target="_blank" 
        rel="noopener noreferrer" >
        Help & FAQ
    </a>
</div>






