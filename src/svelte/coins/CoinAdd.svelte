<script>
    import { getContext, setContext } from 'svelte';
    
	//Stores
    import { CoinStore, HashStore, coinMeta, password, breadcrumbs } from '../../js/stores/stores.js';

    //Components
    import { Modals, Components } from '../../js/router.js';
    const { Button } = Components;

	//Context
    const { closeModal } = getContext('app_functions');

	setContext('coinadd_functions', {
        nextPage: () => currentStep = currentStep + 1,
        setMessage: (msg) => message = msg
    });
    
    let message = {};
    let steps = [
        {page: 'CoinAddDetails', cancelButton: true},
        {page: 'MessageBox', cancelButton: false},
    ]
    let currentStep = 1;

</script>

<svelte:component this={Modals[steps[currentStep - 1].page]} {message}/>
{#if steps[currentStep - 1].cancelButton}
    <Button classes={'button__text text-caption'} 
            width={'125px'}
			height={'24px'}
			padding={0}
            name="Cancel" 
            click={() => closeModal()} />
{/if}