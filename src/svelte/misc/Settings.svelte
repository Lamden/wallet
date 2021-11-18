<script>
    import { getContext } from 'svelte';

    // Components
	import { Components }  from '../Router.svelte'
    const { Button } = Components;

    // icons
    import SignOutIcon from '../icons/menu/SignOutIcon.svelte';
    import BackupIcon from '../icons/menu/BackupIcon.svelte';
    import RestoreIcon from '../icons/menu/RestoreIcon.svelte';
    import ChangePasswordIcon from '../icons/menu/ChangePassword.svelte';

    //Stores
	import { CoinStore} from '../../js/stores/stores.js';

    $: numOfAccounts = $CoinStore ? [...$CoinStore].map((coin, index) => {
		coin.id = index
		return coin
	}).filter(c => !c.sk.includes("watchOnly")).length : 0;

    //Context
    const { switchPage } = getContext('app_functions');

    const settings = [{
        id: "backup-btn",
        logo: "backup",
        title: "Backup Wallet",
        desc: "All of the information for your Accounts is stored in this browser. We highly recommend creating a keystore file so that you can recover your Accounts if anything happens to this computer.",
        btnName: "Backup Wallet",
        page: "BackupMain"

    },{
        id: "restore-btn",
        logo: "restore",
        title: "Restore Wallet",
        desc: "It only takes a few minutes, so please have your original keystore file ready, and be prepared to provide the password for it.",
        btnName: "Restore Wallet",
        page: "RestoreMain"
    },
    {
        id: "change-btn",
        logo: "changePassword",
        title: "Change Password",
        desc: "Create a complex password so that no one can unlock your wallet except you.",
        btnName: "Change Password",
        page: "ChangePassword"
    },{
        id: "signout-btn",
        logo: "signout",
        title: "Sign Out & Lock",
        desc: "Keep your wallet safe by locking it after you’re done using it.",
        btnName: "Sign Out & Lock",
        page: "LockScreen"
    }]

    const settingIcons = {
        backup: BackupIcon,
        restore: RestoreIcon,
        signout: SignOutIcon,
        changePassword: ChangePasswordIcon
    }

    const btnAction = (page) => {
        if (page === "LockScreen") {
            chrome.runtime.sendMessage({type: 'lockWallet'});
            return
        }
        switchPage(page)
    }
</script>

<style>
    .wrap{
        padding-left: 35px;
    }
    .divider{
		border-bottom: 1px solid var(--divider-light);
	}
    .setting{
        margin-top: 0.5rem;
        padding-top: 0;
    }
    .setting-logo{
        margin-right: 9px;
        margin-left: 9px;
        padding-top: 14px;
    }
    .setting-title{
        height: 40px;
        line-height: 40px;
    }
    .setting-desc{
        opacity: 0.54;
        margin-bottom: 0.75rem;
        line-height: 20px;
        width: 85%;
    }
    .setting-content{
        flex: 1;
        padding: 0 0 0 37px;
        border-bottom: 2px dashed var(--divider-dark);
    }
    .header{
        line-height: 24px;
    }
    .header-name{
        margin-left: 77px;
        opacity: 0.6;
    }
</style>
<div class="wrap">
    <div class="header text-subtitle2 divider">
        <div class="header-name">Account Settings</div>
    </div>	
    {#each settings as setting}
        <div class="flex setting">
            <div class="setting-logo">
                <svelte:component this={settingIcons[setting.logo]} width={22}/>
            </div>
            <div class="setting-content">
                <div class="text-body1 setting-title weight-400">{setting.title}</div>
                <div class="text-body2 text-primary setting-desc">{setting.desc}</div>
                {#if setting.id === "backup-btn" && numOfAccounts === 0}
                    <div class="text-body2 text-warning setting-desc">You have no accounts to backup</div>
                {/if}

                <Button
                    id={setting.id} 
                    width={'232px'}
                    margin={'0 0 30px 0'}
                    classes={'button__solid button__primary'}
                    name={setting.btnName}
                    click={ ()=> btnAction(setting.page)}
                    disabled={setting.id === "backup-btn" ? numOfAccounts === 0 : false}
                >
                </Button>
                

            </div>
        </div>
    {/each}
</div>