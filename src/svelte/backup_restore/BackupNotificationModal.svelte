<script>
    import { getContext } from 'svelte';
    //Images
    import cautionIcon from '../../img/menu_icons/icon_caution.svg'
    
    //Components
	import { Components }  from '../Router.svelte'
    const { Button } = Components;

    //Context
    const { closeModal, switchPage } = getContext('app_functions');

    let helpLink = "https://docs.lamden.io/docs/develop/wallet_api/overview";

    const toBackup = () => {
        switchPage("BackupMain")
    }

    const openHelpLink = () => {
        window.open(helpLink, '_blank');
    }
</script>

<style>
    h2{
        margin: 1rem 0 0rem;
    }
    .notification{
        width: 530px;
        align-items: center;
    }
    .warning-icon{
        width: 60px;
        min-width: 30px;
    }
    .msg{
        margin: 1.6rem 0 1rem 0;
    }
    .buttons{
        flex-grow: 1;
        flex-direction: column;
        display: flex;
        padding-top: 27px;
        justify-content: center;
        align-items: center;
    }
</style>

<div class="notification flex-column">
    <div class="warning-icon">{@html cautionIcon}</div>
    <h2>Your Backup is out of Date</h2>
    <div class="text-body1 msg">
        We have detected that new accounts were added to the Lamden Vault since your last backup. You will need to do a new backup to ensure all accounts are backed up.
    </div>
    <div class="buttons">
            <Button
                id={'backup-btn'} 
                name="Backup"
                width={'232px'}
                margin={'0 0 17px 0'}
                classes={'button__solid button__primary'}
                click={toBackup}
            >
            </Button> 
            <Button
                id={'help-btn'} 
                name="Help"
                width={'232px'}
                margin={'0 0 17px 0'}
                classes={'button__solid button__secondary'}
                click={openHelpLink}
            >
            </Button> 
            <Button
                id={'ignore-btn'} 
                width={'232px'}
                margin={'0 0 17px 0'}
                classes={'button__solid button__secondary'}
                name="Ignore"
                click={closeModal}
            >
            </Button> 
    </div>
</div>