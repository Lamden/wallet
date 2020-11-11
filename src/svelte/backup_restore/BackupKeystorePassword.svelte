<script>
    import whitelabel from '../../../whitelabel.json'

    import { onMount, getContext } from 'svelte';
    import { fade } from 'svelte/transition';
    
    //Stores
    import { steps } from '../../js/stores/stores.js';

	//Components
	import { Components }  from '../Router.svelte'
    const { Button, InputBox, StrongPW } = Components;

    //Context
    const { changeStep, setKeystorePW } = getContext('functions');

    //DOM Nodes
    let formField, pwdInput1, pwdInput2, hintObj;

    let pattern = `(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\|,.<>\\/? ]).{15,}`;
    let pwd = '';

    onMount(() => {
        steps.set({
            currentStep: 1,
            stepList: [
                {number: 1, name: 'Set Password', desc:'Make it Strong'},
                {number: 2, name: 'Generate File', desc:'Just a Second'},
                {number: 3, name: 'Download', desc:'Keep it Safe'},
            ]
        });
    })

	const formValidation = () => {
		pwdInput2.setCustomValidity("")
		if (formField.checkValidity()){
				if (pwdInput1.value === pwdInput2.value){
					setKeystorePW( {pwd: pwdInput1.value, hint: hintObj.value} );
                    changeStep(4);
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

</script>

<style>
    input{
        margin-bottom: 1rem;
    }
    .flow-content-right{
        display: flex;
        justify-content: center;
        align-items: flex-start;
    }
    h3{
        color: var(--font-warning);
        margin-top: 3rem;
    }
</style>

<div class="flex-row flow-page" in:fade="{{delay: 0, duration: 200}}">
    <div class="flex-column flow-content-left">
        <h6>Keystore Password</h6>
        
        <div class="flow-text-box text-body1 text-primary">
            For maximun security we suggest creating a complex password
            and storing it in a password manager such as
            <a class="text-link" href="https://www.lastpass.com/" rel="noopener noreferrer" target="_blank"> LastPass </a>
        </div>

        <StrongPW password={pwd} charLength={15}/>

        <form id="password-form" class="inputs" on:submit|preventDefault={() => {} } bind:this={formField} target="_self">
                <InputBox
                    id={'pwd1-input'}
                    label={"Password"}
                    placeholder={"At least 15 symbols"}
                    bind:thisInput={pwdInput1}
                    on:changed={() => pwd1Validity()}
                    on:keyup={() => strongPasswordUpdate()}
                    inputType={"password"}
                    {pattern}
                    required={true}
                    autofocus={true}/>
                <InputBox
                    id={'pwd2-input'} 
                    label={"Confirm Password"}
                    placeholder={"At least 15 symbols"}
                    margin="0 0 1rem"
                    bind:thisInput={pwdInput2}
                    on:changed={() => pwd2Validity()}
                    inputType={"password"}
                    required={true}/>

                <InputBox
                    id={'hint-input'}
                    bind:thisInput={hintObj}
                    label={"Password Hint (Optional)"}
                    margin="0 0 1rem"
                    placeholder={"Create a Password Hint"}
                />
        </form>
        <div class="flex-column flow-buttons">
            <input  id={'create-pw-btn'}
                    form="password-form"
                    on:click={() => formValidation()}
                    value="Create Keystore"
                    class="button__solid button__primary submit submit-button submit-button-text" 
                    type="submit" > 
            {#if whitelabel.helpLinks.show}
                <a  class="text-link text-caption text-secondary" 
                    href={whitelabel.helpLinks.masterURL || "https://docs.lamden.io/wallet/"}
                    target="_blank" 
                    rel="noopener noreferrer" >
                    Help & FAQ
                </a>
            {/if}  
        </div>
    </div>
    <div class="flow-content-right" in:fade="{{delay: 0, duration: 200}}">
        <h3>{whitelabel.companyName} is not responsible for lost or stolen passwords </h3>
    </div>
</div>


