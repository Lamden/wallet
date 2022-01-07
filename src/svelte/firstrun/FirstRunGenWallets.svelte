<script>
    import whitelabel from '../../../whitelabel.json'

    import { onMount, getContext } from 'svelte';
    
    //Stores
    import { SettingsStore } from '../../js/stores/stores.js';

    //Components
	import { Components }  from '../Router.svelte'
    const { Loading } = Components;
    
    //Context
    const { nextPage, getVault } = getContext('functions');
    
    let vault = null;
    let message;

    onMount(() => {
        new Promise(function(resolve, reject) {
            setTimeout(() => {
                createStartingWallet(resolve);
            }, 1500);
        })
        .then(res => {
            setTimeout(() => {
                nextPage()
            }, 1500);
        })
    });

    const createStartingWallet = (resolve) => {
        vault =  getVault();
        chrome.runtime.sendMessage({type: 'accountsAddNewLamden', data: {
            nickname: `My ${whitelabel.companyName} Account`,
            sk: vault.sk,
            vk: vault.vk,
            type: 'vault',
            derivationIndex: vault.derivationIndex,
            mnemonic: vault.mnemonic,
        }}, (result) => {
            if (result.error){
                message = result.error
            }else{
                if (result.added){
                SettingsStore.setLastCoinAddedDate();
                SettingsStore.setLastCoinAddedType("vault")
                resolve()
                }
                message = result.reason
            }
        })
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

