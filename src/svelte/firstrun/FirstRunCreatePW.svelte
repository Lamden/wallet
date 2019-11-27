<script> 
    import { onMount, getContext } from 'svelte';

    //Stores
    import { HashStore, password, steps } from '../../js/stores/stores.js';

    //Utils
    import { encryptObject } from '../../js/utils.js';

    //Components
	import { Components }  from '../../js/router.js'
    const { InputBox } = Components;

    //Context
    const { changeStep } = getContext('functions');
    
    //DOM NODES
    let formField;

    //PROPS
    export let restore = false;

    let tempPassword;
    let pattern = `(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\|,.<>\\/? ]).{10,}`;

    onMount(() => {
        if (restore){
            steps.update(current => {
                current.currentStep = 4;
                return current
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

    if(!RegExp.escape) {
        RegExp.escape = function(s) {
            return String(s).replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
        }
    }

    function savePassword(){
        if (formField.checkValidity()){
            try{
                HashStore.setPassword($password);
                if (restore) changeStep(5);
                else changeStep(3);
                
            } catch (e) {
                console.log(e)
            }
        }
    }

    function validatePassword1(e){
        console.log(e)
        let obj = e.detail;
        tempPassword = obj.value;
        if (obj.validity.patternMismatch){
            obj.setCustomValidity("Password must be 10 characters includeing UPPER/lowercase, number(s) and special character(s)");
        } else {
            password.set(e.detail.value);
            obj.setCustomValidity('');
        }
        if (obj.checkValidity()) pattern = RegExp.escape(obj.value); 
    }

    function validatePassword2(e){
        let obj = e.detail;
        if (obj.value !== tempPassword) {
            obj.setCustomValidity("Passwords do not match");
        } else {
            obj.setCustomValidity('');
        }
    }

</script>

<style>
.page{
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    width: 498px;
    padding: 156px 24px 0 242px;
}

.heading{
    margin-bottom: 16px;
}

form{
    display: flex;
    flex-direction: column;
}

.input-box{
    margin-bottom: 14px;
}
</style>

<div class="page">
    <h6 class="heading text-primary">Create a Password</h6>
    <div class="text-box text-body1 text-primary">
        No username required. Use a strong password that you'll remember.
    </div>

    <form on:submit|preventDefault={() => savePassword() } bind:this={formField} target="_self">
        <div class="input-box">
            <InputBox
                label={"Password"}
                placeholder={"At least 8 symbols"}
                intputType= 'password'
                width="100%"
                margin={"21px 0 0 0"}
                on:changed={validatePassword1}
                {pattern}
                required={true}/>
        </div>
        <div class="input-box">
            <InputBox 
                label={"Confirm Password"}
                placeholder={"At least 8 symbols"}
                intputType= 'password'
                width="100%"
                on:changed={validatePassword2}
                required={true}/>
        </div>
        <input  value="Save Password"
                class="button__solid button__purple submit submit-button submit-button-text" 
                type="submit" >
    </form>
</div>

