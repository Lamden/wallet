<script>
    import { getContext, onMount } from 'svelte';
    import { themes } from '../../js/themes.js';

	//Stores
    import { SettingsStore, currentNetwork, themeStyle } from '../../js/stores/stores.js';
    
	//Components
    import { NavStatus }  from '../Router.svelte'

    //Utils
    import { masternodeAPI  } from '../../js/lamden/masternode-api.js';

    //Context
    const { switchPage } = getContext('app_functions');

    $: status = masternodeAPI($currentNetwork, 'ping', {}, (res, err) => {
                    try { return res.status; } 
                    catch (e) {return 'offline';}
                })

    function toggleTheme(event) {
        SettingsStore.changeTheme(event.detail ? 'light' : 'dark')
        document.querySelector("html").style = themes[$themeStyle];
    }

</script>

<style>
.box{
    justify-content: center;
    align-items: flex-end;
    padding: 0 61px 0 30px;
}
</style>

<div class="box text-body2 flex-column">
    <div>{`Current Network`}</div>
    <div class="text-primary-dark clickable" on:click={() => switchPage('DevToolsMain')}>{$currentNetwork.name}</div>
    <NavStatus {status} />
</div>