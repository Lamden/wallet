<script> 
    import whitelabel from '../../../whitelabel.json'
    
    import { getContext } from 'svelte';

    //Stores
    import { needsBackup, SettingsStore } from '../../js/stores/stores.js';

    //Components
	import { Components }  from '../Router.svelte'
    const { Button } = Components;
    
    //Images
    import hero_bg from '../../img/backgrounds/hero_bg.png';
    import cautionIcon from '../../img/menu_icons/icon_caution.svg'
    import successCircle from '../../img/menu_icons/icon_success_circle.svg';

    //Icons 
    import DirectionalArrowIcon from '../icons/DirectionalArrowIcon.svelte'
    import CloseIcon from '../icons/CloseIcon.svelte'

	//Context
    const { switchPage } = getContext('app_functions');


    const dismissWarning = () => {SettingsStore.dismissWarning()}

</script>

<style>
.backup{
	display: flex;
	flex-direction: column;
}

.hero-rec{
	min-height: 310px;    
}

.buttons{
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    flex-grow: 1;
    margin-top: 4rem;
}

.subtext{
    max-width: 601px;
    line-height: 1.4;
}

.backup-warning{
    align-items: center;
    margin-top: 1rem;
}

.warning-icon{
    width: 20px;
    margin-right: 10px;
    min-width: 20px;
}


</style>

<div class="backup text-primary">
	<div class="hero-rec" style="background-image: url({hero_bg});">
        <h2 class="heading">
            Backing Up Your {whitelabel.companyName} Wallet is Very Important
        </h2>
        <div class="subtext text-body1 text-opacity-1">
            All of the information for your Accounts is stored in this browser. We highly recommend creating a keystore file so that you can recover your Accounts if anything happens to this computer.
        </div>
        <div class="buttons">
        	<Button
                id={'backup-btn'} 
                classes={'button__outlined button__overlay'}
				name="Backup Wallet"
		 		click={() => switchPage('BackupMain')}
            >
                <div slot="icon-after">
                    <DirectionalArrowIcon width="12px" direction="right" color="var(--color-white)" />
                </div>
            </Button> 
        </div>
        {#if $needsBackup}
            <div class="flex-row backup-warning">
                <div class="warning-icon">{@html cautionIcon}</div>
                <div class="warning-text text-body4">
                    You have added Accounts since your last backup so it is HIGHLY recommended that you create another backup.
                    <button class="button__icon" on:click={dismissWarning}>
                        <CloseIcon id={'dismiss-btn'} width="12px" click={dismissWarning} margin="0 0 -2px 1px"/>
                    </button>
                </div>
            </div>
        {/if}
	</div>
</div>
