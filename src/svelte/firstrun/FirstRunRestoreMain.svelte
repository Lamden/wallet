<script>
    import { setContext, getContext } from 'svelte';

	//Components
    import { Components, FirstRun }  from '../Router.svelte'
    const { Steps, Step } = Components;
    import NavLogo from '../nav/NavLogo.svelte';

    //Context
    const { switchPage, checkFirstRun } = getContext('app_functions');

    setContext('functions', {
        nextPage: () => {currentStep = currentStep + 1},
        setFile: (value) => {file = value;},
        setKeyStore: (value) => {keystoreFile = value;},
        setKeys: (value) => {keys = value;},
        changeStep: (step) => {
            if (step === 0 && currentStep === 0) switchPage('FirstRunMain');
            else if (step === 0) currentStep = back;
            currentStep = step;
        },
        done: () => checkFirstRun()
	});

    let file;
    let keystoreFile;
    let keys;
    let restore = true;
    let currentStep = 0;

    let steps = [
        {page: 'FirstRunCreatePW', hideSteps: false, back: 0},
        {page: 'RestoreUpload', hideSteps: false, back: 0},
        {page: 'RestoreCheck', hideSteps: true, back: 0},
        {page: 'RestorePassword', hideSteps: false, back: 1},
        {page: 'RestoreAddWallets', hideSteps: false, back: 1},
        {page: 'RestoreSaveWallets', hideSteps: true, back: 0, hideBack: true},
        {page: 'RestoreComplete', hideSteps: false, back: 0},
        {page: 'FirstRunFinishing', hideSteps: false, back: 0},
    ]

    $: currentPage = steps[currentStep].page;
    $: hideSteps = steps[currentStep].hideSteps;
    $: back = steps[currentStep].back;
    $: hideBack = steps[currentStep].hideBack ? false : true;
    
</script>

<style>
.firstrun-restore{
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
    border-bottom: 1px solid var(--divider-light);
}

.steps{
    display: flex;
    justify-content: center;
    height: 180px;
}

.hide-steps{
    display: none;
}
</style>

<div class="firstrun-restore">
    <div class="header">
        <NavLogo />
    </div>
    <div class="content">
        <svelte:component this={FirstRun[currentPage]} {file} {keystoreFile} {keys} {restore}/>
    </div>
    <div class="steps" class:hide-steps={hideSteps}>
        <Steps {back} {hideBack}/>
    </div>
</div>

