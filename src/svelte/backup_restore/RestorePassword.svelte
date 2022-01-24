<script>
    import whitelabel from '../../../whitelabel.json'

    import { onMount, getContext } from 'svelte';
    import { fade } from 'svelte/transition';
    
    //Stores
    import { steps, obscure } from '../../js/stores/stores.js';

	//Components
	import { Components,LeftSideFullPage}  from '../Router.svelte'
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
            current.currentStep = 2;
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
.caption-box{
    margin-bottom: 16px;
}

.submit{
    width: 100%;
    height: 40px;
    margin: 20px 0 9px;
    margin-bottom: 1rem;
}

.hide{
    display: none;
}

.caption-box.text-caption{
    text-align: left;
}


.wrap{
    width: 347px;
}

</style>

<LeftSideFullPage title={`Keystore Password`} helpLink={'/wallet/restore_overview'}>
    <div slot="body">
        <div class="text-body1 weight-400 desc">
            This process will allow you to restore your Valut Accounts and Legacy Accounts accounts.
        </div>
    </div>
<div class="flex-row flow-page flex-just-center" in:fade="{{delay: 0, duration: 200}}" slot="content">
    <div class="flex-column wrap">
        <h6>Keystore File Confirmed</h6>

        <div class="flow-text-box text-body1 text-primary">
            Nice job! Now let's enter your Keystore file password.
        </div>

        <div class="caption-box text-caption text-secondary">
            <strong>last modified date:</strong> 
            <div id="last-modified" class="text-secondary">{file.lastModifiedDate} </div>
        </div>

        <div class="caption-box text-caption text-secondary" class:hide={pwdHint === ""}>
            <div><strong>Password Hint</strong></div>
            <div id="pwd-hint" class="text-secondary">{pwdHint}</div>
        </div>
        
        <form id="password-form" on:submit|preventDefault={() => handleSubmit() } target="_self" bind:this={formObj}>
            <div class="input-box">
                <InputBox
                        id={'pwd-input'}
                        label={"Keystore Password"}
                        inputType= 'password'
                        bind:thisInput={pwdObj}
                        on:changed={refreshValidity}
                        on:keyup={refreshValidityKeyup}
                        required={true}
                        height={"56px"}
                        disabledPWShowBtn={false}
                        autofocus={true}/>
            </div>
        </form>
        <div class="flex-column flow-buttons">
            <input  id={'pwd-btn'}
                    form="password-form"
                    value="Confirm Password"
                    class="button__solid button__primary submit-button submit-button-text submit" 
                    type="submit" >
            <Button id={'back-btn'}
                classes={'button__solid'} 
                margin="0 0 1rem"
                width={'347px'}
                name="Back" 
                click={() => changeStep(0)} />  
        </div>
    </div>
</div>
</LeftSideFullPage>