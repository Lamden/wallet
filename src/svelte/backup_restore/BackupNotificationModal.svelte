<script>
    import { getContext } from 'svelte';
    //Images
    import cautionIcon from '../../img/menu_icons/icon_caution.svg'

    //Stores
	import { SettingsStore } from '../../js/stores/stores.js';
    
    //Components
	import { Components }  from '../Router.svelte'
    const { Button } = Components;

    //Context
    const { closeModal, switchPage } = getContext('app_functions');

    let checked = false;
    let helpLink = "https://docs.lamden.io/docs/develop/wallet_api/overview";

    const toBackup = () => {
        switchPage("Backup")
    }

    const openHelpLink = () => {
        window.open(helpLink, '_blank');
    }

    const handleChange = () => {
        if (checked) {
            SettingsStore.dismissWarning()
        } else {
            SettingsStore.setDismissWarning()
        }
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
    label{
        display: flex;
        margin: 0.5rem auto;
    }
    label > input {
        height: 14px;
        margin: 0 10px 0 0;
    }
    label > strong {
        color: var(--font-accent);
        margin-right: 10px;
    }
</style>

<div class="notification flex-column">
    <div class="warning-icon">{@html cautionIcon}</div>
    <h2>Your Backup is out of Date</h2>
    <div class="text-body1 msg">
        We have detected that new accounts were added to the wallet since your last backup. You will need to do a new backup to ensure all accounts are backed up.
    </div>
    <label>
        <input id="trusted" type="checkbox" on:change={handleChange} bind:checked={checked}>
        <strong>Don't show me this again</strong>
    </label> 
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
                classes={'button__solid button__primary'}
                click={openHelpLink}
            >
            </Button> 
            <Button
                id={'ignore-btn'} 
                width={'232px'}
                margin={'0 0 17px 0'}
                classes={'button__solid button__primary'}
                name="Ignore"
                click={closeModal}
            >
            </Button> 
    </div>
</div>