<script>
    import { loggedIn, Hash } from '../../js/stores.js';
    import { checkPassword } from '../../js/utils.js';

    let password;

    function handleSubmit(form){
        if (form.checkValidity()){
            loggedIn.set(true);
        } else {
            alert('no')
        }
    }

    function validatePassword(obj){
        if (!checkPassword(password, $Hash)) {
            obj.setCustomValidity("Incorrect Password");
        } else {
            obj.setCustomValidity('');
        }
    }

</script>

<div>
    <form on:submit|preventDefault={() => handleSubmit(this) } target="_self">
        {#if $Hash.encode}
            <label>Unlock Wallet</label><br>
            <input bind:value={password}
                    on:change={() => validatePassword(this)}
                    type="password"
                    required  />
            <input type="submit" value="Login">
        {/if}
    </form>
</div>
