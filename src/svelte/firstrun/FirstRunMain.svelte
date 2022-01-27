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
        back: () => {
            if (currentStep === 0) {
                currentStep = 0;
                return;
            }
            currentStep = currentStep - 1;
        },
        changeStep: (step) => {
            if (step === 0 && currentStep === 0) currentStep = 0;
            else if (step === 0) currentStep = back;
            else currentStep = step;
        },
        setVault: (data) => vault = data,
        getVault: () => vault,
        done: () => checkFirstRun()
	});

    let steps = [
        {page: 'FirstRunIntro'},
        {page: 'FirstRunCreatePW'},
        {page: 'FirstRunGenMnemonic'},
        {page: 'FirstRunVerifyMnemonic'},
        {page: 'FirstRunRemember'},
        {page: 'FirstRunGenWallets'},
        {page: 'FirstRunFinishing'},
    ]
    let currentStep = 0;
    let restore = false;
    let vault = null;

</script>

<div class="flow-layout">
    <div class="flow-header">
        <NavLogo />
    </div>
    <div class="flow-content">
        <svelte:component this={FirstRun[steps[currentStep].page]} {restore}/>
    </div>
</div>

