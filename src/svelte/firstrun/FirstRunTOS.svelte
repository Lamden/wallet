<script>
    import { onMount, getContext } from 'svelte';

    //Stores
    import { CoinStore, loggedIn, HashStore, SettingsStore, password,steps } from '../../js/stores/stores.js';

    //Components
	import { Components }  from '../../js/router.js'
    const { Button } = Components;

	//Utils
    import { keysFromNew } from '../../js/crypto/wallets.js';
    import { encryptStrHash } from '../../js/utils.js';

    //Context
    const { changeStep } = getContext('functions');

    onMount(() => {
        steps.update(current => {
            current.currentStep = 2;
            return current
        });
    });

    function accept(){
        changeStep(4)
    }

    function startOver(){
        HashStore.set({ 'encode' : undefined });
        changeStep(0);
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

.text-box{
   height: 144px;
   margin-bottom: 20px;
}
</style>

<div class="page">
    <h6 class="heading text-primary">Remember</h6>
    <div class="text-box text-body1 text-primary">
        Your password, private keys, and locking your wallet are important to keeping your cryptocurrency safe.
    </div>

    <Button style={'button__solid'}
        height={'36px'}
        styles={'margin-bottom: 16px;'}
        name="I understand" 
        click={() => accept()} />
    <Button style={'button__solid button__purple'}
        height={'36px'}
        styles={'margin-bottom: 16px;'}
        name="go back" 
        click={() => startOver()} />
</div>

