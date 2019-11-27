<script>
    import { setContext, getContext } from 'svelte';

	//Components
    import { Components, RestorePages }  from '../../js/router.js'
    const { Steps, Step } = Components;
    import NavLogo from '../nav/NavLogo.svelte';

    //Context
    const { switchPage } = getContext('switchPage');

    setContext('functions', {
        setFile: (value) => {file = value;},
        setKeyStore: (value) => {keystoreFile = value;},
        setKeys: (value) => {keys = value;},
        changeStep: (step) => {
            if (step === -1 && currentStep === 0) switchPage('CoinsMain');
            else if (step === -1) currentStep = back;
            else currentStep = step;
        }
	});

    let file;
    let keystoreFile;
    let keys;
    let currentStep = 0;

    let RestoreSteps = [
        {page: 'RestoreUpload', hideSteps: false, back: 0},
        {page: 'RestoreCheck', hideSteps: true, back: 0},
        {page: 'RestorePassword', hideSteps: false, back: 0},
        {page: 'RestoreAddWallets', hideSteps: false, back: 0},
        {page: 'RestoreSaveWallets', hideSteps: true, back: 0},
        {page: 'RestoreComplete', hideSteps: false, back: 0},
    ]

    $: currentPage = RestoreSteps[currentStep].page;
    $: hideSteps = RestoreSteps[currentStep].hideSteps;
    $: back = RestoreSteps[currentStep].back;
    
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

.hide-steps{
    display: none;
}
</style>

<div class="layout">
    <div class="header">
        <NavLogo />
    </div>
    <div class="content">
        <svelte:component this={RestorePages[currentPage]} {file} {keystoreFile} {keys}/>
    </div>
    <div class="steps" class:hide-steps={hideSteps}>
        <Steps {back}/>
    </div>
</div>

