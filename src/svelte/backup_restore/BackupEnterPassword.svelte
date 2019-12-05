<script>
    import { onMount, getContext } from 'svelte';
    
    //Stores
    import { CoinStore, steps } from '../../js/stores/stores.js';

	//Components
	import { Components }  from '../../js/router.js'
    const { Button, InputBox } = Components;

    //Context
    const { changeStep } = getContext('functions');

    //DOM Nodes
    let formObj;

    onMount(() => {
        steps.set({
                currentStep: 1,
                stepList: [
                    {number: 1, name: 'Verify', desc:'Wallet Password'},
                    {number: 2, name: 'Decrypt', desc:'View Stored Keys'},
                ]
            });
    })

    function handleSubmit(form){
        if (form.checkValidity()){
                changeStep(2);
        }
    }

    function validatePassword(e){
        let obj = e.detail;
        if (!CoinStore.validatePassword(obj.value)) {
            obj.setCustomValidity("Incorrect Wallet Password");
        } else {
            obj.setCustomValidity('');
        }
    }
</script>

<style>
.backup-password{
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    width: 498px;
    padding: 156px 24px 0 242px;
}

.text-box{
    margin-bottom: 75px;
}
.buttons{
     margin-bottom: 16px;
}

a{
    text-decoration: unset;
}
</style>

<div class="backup-password">
    <h6>Verify Your Password</h6>
    
    <div class="text-box text-body1 text-primary">
        Enter your Lamden wallet password to continue.
    </div>

    <form on:submit|preventDefault={() => handleSubmit(formObj) } bind:this={formObj} target="_self">
        <InputBox
            label={"Wallet Password"}
            placeholder={`Enter Wallet Password`}
            styles={`margin-bottom: 17px;`}
            on:changed={ (e) => validatePassword(e) }
            inputType={"password"}
            required={true} />

        <div class="buttons flex-column">
            <input  class="button__solid button__purple submit submit-button submit-button-text submit-button-size"
                    type="submit" 
                    value={"Confirm Password"} />
        </div>
    </form>

    <a  class="text-caption text-secondary" 
        href="https://www.lamden.io" 
        target="_blank" 
        rel="noopener noreferrer" >
        Help & FAQ
    </a>
</div>