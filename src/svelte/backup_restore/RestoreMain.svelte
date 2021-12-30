<script>
    import { setContext, getContext } from 'svelte';

	//Components
    import { Components, RestorePages }  from '../Router.svelte'
    const { Steps, Step } = Components;
    import NavLogo from '../nav/NavLogo.svelte';

    //Context
    const { switchPage } = getContext('app_functions');

    setContext('functions', {
        nextPage: () => currentStep = currentStep + 1,
        back: () => {
            if (currentStep === 0) switchPage("Settings")
            else currentStep = 0
        },
        setFile: (value) => {file = value;},
        setKeyStore: (value) => {keystoreFile = value;},
        setKeys: (value) => {keys = value;},
        changeStep: (step) => {
            if (step === 0 && currentStep === 0) switchPage('Settings');
            else if (step === 0) currentStep = back;
            else currentStep = step;
        },
        cancel: () => switchPage('Settings'),
        setSelectedType: (type) => selectedType = type,
        getSelectedType: () => selectedType,
        setMnemonic: (s) => mnemonic = s,
        getMnemonic: () => mnemonic
	});

    let file;
    let keystoreFile;
    let keys;
    let currentStep = 0;
    let selectedType;
    let restore = false;
    let mnemonic;

    let steps = [
        {page: 'RestoreIntro'},
        {page: 'RestoreUpload', hideSteps: false, back: 0},
        {page: 'RestoreCheck', hideSteps: true, back: 0},
        {page: 'RestorePassword', hideSteps: false, back: 1},
        {page: 'RestoreAddWallets', hideSteps: false, back: 0},
        {page: 'RestoreSaveWallets', hideSteps: true, back: 0},
        {page: 'RestoreComplete', hideSteps: false, back: 0},
        {page: 'RestoreMnemonic'},
        {page: 'RestorePrivateKey'},
        {page: 'RestoreMnemonicRemember'},
        {page: 'RestoreMnemonicPassword'},
        {page: 'RestoreMnemonicWarning'},
        {page: 'RestoreMnemonicSuccess'}
    ]

    $: currentPage = steps[currentStep].page;
    $: hideSteps = steps[currentStep].hideSteps;
    $: back = steps[currentStep].back;
    $: hideBack = steps[currentStep].hideBack ? false : true;
    
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
    border-bottom: 1px solid var(--divider-light);
}
</style>

<div class="layout">
    <div class="header">
        <NavLogo />
    </div>
    <div class="content">
        <svelte:component this={RestorePages[currentPage]} {file} {keystoreFile} {keys} {restore}/>
    </div>
</div>

