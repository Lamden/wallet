<script> 
    import whitelabel from '../../../whitelabel.json'
    
    import { onMount, getContext } from 'svelte';
    import { fade } from 'svelte/transition';

    //Stores
    import { steps } from '../../js/stores/stores.js';

    //Utils
    import { hashStringValue } from '../../js/utils.js';

    //Components
	import { Components, LeftSideFullPage }  from '../Router.svelte'
    const { InputBox, StrongPW, Button} = Components;

    //Context
    const { nextPage, back, changeStep} = getContext('functions');
    
    //DOM NODES
    let formField, pwdInput1, pwdInput2;

    //PROPS
    export let restore = false;

    let pattern = `(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\|,.<>\\/? ]).{10,}`;
    let pwd = '';

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
        chrome.runtime.sendMessage({type: 'createPassword', data: hashStringValue(pwdInput1.value)}, (response) => {
            if(response) {
                if (restore) changeStep(1);
                else changeStep(2); 
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
</style>

<LeftSideFullPage title={whitelabel.firstRun_setup.create_pw.title} helpLink={whitelabel.firstRun_setup.create_pw.helpLink}>
    <div slot="body">
        <div class="text-body1 weight-400 desc">
            For maximun security we suggest creating a complex password and storing it in a password manager such as 
            <a class="layout-leftside-text-link weight-700" href="https://www.lastpass.com/" rel="noopener noreferrer" target="_blank"> LastPass</a>.
            <div class="text-body1 layout-leftside-warning">{whitelabel.firstRun_setup.create_pw.warning}</div>
        </div>
    </div>
    <div class="flex-row flow-page flex-just-center" in:fade="{{delay: 0, duration: 200}}" slot="content">
        <div class="flex-column">
            <h6 class="text-primary text-center">Create Password</h6>
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
                        width={"347px"}
                        height={"56px"}
                        margin="0 0 0.5rem 0"
                        {pattern}
                        disabledPWShowBtn={false}
                        required={true}/>
                </div>
                <StrongPW password={pwd} charLength={10}/>
                <div class="input-box">
                    <InputBox 
                        id="pwd2"
                        bind:thisInput={pwdInput2}
                        on:changed={() => pwd2Validity()}
                        label={"Confirm Password"}
                        placeholder={"At least 10 symbols"}
                        inputType={'password'}
                        width={"347px"}
                        height={"56px"}
                        margin="0 0 0.5rem 0"
                        disabledPWShowBtn={false}
                        required={true}/>
                </div>
            </form>
            <div class="buttons flex-column">
                <Button id="save-pwd"
                classes={'button__solid button__primary'}
                margin={'.625rem 0 1rem 0'}
                name="Save Password" 
                width={'347px'}
                click={() => formValidation()} />
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
