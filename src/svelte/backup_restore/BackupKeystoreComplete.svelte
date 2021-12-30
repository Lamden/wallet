<script>
    import { onMount, getContext } from 'svelte';
    import { fade } from 'svelte/transition';

    //Stores
    import { SettingsStore, password, steps } from '../../js/stores/stores.js';

    //Components
	import { Components, LeftSideFullPage }  from '../Router.svelte'
    const { Button } = Components;

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

p{
    margin: 0;
}
.link{
        color: var(--font-accent);
}
.wrap{
  width: 347px;  
}
.desc{
    width: 338px;
    margin-bottom: 1.5rem;
    margin-top: 1rem;
}
.font18{
    font-size: 18px;
}
</style>

<LeftSideFullPage title="Remember" helpLink={"https://docs.lamden.io/docs/wallet/backup_overview"}>
    <div slot="body">
        <div class="text-body1 weight-400 desc">
            Safe storage of your keystore and password are important to keeping your cryptocurrency safe. 
            We recommend <a class="text-link link" href="https://www.lastpass.com/" rel="noopener noreferrer" target="_blank"> LastPass</a> as a way to create and store complex passwords.
            <div class="text-body1 layout-leftside-warning">This process will NOT backup Lamden Vault accounts.</div>
        </div>
    </div>
    <div class="flex-row flow-page flex-just-center" in:fade="{{delay: 0, duration: 200}}" slot="content">
        <div class="flex-column wrap">
            <h6 class="text-primary text-center">Remember</h6>
            
            <div class="text-body1 text-primary font18">
                This backup contains current accounts in your wallet.  
                Subsequant backups will be needed when future accounts are added.   
            </div>

            <label class="chk-container text-body2 checkbox-text desc">
                I understand that it is my responsibility to keep my keystore file safe.
                <input type="checkbox" bind:checked={consent}>
                <span class="chk-checkmark mark"></span>
            </label>
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
    </div>
</LeftSideFullPage>