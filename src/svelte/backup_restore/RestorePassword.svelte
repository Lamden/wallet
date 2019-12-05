<script>
    import { onMount, getContext } from 'svelte';
    
    //Stores
    import { steps, obscure } from '../../js/stores/stores.js';

	//Components
	import { Components }  from '../../js/router.js'
    const { Button, InputBox } = Components;

    //Utils
    import { decryptObject, decryptStrHash } from '../../js/utils.js';

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

    function handleSubmit(){
        if (decryptObject(pwdObj.value, keystoreFile.data)) {
            pwdObj.setCustomValidity('');
        } else {
            pwdObj.setCustomValidity("Incorrect Password");
        }
        pwdObj.reportValidity()
        if (formObj.checkValidity()){
            setKeys(decryptObject(pwdObj.value, keystoreFile.data));
            nextPage();
        }
    }

    function refreshValidity(e){
        e.detail.target.setCustomValidity('');
    }

    function refreshValidityKeyup(e){ 
        if (e.detail.keyCode !== 13) pwdObj.setCustomValidity('');
    }
    
</script>

<style>
.restore-password{
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    width: 498px;
    padding: 156px 24px 0 242px;
}

.text-box{
    margin-bottom: 8px;
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
    margin: 20px 0 9px;
}

.hide{
    display: none;
}

</style>

<div class="restore-password">
    <h6>Keystore File Confirmed</h6>
    
    <div class="text-box text-body1 text-primary">
        Nice job. Now let's enter your original Keystore file password.
    </div>
    <div class="caption-box text-caption text-secondary">
        <strong>last modified date:</strong> {file.lastModifiedDate}
    </div>

    <div class="caption-box text-caption text-secondary" class:hide={pwdHint === ""}>
        <div><strong>Password Hint</strong></div>
        <div id="pwd-hint">{pwdHint}</div>
    </div>
    
    <form on:submit|preventDefault={() => handleSubmit() } target="_self" bind:this={formObj}>
        <div class="input-box">
            <InputBox
                    id={'pwd-input'}
                    width="100%"
                    label={"Password"}
                    inputType= 'password'
                    bind:thisInput={pwdObj}
                    on:changed={refreshValidity}
                    on:keyup={refreshValidityKeyup}
                    required={true}/>
        </div>
        <input  id={'pwd-btn'}
                value="Confirm Password"
                class="button__solid button__purple submit submit-button submit-button-text" 
                type="submit" >
    </form>

    <a  class="text-caption text-secondary" 
        href="https://www.lamden.io" 
        target="_blank" 
        rel="noopener noreferrer" >
        Help & FAQ
    </a>
</div>






