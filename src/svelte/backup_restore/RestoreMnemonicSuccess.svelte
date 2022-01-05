<script>
    import { onMount, getContext } from 'svelte';
    import { fade } from 'svelte/transition';

    //Stores
    import { CoinStore, SettingsStore } from '../../js/stores/stores.js';

    //Components
	import { Components, LeftSideFullPage }  from '../Router.svelte'
    const { Button } = Components;

    //Context
    const { appHome } = getContext('app_functions');

</script>

<style>
    .wrap{
        widows: 347px;
    }
    .box{
        font-size: 18px;
        margin-bottom: 1.5rem;
    }
</style>

<LeftSideFullPage title="Restore Success" helpLink="">
    <div slot="body">
        <div class="text-body1 weight-400 desc">
            You have succesfully restored your Lamden Vault Accounts.
        </div>
    </div>
    <div class="flex-row flow-page flex-just-center" in:fade="{{delay: 0, duration: 200}}" slot="content">
        <div class="flex-column wrap flex-align-center">
            <h6 class="text-primary text-center">Recovery Phrase</h6>
            <div class="text-body1 box">Your Lamden Vault is already using this Recovery Phrase.</div>
            <Button id="restore-wallet"
                classes={'button__solid button__primary'}
                margin={'0 0 1rem 0'}
                name="Finish" 
                width={'347px'}
            click={() => appHome()} />
        </div>
    </div>>
</LeftSideFullPage>

