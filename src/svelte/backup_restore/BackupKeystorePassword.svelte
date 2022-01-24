<script>
    import whitelabel from '../../../whitelabel.json'

    import { onMount, getContext } from 'svelte';
    import { fade } from 'svelte/transition';
    
    //Stores
    import { steps } from '../../js/stores/stores.js';

	//Components
	import { Components, LeftSideFullPage}  from '../Router.svelte'
    const { Button, InputBox, StrongPW } = Components;

    //Context
    const { changeStep, back ,setKeystorePW } = getContext('functions');

    //DOM Nodes
    let formField, pwdInput1, pwdInput2, hintObj;

    let pattern = `(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\|,.<>\\/? ]).{15,}`;
    let pwd = '';

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
    .link{
        color: var(--font-accent);
    }
    h6{
        margin-top: 0;
        margin-bottom: 1.4rem;
        text-align: center;
        font-size: 20px;
        font-weight: 500;
    }
</style>

<LeftSideFullPage title={`Keystore Password`} helpLink={whitelabel.helpLinks.masterURL || "/wallet/backup_overview"}>
    <div slot="body">
        <div class="text-body1 weight-400 desc">
            For maximun security we suggest creating a complex password
            and storing it in a password manager such as
            <a class="text-link link" href="https://www.lastpass.com/" rel="noopener noreferrer" target="_blank"> LastPass </a>
            <div class="text-body1 layout-leftside-warning">{whitelabel.companyName} is not responsible for lost or stolen passwords</div>
        </div>
    </div>
    <div class="flex-row flow-page flex-just-center" in:fade="{{delay: 0, duration: 200}}" slot="content">
        <div class="flex-column">
            <h6 class="text-primary text-center">Keystore Password</h6>

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
                        width={'347px'}
                        height={'56px'}
                        margin="0 0 0.5rem 0"
                        disabledPWShowBtn={false}
                        autofocus={true}/>
                    
                    <StrongPW password={pwd} charLength={15}/>

                    <InputBox
                        id={'pwd2-input'} 
                        label={"Confirm Password"}
                        placeholder={"At least 15 symbols"}
                        margin="0 0 1rem"
                        bind:thisInput={pwdInput2}
                        on:changed={() => pwd2Validity()}
                        inputType={"password"}
                        width={'347px'}
                        disabledPWShowBtn={false}
                        height={'56px'}
                        required={true}/>

                    <InputBox
                        id={'hint-input'}
                        bind:thisInput={hintObj}
                        label={"Password Hint (Optional)"}
                        margin="0 0 1rem"
                        placeholder={"Create a Password Hint"}
                        width={'347px'}
                        height={'56px'}
                    />
            </form>
            <div class="flex-column flow-buttons">
                <input  id={'create-pw-btn'}
                        form="password-form"
                        style="width: 347px;"
                        on:click={() => formValidation()}
                        value="Create Keystore"
                        class="button__solid button__primary submit submit-button submit-button-text" 
                        type="submit" > 
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


