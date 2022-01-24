<script>
    import { setContext, getContext } from 'svelte'; 

    //Components
	import { Pages }  from '../Router.svelte'
    import NavLogo from '../nav/NavLogo.svelte';

    //Context
    const { switchPage } = getContext('app_functions');

    let currentStep = 1;
    let message;
    let network;

    setContext('networks_functions', {
        next: () => next(),
        changeStep: (step) => currentStep = step,
        setNetwork: (data) => network = data,
        getNetwork: () => network,
        setMessage: (data) => message = data,
        getMessage: () => message,
		done: () => switchPage('CoinsMain')
	});

    const next = () => {
        currentStep = currentStep + 1
    }

    let steps = [
        {page: 'ManageNetworkMain'},
        {page: 'ManageNetwokDelete'},
        {page: 'ManageNetwokFinish'}
    ]

</script>

<style>
    .header{
        display: flex;
        flex-direction: row;
        position: absolute;
        left: 0%;
        right: 0%;
        top: 0%;
        bottom: 0%;
        right: 0;
        height: 97px;
        border-bottom: 1px solid var(--divider-light);
    }
</style>
<div class="header">
    <NavLogo />
</div>
<div class="flex-column">
    <svelte:component this={Pages[steps[currentStep - 1].page]} />
</div>