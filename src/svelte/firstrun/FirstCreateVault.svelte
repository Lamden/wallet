<script>    
    import { setContext, getContext } from 'svelte';
    //Components
    import NavLogo from '../nav/NavLogo.svelte';
	import { Components, FirstRun}  from '../Router.svelte'

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
        setVault: (data) => vault = data,
        getVault: () => vault,
        done: () => checkFirstRun()
    });

    let steps = [
        {page: 'FirstCreateVaultIntro'},
        {page: 'FirstRunGenMnemonic'},
        {page: 'FirstRunVerifyMnemonic'},
        {page: 'FirstRunRemember'},
        {page: 'FirstRunGenWallets'},
        {page: 'FirstRunFinishing'},
    ]
    let currentStep = 0;
    let vault = null;
</script>

<div class="flow-layout">
    <div class="flow-header">
        <NavLogo />
    </div>
    <div class="flow-content">
        <svelte:component this={FirstRun[steps[currentStep].page]} />
    </div>
</div>