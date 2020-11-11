<script>
    import { onMount, getContext } from 'svelte';
    import { fade } from 'svelte/transition';

    //Stores
    import { SettingsStore, password, steps } from '../../js/stores/stores.js';

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

    const download = () => {
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

        SettingsStore.setLastBackupDate()
        
        setTimeout(() => {
            appHome();
        }, 1000);
        
    }
</script>

<style>
.text-box2{
    margin-bottom: 3rem;
}

p{
    margin: 0;
}
.checked{
    color: var(--font-success);
}
.unchecked{
    color: var(--font-warning);
}
</style>

<div class="flex-row flow-page" in:fade="{{delay: 0, duration: 200}}">
    <div class="flex-column flow-content-left">
        <h6 class="text-primary">Remember</h6>
        
        <div class="flow-text-box text-body1 text-primary">
            This backup contains current accounts in your wallet.  
            Subsequant backups will be needed when future accounts are added.   
        </div>

        <div class="text-box2 text-body2 text-secondary">
            Safe storage of your keystore and password are important to keeping your cryptocurrency safe. 
            We recommend <a class="text-link" href="https://www.lastpass.com/" rel="noopener noreferrer" target="_blank"> LastPass</a> as a way to create and store complex passwords.
        </div>
        <div class="consent flex-row">
            <label class="chk-container text-body2" class:checked={consent} class:unchecked={!consent}>
                I Understand
                <input type="checkbox" bind:checked={consent}>
                <span class="chk-checkmark"></span>
            </label>
        </div>
        <div class="flex-column flow-buttons">
            <Button id={'download-btn'}
                    classes={`button__solid ${consent ? 'button__primary' : ''}`}
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
    </div>
    <div class="flow-content-right" in:fade="{{delay: 0, duration: 200}}"></div>
</div>