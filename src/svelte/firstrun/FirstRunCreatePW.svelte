<script> 
    import { onMount, getContext } from 'svelte';

    //Stores
    import { CoinStore, password, steps } from '../../js/stores/stores.js';

    //Utils
    import { encryptObject } from '../../js/utils.js';

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

	function formValidation(){
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
	
	function pwd1Validity(){
		pwdInput1.checkValidity()
		pwdInput1.reportValidity()
	}
	
	function pwd2Validity(){
		pwdInput2.checkValidity()
		pwdInput2.reportValidity()
    }

    function strongPasswordUpdate(){
        pwd = pwdInput1.value;
    }
    
    function savePassword(){
        try{
            CoinStore.setPwd(pwdInput1.value);
            if (restore) changeStep(1);
            else changeStep(3);
            
        } catch (err) {
            console.log(err)
        }
    }
</script>

<style>
.firstrun-create-pwd{
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    width: 498px;
    padding: 50px 24px 0 242px;
}

form{
    display: flex;
    flex-direction: column;
}

.input-box{
    margin-bottom: 14px;
}

.text-box{
    margin-bottom: 1rem;
}
</style>

<div class="firstrun-create-pwd">
    <h6 class="text-primary">Create a Password</h6>
    <div class="text-box text-body1 text-primary">
        No username required. Use a strong password that you'll remember.
    </div>

    <StrongPW password={pwd} charLength={10}/>

    <form on:submit|preventDefault={() => {} } bind:this={formField} target="_self">
        <div class="input-box">
            <InputBox
                id="pwd1"
                bind:thisInput={pwdInput1}
                on:changed={() => pwd1Validity()}
                on:keyup={() => strongPasswordUpdate()}
                label={"Password"}
                placeholder={"At least 10 symbols"}
                inputType={'password'}
                width="100%"
                margin={"21px 0 0 0"}
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
                width="100%"
                required={true}/>
        </div>
        <input  id="save-pwd"
                on:click={() => formValidation()}
                value="Save Password"
                class="button__solid button__purple submit submit-button submit-button-text" 
                type="submit" >
    </form>
</div>

