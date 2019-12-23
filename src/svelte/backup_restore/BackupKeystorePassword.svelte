<script>
    import { onMount, getContext } from 'svelte';
    
    //Stores
    import { steps } from '../../js/stores/stores.js';

	//Components
	import { Components }  from '../../js/router.js'
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

	function formValidation(){
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
	
	function pwd1Validity(){
		pwdInput1.checkValidity()
		pwdInput1.reportValidity()
	}
	
	function pwd2Validity(){
		pwdInput2.checkValidity()
		pwdInput2.reportValidity()
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

    function strongPasswordUpdate(){
        pwd = pwdInput1.value;
    }

</script>

<style>
.backup-createpw{
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    width: 498px;
    padding: 123px 24px 0 242px;
}

.text-box{
    margin-bottom: 8px;
}

.text-box2{
    color: var(--font-primary-dark);
    margin-bottom: 1rem;
}

.inputs{
    margin-top: 1rem;
}

.buttons{
    margin-bottom: 1rem;
}
a{
    text-decoration: unset;
}

</style>

<div class="backup-createpw">
    <h6>Keystore Password</h6>
    
    <div class="text-box text-body1 text-primary">
        We suggest creating a complex password
        and storing it in a password manager such as
        <a class="outside-link" href="https://www.lastpass.com/"> www.lastpass.com </a>
    </div>

    <div class="text-box2 text-body1">
        Lamden is not responsible for lost or stolen passwords 
    </div>

    <StrongPW password={pwd} charLength={15}/>

    <form class="inputs" on:submit|preventDefault={() => {} } bind:this={formField} target="_self">
            <InputBox
                id={'pwd1-input'}
                label={"Password"}
                placeholder={"At least 15 symbols"}
                width="100%"
                bind:thisInput={pwdInput1}
                on:changed={() => pwd1Validity()}
                on:keyup={() => strongPasswordUpdate()}
                inputType={"password"}
                {pattern}
                required={true}/>
            <InputBox
                id={'pwd2-input'} 
                label={"Confirm Password"}
                placeholder={"At least 15 symbols"}
                width="100%"
                styles={'margin-bottom: 16px;'}
                bind:thisInput={pwdInput2}
                on:changed={() => pwd2Validity()}
                inputType={"password"}
                required={true}/>

            <InputBox
                id={'hint-input'}
                bind:thisInput={hintObj}
                label={"Password Hint (Optional)"}
                styles={'margin-bottom: 16px;'}
                placeholder={"Create a Password Hint"}
                width="100%"
            />

        <div class="buttons">
            <input  id={'create-pw-btn'}
                    on:click={() => formValidation()}
                    value="Create Keystore"
                    class="button__solid button__purple submit submit-button submit-button-text" 
                    type="submit" > 
        </div>
    </form>


    <a  class="text-caption text-secondary" 
        href="https://www.lamden.io" 
        target="_blank" 
        rel="noopener noreferrer" >
        Help & FAQ
    </a>
</div>
