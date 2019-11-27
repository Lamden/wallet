<script>
    import { setContext } from 'svelte';

	//Components
    import { Components, FirstRun }  from '../../js/router.js'
    const { Steps, Step } = Components;
    import NavLogo from '../nav/NavLogo.svelte';

    //Context
    setContext('functions', {
        changeStep: (step) => {
            if (step === -1 && currentStep === 0) currentStep = 0;
            else if (step === -1) currentStep = back;
            else currentStep = step;
        }
	});

    let SetupSteps = [
        {page: 'FirstRunIntro', hideSteps: false, back: 0},
        {page: 'FirstRunCreatePW', hideSteps: false, back: 0},
        {page: 'FirstRunRestore', hideSteps: false, back: 0},
        {page: 'FirstRunTOS', hideSteps: false, back: 0},
        {page: 'FirstRunGenWallets', hideSteps: false, back: 0},
        {page: 'FirstRunFinishing', hideSteps: false, back: 0},
    ]
    let currentStep = 0;
    let restore = false;

    $: currentPage = SetupSteps[currentStep].page;
    $: hideSteps = SetupSteps[currentStep].hideSteps;
    $: back = SetupSteps[currentStep].back;

</script>

<style>
.layout{
    display: flex;
    flex-direction: column;
    flex-grow: 1;
}

.content{
    flex-grow: 1;
    display: flex;
}

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
    border-bottom: 1px solid #3D3D3D;
}

.steps{
    display: flex;
    justify-content: center;
    height: 180px;
}
</style>

<div class="layout">
    <div class="header">
        <NavLogo />
    </div>
    <div class="content">
        <svelte:component this={FirstRun[SetupSteps[currentStep].page]} {restore}/>
    </div>
    <div class="steps">
        <Steps {back} />
    </div>
</div>

