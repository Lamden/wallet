<script>
    import { setContext, getContext, onDestroy, onMount} from 'svelte';
    import { fade } from 'svelte/transition';
	//Components
    import { Components, BackupPages }  from '../Router.svelte'
    const { Steps, Step } = Components;
    import NavLogo from '../nav/NavLogo.svelte';

    //Stores
	import { SettingsStore } from '../../js/stores/stores.js';

    //Context
    const { switchPage, getModalData } = getContext('app_functions');

    setContext('functions', {
        changeStep: (step) => {
            if (step === 0 && currentStep === 0) switchPage('Settings');
            else if (step === 0) currentStep = back;
            else currentStep = step;
        },
        nextPage: () => {
            currentStep = currentStep + 1
        },
        back: () => {
            if (fromBackupModal) {
                if (currentStep === 9) {
                    switchPage('CoinsMain')
                } else {
                    currentStep = 9;
                }
                return;
            }
            if (currentStep === 0) switchPage('Settings');
            else currentStep = 0
        },
        setVault: (data) => vault.mnemonic = data,
        getVault: () => vault,
        setPassword: (string) => password = string,
        getPassword: () => password,
        setKeystorePW: (info) => ksPwdInfo = info,
        //getKeystorePW: () => {return ksPwdInfo},
        setKeystoreFile: (file) => keystoreFile = file,
        setSelectedType: (type) => selectedType = type,
        getSelectedType: () => selectedType
	});

    let currentStep = 0;
    let ksPwdInfo;
    let keystoreFile;
    let password;
    let selectedType;
    let vaultExist = false;
    let vault = {};
    let fromBackupModal = false;
    
    $: pageData = $SettingsStore.currentPage.data;

    onMount(() => {
		chrome.runtime.sendMessage({type: 'isVaultCreated'}, (ok) => {
			vaultExist = ok;
		})
        if (pageData && pageData.from === 'fromBackupModal') {
            fromBackupModal = true;
            currentStep = 9;
        }
	});


    onDestroy(()=> password = "")

    let steps = [
        {page: 'BackupIntro', hideSteps: true, back: 0},
        {page: 'BackupEnterPassword', hideSteps: false, back: 0},
        {page: 'BackupViewKeys', hideSteps: false, back: 0},
        {page: 'BackupKeystorePassword', hideSteps: false, back: 0},
        {page: 'BackupKeystoreCreate', hideSteps: false, back: 3},
        {page: 'BackupKeystoreComplete', hideSteps: false, back: 0},
        {page: 'BackupMnemonic', hideSteps: false, back: 0},
        {page: 'FirstRunVerifyMnemonic', hideSteps: false, back: 0},
        {page: 'BackupMnemonicComplete'},
        {page: 'BackupLeagcyAccounts'}
    ]

    $: currentPage = steps[currentStep].page;
    $: back = steps[currentStep].back;
    
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
        <svelte:component this={BackupPages[currentPage]} {keystoreFile} {ksPwdInfo} {vaultExist}/>
    </div>
</div>

