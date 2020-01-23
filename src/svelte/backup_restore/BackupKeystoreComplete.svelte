<script>
    import { onMount, getContext } from 'svelte';

    //Stores
    import { CoinStore, SettingsStore, password, steps } from '../../js/stores/stores.js';

    //Components
	import { Components }  from '../Router.svelte'
    const { Button } = Components;

	//Utils
    import { keysFromNew } from '../../js/crypto/wallets.js';
    import { encryptStrHash } from '../../js/utils.js';

    //Context
    const { changeStep } = getContext('functions');
    const { appHome } = getContext('app_functions');

    //Props
    export let keystoreFile;

    let consent = false;

    onMount(() => {
        steps.update(current => {
            current.currentStep = 3;
            return current
        });   
    })

    function download() {
        steps.update(current => {
            current.currentStep = 4;
            return current
        }); 
        
        let currDateTime = new Date().toLocaleString();
        let filename = "Lamden_Wallet_" + currDateTime + ".keystore";
        let element = document.createElement('a');

        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(keystoreFile));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);

        SettingsStore.update(current => {
            current.lastBackup = new Date();
            return current;
        })
        
        setTimeout(() => {
            appHome();
        }, 1000);
        
    }
</script>

<style>
.backup-complete{
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    width: 498px;
    padding: 50px 24px 0 242px;
}

.text-box{
   margin-bottom: 16px;
}

.text-box2{
    margin-bottom: 65px;
}

input[type="checkbox"]{
    width: 18px;
    height: 18px;
    background: #DADADA;
}
</style>

<div class="backup-complete">
    <h6 class="text-primary">Remember</h6>
    
    <div class="text-box text-body1 text-primary">
        This backup contains current keys in your wallet.  
        Subsequant backups will be needed when future keys are added.   
    </div>

    <div class="text-box2 text-body2 text-primary-dark">
        Safe storage of your keystore and password are important to keeping your cryptocurrency safe.
    </div>
    <div class="consent flex-row">
        <input id={'consent-chk'} type="checkbox" class="css-checkbox" bind:checked={consent}>
        <span class="text-body1 text-primary">I Understand </span>
    </div>

    <Button id={'download-btn'}
            classes={`button__solid ${consent ? 'button__purple' : ''}`}
            styles={'margin-bottom: 16px;'}
            width={'100%'}
            disabled={!consent}
            name={"Download File"}
            click={() => download()} />
    <Button classes={'button__solid '}
            styles={'margin-bottom: 16px;'}
            width={'100%'}
            name="Home" 
            click={() => appHome()} />
</div>

