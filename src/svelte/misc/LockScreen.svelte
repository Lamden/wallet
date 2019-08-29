<script>
    import { loggedIn, Hash } from '../../js/stores.js';
    import nodeCryptoJs from 'node-cryptojs-aes';
    const { CryptoJS, JsonFormatter } = nodeCryptoJs;

    let password = '';
    let error = '';

    function createPassword(){
        Hash.set({'encode' :  CryptoJS.AES.encrypt(JSON.stringify({'date':new Date()}), password, { format: JsonFormatter }).toString() });
        login();
    };
        
    function login(){
        loggedIn.set(true)
        /*
        try {
            checkLogin()
            password = ''
            loggedIn.set(true)
        } catch (e) {
            error = 'Incorrect password - Decryption failed'
        }*/
    }

    function checkLogin(){
        const decrypted = CryptoJS.AES.decrypt($Hash.encode, password, { format: JsonFormatter });
        return JSON.parse(CryptoJS.enc.Utf8.stringify(decrypted));
    };

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
        <button on:click={() => createPassword() }> Create Password </button>
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