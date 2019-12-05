<script> 
    import { onMount, getContext } from 'svelte';

    //Stores
    import { CoinStore, password, steps } from '../../js/stores/stores.js';

    //Utils
    import { encryptObject } from '../../js/utils.js';

    //Components
	import { Components }  from '../../js/router.js'
    const { InputBox } = Components;

    //Context
    const { changeStep } = getContext('functions');
    
    //DOM NODES
    let formField, pwdObj1, pwdObj2;

    //PROPS
    export let restore = false;

    let pattern = `(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\|,.<>\\/? ]).{10,}`;

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

    if(!RegExp.escape) {
        RegExp.escape = function(s) {
            return String(s).replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
        }
    }

    function savePassword(){
        if (pwdObj2.value !== pwdObj1.value) {
            pwdObj2.setCustomValidity("Passwords do not match");
            pwdObj.reportValidity()
        }
        if (formField.checkValidity()){
            try{
                CoinStore.setPwd(pwdObj1.value);
                if (restore) changeStep(1);
                else changeStep(3);
                
            } catch (err) {
                console.log(err)
            }
        }
    }

    function refreshValidity(e){
        e.detail.target.setCustomValidity('');
    }

</script>

<style>
.firstrun-create-pwd{
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    width: 498px;
    padding: 156px 24px 0 242px;
}

form{
    display: flex;
    flex-direction: column;
}

.input-box{
    margin-bottom: 14px;
}
</style>

<div class="firstrun-create-pwd">
    <h6 class="text-primary">Create a Password</h6>
    <div class="text-box text-body1 text-primary">
        No username required. Use a strong password that you'll remember.
    </div>

    <form on:submit|preventDefault={() => savePassword() } bind:this={formField} target="_self">
        <div class="input-box">
            <InputBox
                id="pwd1"
                bind:thisInput={pwdObj1}
                label={"Password"}
                placeholder={"At least 8 symbols"}
                inputType={'password'}
                width="100%"
                margin={"21px 0 0 0"}
                on:changed={refreshValidity}
                {pattern}
                required={true}/>
        </div>
        <div class="input-box">
            <InputBox 
                id="pwd2"
                bind:thisInput={pwdObj2}
                label={"Confirm Password"}
                placeholder={"At least 8 symbols"}
                inputType={'password'}
                width="100%"
                on:changed={refreshValidity}
                required={true}/>
        </div>
        <input  id="save-pwd"
                value="Save Password"
                class="button__solid button__purple submit submit-button submit-button-text" 
                type="submit" >
    </form>
</div>

