<script>
    import { getContext } from 'svelte';
    
    //Stores
    import { HashStore } from '../../js/stores/stores.js';

    //Utils
    import { encryptObject } from '../../js/utils.js';
    
    //DOM NODES
    let passwordField;
    let confirmPasswordField;
    let formField;

    //Context
    const { switchPage } = getContext('switchPage');
    let form = {};
    let pattern = `(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\|,.<>\\/? ]).{10,}`;
    let password = '';
    let confirm = '';

    if(!RegExp.escape) {
        RegExp.escape = function(s) {
            return String(s).replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
        };
    }

    function savePassword(form){
        if (form.checkValidity()){
            try{
                HashStore.setPassword(password);
                password = undefined;
                confirm = undefined;
                switchPage('FirstRunTOS');
            } catch (e) {
                console.log(e)
            }
        }
    }

    function validatePassword1(obj){       
        if (obj.validity.patternMismatch){
            obj.setCustomValidity("Password must be 10 characters includeing UPPER/lowercase, number(s) and special character(s)");
        } else {
            obj.setCustomValidity('');
        }
        if (obj.checkValidity()) pattern = RegExp.escape(obj.value); 
    }

    function validatePassword2(obj){
        if (obj.value !== password) {
            obj.setCustomValidity("Passwords do not match");
        } else {
            obj.setCustomValidity('');
        }
    }

</script>

<h1>Create a Password</h1>
<p>No username required. Use a strong password that you'll remember.</p>
Password Requirements
<ol>
    <li>10 characters long or more</li>
    <li>1 uppercase letter</li>
    <li>1 number</li>
    <li>1 special character</li>
</ol>

<form on:submit|preventDefault={() => savePassword(formField) } bind:this={formField} target="_self">
    <div>
        <label>Password</label><br>
        <input bind:value={password}
               bind:this={passwordField}
               on:change={() => validatePassword1(passwordField) }
               class="input:required:invalid input:focus:invalid"
               type="password"
               {pattern} 
               required  />
    </div>
    <div>
        <label>Confirm Password</label><br>
        <input bind:value={confirm}
               bind:this={confirmPasswordField}
               on:change={() => validatePassword2(confirmPasswordField)}
               class="input:required:valid"
               type="password"
               required />
    </div>
    <input type="submit" value="Save Password">
</form>
<a href="javascript:void(0)" on:click={() => switchPage('FirstRunIntro')}>go back</a>
