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

    onMount(() => {
        steps.update(current => {
            current.currentStep = 2;
            return current
        });
    });

    const accept = () => {
        changeStep(4)
    }

    const startOver = () => {
        changeStep(0);
    }

</script>

<style>
strong{
    font-weight: 400;
}
</style>
<div class="flex-row flow-page" in:fade="{{delay: 0, duration: 200}}">
    <div class="flex-column flow-content-left">
        <h6 class="text-primary">{whitelabel.firstRun_setup.terms_of_service.title}</h6>
        
        <div class="flow-text-box text-body1 text-primary">
            {#if whitelabel.firstRun_setup.terms_of_service.message = "lamden_default"}
                Storing your password and backing up your wallet is <strong>YOUR RESPONSIBILITY</strong>. This is important to keeping your cryptocurrency safe.
            {:else}
                {whitelabel.firstRun_setup.terms_of_service.message}
            {/if}
        </div>
        <div class="flex-column flow-buttons">
            <Button
                id={"i-understand"} 
                classes={'button__solid button__primary'}
                styles={'margin-bottom: 16px;'}
                name="I understand" 
                click={() => accept()} />
            <Button
                id={"go-back"}  
                classes={'button__solid'}
                styles={'margin-bottom: 16px;'}
                name="go back" 
                click={() => startOver()} />
        </div>
    </div>
    <div class="flex-column flow-content-right"> </div>
</div>

