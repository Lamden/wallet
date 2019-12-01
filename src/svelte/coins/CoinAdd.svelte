<script>
    import { onMount, getContext, setContext } from 'svelte';
    
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
    
    let message = 'this is soemthing';
    let steps = [
        {page: 'CoinAddDetails', cancelButton: true},
        {page: 'MessageBox', cancelButton: false},
    ]
    let currentStep = 1;
    let buttons = [
            {name: 'Home', click: () => closeModal(), class: 'button__solid button__purple'},
            {name: 'Add Another', click: () => currentStep = 1, class: 'button__solid'}
        ]

</script>

<svelte:component this={Modals[steps[currentStep - 1].page]} {buttons} {message}/>
{#if steps[currentStep - 1].cancelButton}
    <Button classes={'button__text text-caption'} 
            width={'125px'}
			height={'24px'}
			padding={0}
            name="Cancel" 
            click={() => closeModal()} />
{/if}