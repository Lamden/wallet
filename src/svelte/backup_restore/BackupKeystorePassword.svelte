<script>
    import { onMount, getContext } from 'svelte';
    
    //Stores
    import { steps } from '../../js/stores/stores.js';

	//Components
	import { Components }  from '../../js/router.js'
    const { Button, InputBox } = Components;

    //Context
    const { changeStep, setKeystorePW } = getContext('functions');

    //DOM Nodes
    let formObj, pwdObj1, pwdObj2, hintObj;

    let pattern = `(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\|,.<>\\/? ]).{10,}`;

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
    if(!RegExp.escape) {
        RegExp.escape = function(s) {
            return String(s).replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
        }
    }

    function savePassword(){
        console.log(pwdObj1.value)
        if (pwdObj2.value !== pwdObj1.value) {
            pwdObj2.setCustomValidity("Passwords do not match");
        }
        pwdObj2.reportValidity();
        if (formObj.checkValidity()){
            console.log(pwdObj1.value)
            setKeystorePW( {pwd: pwdObj1.value, hint: hintObj.value} );
            changeStep(4);
        }
    }

    function refreshValidity(e){
        e.detail.target.setCustomValidity('');
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
    margin-bottom: 16px;
}

.buttons{
    margin-bottom: 16px;
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

    <form on:submit|preventDefault={() => savePassword() } bind:this={formObj} target="_self">
            <InputBox
                id={'pwd1-input'}
                label={"Password"}
                placeholder={"At least 8 symbols"}
                width="100%"
                bind:thisInput={pwdObj1}
                on:changed={refreshValidity}
                inputType={"password"}
                {pattern}
                required={true}/>
            <InputBox
                id={'pwd2-input'} 
                label={"Confirm Password"}
                placeholder={"At least 8 symbols"}
                width="100%"
                styles={'margin-bottom: 16px;'}
                bind:thisInput={pwdObj2}
                on:changed={refreshValidity}
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
