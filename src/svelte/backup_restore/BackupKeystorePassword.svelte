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
    let formObj;

    let pattern = `(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\|,.<>\\/? ]).{10,}`;
    let pwdInfo = {pwd: '', hint: ''};

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
        if (formObj.checkValidity()){
            setKeystorePW(pwdInfo);
            changeStep(4);
        }
    }

    function validatePassword1(e){
        let obj = e.detail;
        if (obj.validity.patternMismatch){
            obj.setCustomValidity("Password must be 10 characters includeing UPPER/lowercase, number(s) and special character(s)");
        } else {
            obj.setCustomValidity('');
        }
        if (obj.checkValidity()) pattern = RegExp.escape(obj.value); 
    }

    function validatePassword2(e){
        let obj = e.detail;
        if (obj.value !== pwdInfo.pwd) {
            obj.setCustomValidity("Passwords do not match");
        } else {
            obj.setCustomValidity('');
        }
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
                bind:value={pwdInfo.pwd}
                label={"Password"}
                placeholder={"At least 8 symbols"}
                width="100%"
                on:changed={validatePassword1}
                inputType={"password"}
                {pattern}
                required={true}/>
            <InputBox 
                label={"Confirm Password"}
                placeholder={"At least 8 symbols"}
                width="100%"
                styles={'margin-bottom: 16px;'}
                on:changed={validatePassword2}
                inputType={"password"}
                required={true}/>

            <InputBox 
                bind:value={pwdInfo.hint}
                label={"Password Hint (Optional)"}
                styles={'margin-bottom: 16px;'}
                placeholder={"Create a Password Hint"}
                width="100%"
            />

        <div class="buttons">
            <input  value="Create Keystore"
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
