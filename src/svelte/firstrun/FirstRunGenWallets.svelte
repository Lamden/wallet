<script>
    import { onMount, getContext } from 'svelte';
    
    //Stores
    import { CoinStore, password, steps, SettingsStore } from '../../js/stores/stores.js';

    //Components
	import { Components }  from '../../js/router.js'
    const { Loading } = Components;

	//Utils
    import { keysFromNew } from '../../js/crypto/wallets.js';
    import { encryptStrHash, encryptObject } from '../../js/utils.js';
    
    //Context
    const { changeStep } = getContext('functions');
    
    //Props
    export let switchPage;

    onMount(() => {
        steps.update(current => {
            current.currentStep = 3;
            return current
        });

        new Promise(function(resolve, reject) {
            setTimeout(() => {
                createStartingWallets();
                resolve();
            }, 1500);
        })
        .then(res => {
            steps.update(current => {
                current.currentStep = 4;
                return current
            });
        })
        .then(res => {
            setTimeout(() => {
                changeStep(5)
            }, 1500);
        })
    });

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
        mintMockchainCoins(keyPair.vk)
    }

    function mintMockchainCoins(vk){
        let mockchain = $SettingsStore.networks.find(f => f.name === "Lamden Public Testnet")
        if (mockchain){
            let body = JSON.stringify({
                "vk" : vk,
                "amount" : 1000000,
            })
            fetch(`${mockchain.ip}:${mockchain.port}/mint`, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body
            })
            .then(res => res.json())
            .then(res => {
                if (currentNetwork.ip === mockchain.ip && currentNetwork.port === mockchain.port) CoinStore.updateAllBalances(currentNetwork);
            })
            .catch(err => console.log(err))
        }
    }

</script>

<style>
.firstrun-genwallets{
    display: flex;
    flex-grow: 1;
    justify-content: center;
}

</style>

<div class="firstrun-genwallets">
    <Loading message={'Creating Keys'} />
</div>

