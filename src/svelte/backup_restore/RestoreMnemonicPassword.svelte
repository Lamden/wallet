<script>
    import whitelabel from '../../../whitelabel.json'

    import { onMount, getContext } from 'svelte';
    import { fade } from 'svelte/transition';
    
    //Stores
    import { steps } from '../../js/stores/stores.js';

	//Components
	import { Components, LeftSideFullPage}  from '../Router.svelte'
    const { Button, InputBox } = Components;

    //Utils
    import { hashStringValue } from '../../js/utils.js'

    //Context
    const { back, changeStep, getSelectedType} = getContext('functions');

    //DOM Nodes
    let formObj, pwdObj;

    let selectedType = getSelectedType();

    const handleSubmit = () => {
        chrome.runtime.sendMessage({type: 'validatePassword', data: hashStringValue(pwdObj.value)}, (valid) => {
            if (!valid || chrome.runtime.lastError){
                setValidity(pwdObj, "Incorrect Password")
            } else {
                changeStep(7);
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
    input{
        margin-bottom: 1rem;
    }

    .wrap{
        width: 347px;  
    }
</style>

<LeftSideFullPage title={`Verify Your Password`} helpLink={'/wallet/restore_overview'}>
    <div slot="body">
        <div class="text-body1 weight-400 desc">
            Enter your password to continue.
        </div>
    </div>
    <div class="flex-row flow-page flex-just-center" in:fade="{{delay: 0, duration: 200}}" slot="content">
        <div class="flex-column wrap">
            <h6 class="text-primary text-center">Verify Your Password</h6>
            
            <div class="text-body1 text-primary text-box">
                Enter your Lamden Vault password to continue.
            </div>

            <form id="password_from" on:submit|preventDefault={() => handleSubmit() } bind:this={formObj} target="_self">
                <InputBox
                    bind:thisInput={pwdObj}
                    label={"Wallet Password"}
                    placeholder={`Enter Wallet Password`}
                    margin="0 0 1.5rem 0"
                    on:changed={() => setValidity(pwdObj, '')}
                    on:keyup={refreshValidityKeyup}
                    inputType={"password"}
                    width={"100%"}
                    height="56px"
                    required={true}
                    disabledPWShowBtn={false}
                    autofocus={true} />
            </form>
            <div class="flex-column flow-buttons">
                <input  form="password_from"
                        class="button__solid button__primary submit submit-button submit-button-text submit-button-size"
                        type="submit" 
                        style="width: 100%;"
                        value={"Confirm Password"} />   
                <Button id="restore-wallet"
                    classes={'button__solid'}
                    margin={'0 0 .625rem 0'}
                    name="Back" 
                    width={'347px'}
                    click={() => back()} />  
            </div>
        </div>
    </div>
</LeftSideFullPage>
