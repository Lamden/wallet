<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    //Stores
    import { CoinStore, loggedIn, HashStore, SettingsStore, password } from '../../js/stores/stores.js';

    //Components
	import { Components }  from '../../js/router.js'
    const { Button } = Components;

	//Utils
    import { keysFromNew } from '../../js/crypto/wallets.js';
    import { encryptStrHash } from '../../js/utils.js';

    //Props
    export let switchPage;

    function dispatchState(step) {
        dispatch('toggleStep', step);
    }

    function createStartingWallets(){
        let keyPair = keysFromNew('lamden', 'TAU');
        CoinStore.update(current => {
            let coinInfo = {
                'network': 'lamden',
                'name': 'Lamden',
                'nickname' : 'My TAU Address',
                'symbol': 'TAU',
                'vk': keyPair.vk,
                'sk': encryptStrHash($password, keyPair.sk),
            }
            current.push(coinInfo);
            return current;
        })
    }

    function accept(){
        SettingsStore.update(current => {
            current.currentPage = {name: 'CoinsMain', data: {}};
            current.firstRun = false;
            return current
        })
        createStartingWallets();
        loggedIn.set(true);
    }

    function startOver(){
        HashStore.set({ 'encode' : undefined });
        dispatchState(0);
    }

</script>

<style>
.page{
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    width: 280px;
    padding: 16px 24px 0 24px;
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

