<script>
    import whitelabel from '../../../whitelabel.json'

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
}

</style>
<div class="flex-row flow-page" in:fade="{{delay: 0, duration: 200}}">
    <div class="flex-column flow-content-left">
        <h6 class="text-primary">{whitelabel.firstRun_setup.intro.title}</h6>
        <div class="flow-text-box text-body1 text-primary">
            {whitelabel.firstRun_setup.intro.message}
        </div>
        <div class="flex-column flow-buttons">
            <Button id="create-wallet"
                    classes={'button__solid button__primary'}
                    margin="0 0 1rem"
                    name="Create A Wallet" 
                    click={() => changeStep(1)} />
            <Button id="restore-wallet"
                    classes={'button__solid'}
                    margin="0 0 1rem"
                    name="Restore a Wallet" 
                    click={() => switchPage('FirstRunRestoreMain')} />
            {#if whitelabel.helpLinks.show}
                <a  class="text-link text-caption text-secondary" 
                    href={whitelabel.helpLinks.masterURL || "https://www.lamden.io"}
                    target="_blank" 
                    rel="noopener noreferrer" >
                    Learn More About {whitelabel.companyName}
                </a>
            {/if} 
        </div>

    </div>
    <div class="flex-column flow-content-right"> </div>
</div>