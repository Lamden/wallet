<script>
    import { loggedIn, Hash, SettingsStore } from '../../js/stores.js';
    export let switchPage;

    function accept(){
        $SettingsStore.firstRun = false;
        $loggedIn = true;
        console.log('done');
    }

    function startOver(){
        Hash.set({ 'encode' : undefined });
        switchPage('FirstRunIntro');
    }

</script>

<h1>Remember</h1>
<p>Your password, private keys, and locking your wallet are important to keeping your cryptocurrency safe.</p>

<button on:click={() => accept()}>I understand</button>
<a href="javascript:void(0)" on:click={() => startOver()}>go back</a>