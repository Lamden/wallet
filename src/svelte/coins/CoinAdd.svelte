<script>
    import { getContext, setContext, afterUpdate} from 'svelte';
    
    //Components
    import { Modals, Components } from '../Router.svelte';
    const { Button } = Components;

	//Context
    const { closeModal, setAccountAdded } = getContext('app_functions');

	setContext('coinadd_functions', {
        detailsPage: () => currentStep = 1,
        tokenPage: () => currentStep = 1,
        nextPage: () => currentStep = currentStep + 1,
        setMessage: (msg) => message = msg
    });
    
    afterUpdate(() => {
        if (currentStep === 2 && message.type === "success") setAccountAdded()
    })

    let message = {};
    let steps = [
        {page: 'CoinAddDetails', cancelButton: true},
        {page: 'MessageBox', cancelButton: false},
    ]
    let currentStep = 1;

</script>

<svelte:component this={Modals[steps[currentStep - 1].page]} {message}/>
{#if steps[currentStep - 1].cancelButton}
    <Button id={'modal-cancel-btn'}
            classes={'button__text text-caption'} 
            width={'125px'}
			height={'24px'}
			padding={0}
            name="Cancel" 
            click={() => closeModal()} />
{/if}