<script>
    import { setContext, getContext } from 'svelte';
    
	//Components
    import { Components, FirstRun }  from '../Router.svelte'
    const { Steps, Step } = Components;
    import NavLogo from '../nav/NavLogo.svelte';

	//Context
    const { checkFirstRun } = getContext('app_functions');

    setContext('functions', {
        nextPage: () => currentStep = currentStep + 1,
        changeStep: (step) => {
            if (step === 0 && currentStep === 0) currentStep = 0;
            else if (step === 0) currentStep = back;
            else currentStep = step;
        },
        done: () => checkFirstRun()
	});

    let steps = [
        {page: 'FirstRunIntro', hideSteps: false, back: 0},
        {page: 'FirstRunCreatePW', hideSteps: false, back: 0},
        {page: 'FirstRunRestore', hideSteps: false, back: 0},
        {page: 'FirstRunTOS', hideSteps: false, back: 0},
        {page: 'FirstRunGenWallets', hideSteps: false, back: 0},
        {page: 'FirstRunFinishing', hideSteps: false, back: 0},
    ]
    let currentStep = 0;
    let restore = false;

    $: currentPage = steps[currentStep].page;
    $: hideSteps = steps[currentStep].hideSteps;
    $: back = steps[currentStep].back;
    $: hideBack = steps[currentStep].hideBack ? false : true;

</script>

<div class="flow-layout">
    <div class="flow-header">
        <NavLogo />
    </div>
    <div class="flow-content">
        <svelte:component this={FirstRun[steps[currentStep].page]} {restore}/>
    </div>
    <div class="flow-steps">
        <Steps {back} {hideBack}/>
    </div>
</div>

