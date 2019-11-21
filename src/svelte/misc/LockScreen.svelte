<script>
    import { loggedIn, HashStore } from '../../js/stores/stores.js';
    import { checkPassword } from '../../js/utils.js';
    
    //DOM nodes
    let formObj;

    let password;


    function handleSubmit(){
        if (formObj.checkValidity()){
            loggedIn.set(true);
        } else {
            alert('no')
        }
    }

    function validatePassword(obj){
        if (!checkPassword(password, $HashStore.encode)) {
            obj.setCustomValidity("Incorrect Password");
        } else {
            obj.setCustomValidity('');
        }
    }

</script>

<div>
    <form on:submit|preventDefault={() => handleSubmit(formObj) } target="_self" bind:this={formObj}>
        {#if $HashStore.encode}
            <label>Unlock Wallet</label><br>
            <input bind:value={password}
                    on:change={() => validatePassword(this)}
                    type="password"
                    required  />
            <input type="submit" value="Login">
        {/if}
    </form>
</div>
