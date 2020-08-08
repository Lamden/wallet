<script>
    import { onMount, getContext } from 'svelte';
    import { fade } from 'svelte/transition';

    //Stores
    import { steps } from '../../js/stores/stores.js';

	//Components
	import { Components }  from '../Router.svelte'
    const { Button } = Components;

    //Context
    const { changeStep } = getContext('functions');
    const { switchPage } = getContext('app_functions');

    onMount(() => {
        steps.set({current:0, stepList:[]});
    });

</script>

<style>

a{
    margin-top: 10px;
    text-decoration: unset;
}

</style>
<div class="flex-row flow-page" in:fade="{{delay: 0, duration: 200}}">
    <div class="flex-column flow-content-left">
        <h6 class="text-primary">Welcome!</h6>
        <div class="flow-text-box text-body1 text-primary">
            Creating a wallet is easy and secure. All accounts are encrypted locally in your browser, not on remote servers.
        </div>
        <div class="flex-column flow-buttons">
            <Button id="create-wallet"
                    classes={'button__solid button__purple'}
                    margin="0 0 1rem"
                    name="Create A Wallet" 
                    click={() => changeStep(1)} />
            <Button id="restore-wallet"
                    classes={'button__solid'}
                    margin="0 0 1rem"
                    name="Restore a Wallet" 
                    click={() => switchPage('FirstRunRestoreMain')} />
            <a  class="text-caption text-secondary" 
                href="https://www.lamden.io" 
                target="_blank" 
                rel="noopener noreferrer" >
                Learn More About Lamden
            </a>
        </div>

    </div>
    <div class="flex-column flow-content-right"> </div>
</div>