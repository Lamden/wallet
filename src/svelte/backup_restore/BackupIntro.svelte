<script>
    import { getContext } from 'svelte';
    import { fade } from 'svelte/transition';
    
    //Stores
    import { steps } from '../../js/stores/stores.js';

	//Components
	import { Components }  from '../Router.svelte'
    const { Button } = Components;

    //Context
    const { changeStep } = getContext('functions');
    const { appHome } = getContext('app_functions');

</script>

<style>

.text-box2{
    color: cyan;
}

a{
    text-decoration: unset;
}
</style>

<div class="flex-row flow-page" in:fade="{{delay: 0, duration: 200}}">
    <div class="flex-column flow-content-left">
        <h6>Backup Lamden Wallet</h6>
        
        <div class="flow-text-box text-body1 text-primary">
            This process will allow you to either create an encrypted keystore or decrypt and 
            view your all of your secret keys.
        </div>

        <div class="text-box2 text-body1">
            Keeping backups safe is your responsibility. 
        </div>

        <div class="flex-column flow-buttons">
            <Button id={'create-btn'}
                    classes={'button__solid button__purple'}
                    margin="0 0 1rem"
                    name="Create Backup File" 
                    click={() => changeStep(3)} />
            <Button id={'view-keys-btn'}
                    classes={'button__solid'} 
                    margin="0 0 1rem"
                    name="View Account Keys" 
                    click={() => changeStep(1)} />
            <Button id={'back-btn'}
                    classes={'button__solid'} 
                    margin="0 0 1rem"
                    name="Back" 
                    click={() => changeStep(0)} />  
            <a  class="text-caption text-secondary" 
                href="https://docs.lamden.io/wallet/" 
                target="_blank" 
                rel="noopener noreferrer" >
                Help & FAQ
            </a>
        </div>
    </div>
    <div class="flex-column flow-content-right" > </div>
</div>






