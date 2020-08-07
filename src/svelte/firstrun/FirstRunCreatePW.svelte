<script> 
    import { onMount, getContext } from 'svelte';
    import { fade } from 'svelte/transition';

    //Stores
    import { steps } from '../../js/stores/stores.js';

    //Utils
    import { hashStringValue } from '../../js/utils.js';

    //Components
	import { Components }  from '../Router.svelte'
    const { InputBox, StrongPW } = Components;

    //Context
    const { changeStep } = getContext('functions');
    
    //DOM NODES
    let formField, pwdInput1, pwdInput2;

    //PROPS
    export let restore = false;

    let pattern = `(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\|,.<>\\/? ]).{10,}`;
    let pwd = '';

    onMount(() => {
        if (restore){
            steps.set({
                currentStep: 1,
                stepList: [
                    {number: 1, name: 'Wallet Password', desc:'Make it Good!'},
                    {number: 2, name: 'Upload', desc:'Keystore File'},
                    {number: 3, name: 'Unlock', desc:'Keystore Password'},
                    {number: 4, name: 'Restore', desc:'Make Your Choice'},
                    {number: 5, name: 'Complete!', desc:'About to Get lit'},
                ]
            });
        }else{
            steps.set({
                currentStep: 1,
                stepList: [
                    {number: 1, name: 'Password', desc:'Make it Good'},
                    {number: 2, name: 'Consent', desc:'Agree to Terms'},
                    {number: 3, name: 'Create Key', desc:'Ensure to Save'},
                    {number: 4, name: 'Get Ready', desc:'About to Get lit'},
                ]
            });
        }

    });

	const formValidation = () => {
		pwdInput2.setCustomValidity("")
		if (formField.checkValidity()){
				if (pwdInput1.value === pwdInput2.value){
					savePassword()
				} else {
					pwdInput2.setCustomValidity("Passwords do not match");
					pwdInput2.reportValidity()
				}
		}
	}
	
	const pwd1Validity = () => {
		pwdInput1.checkValidity()
		pwdInput1.reportValidity()
	}
	
	const pwd2Validity = () => {
		pwdInput2.checkValidity()
		pwdInput2.reportValidity()
    }

    const strongPasswordUpdate = () => {
        pwd = pwdInput1.value;
    }
    
    const savePassword = () => {
        console.log(hashStringValue(pwdInput1.value))
        chrome.runtime.sendMessage({type: 'createPassword', data: hashStringValue(pwdInput1.value)}, (response) => {
            if(response) {
                if (restore) changeStep(1);
                else changeStep(3); 
            } else {
                throw new Error('Could not create password in browser storage.local')
            }
        })
    }
</script>

<style>
    form{
        display: flex;
        flex-direction: column;
    }
    form > input {
        margin-top: 2rem;
    }
</style>

<div class="flex-row flow-page" in:fade="{{delay: 0, duration: 200}}">
    <div class="flex-column flow-content-left">
        <h6 class="text-primary">Create a Password</h6>
        <div class="flow-text-box text-body1 text-primary">
            No username required. This password never changes so use a strong one that you'll remember. We recommend <a class="outside-link" href="https://www.lastpass.com/"> LastPass</a>.
        </div>

        <StrongPW password={pwd} charLength={10}/>

        <form id="password_form" class="flow-buttons" on:submit|preventDefault={() => {} } bind:this={formField} target="_self">
            <div class="input-box">
                <InputBox
                    id="pwd1"
                    bind:thisInput={pwdInput1}
                    on:changed={() => pwd1Validity()}
                    on:keyup={() => strongPasswordUpdate()}
                    label={"Password"}
                    placeholder={"At least 10 symbols"}
                    inputType={'password'}
                    {pattern}
                    required={true}/>
            </div>
            <div class="input-box">
                <InputBox 
                    id="pwd2"
                    bind:thisInput={pwdInput2}
                    on:changed={() => pwd2Validity()}
                    label={"Confirm Password"}
                    placeholder={"At least 10 symbols"}
                    inputType={'password'}
                    required={true}/>
            </div>
        </form>
        <div class="buttons flex-column">
            <input  
                id="save-pwd"
                form="password_form"
                on:click={() => formValidation()}
                value="Save Password"
                class="button__solid button__purple submit submit-button submit-button-text" 
                type="submit" >
        </div>
    </div>
    <div class="flex-column flow-content-right"></div>
</div>
