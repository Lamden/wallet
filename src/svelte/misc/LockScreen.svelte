<script>
    import { loggedIn, Hash, defautPubkey } from '../../js/stores.js';
    import { checkPassword, createPassword } from '../../js/utils.js';
    import nodeCryptoJs from 'node-cryptojs-aes';
    const { CryptoJS, JsonFormatter } = nodeCryptoJs;

    let password;
    let error = '';
        
    function login(){
        loggedIn.set(true);
        /*
        try {
            checkPassword(password, $Hash.encode);
            password = undefined;
            loggedIn.set(true);
        } catch (e) {
            error = 'incorrect password';
        }
        */
    }

    function firstLogin(){
        try {
            createPassword(password, Hash);
            password = undefined;
            loggedIn.set(true)
        } catch (e) {
            error = e;
            new Error(`Error setting new password: ${e}`);
        }
    }

</script>

<style>
    p{
        color: red;
        height: 20px;
    }

    h2 {
        text-align: center;
    }

</style>

{#if !$Hash.encode}
    <div>
        <h2>Create Password</h2>
        <input bind:value={password} />
        <button on:click={() => firstLogin() }> Create Password </button>
    </div>
{/if}

{#if $Hash.encode}
    <div>
        <h2>Unlock</h2>
        <input bind:value={password} />
        <button on:click={() => login() }> login </button>
        <p>{error}</p>
    </div>
{/if}