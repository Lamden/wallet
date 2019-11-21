<script>
    import { getContext } from 'svelte';

    const { switchPage } = getContext('switchPage');

    let password;

    function handleSubmit(){
        null
    }

</script>

<h1>Restore Private Keys</h1>

<p>To restore your wallet, please upload the file we provided you and choose a new password.</p>

<form on:submit|preventDefault={() => handleSubmit(this) } target="_self">
    <div>
        <label>Password</label><br>
        <input bind:value={password}
               type="password"
               required  />
    </div>
    <input type="submit" value="Restore Wallet">
</form>
<a href="javascript:void(0)" on:click={() => switchPage('FirstRunIntro')}>go back</a>