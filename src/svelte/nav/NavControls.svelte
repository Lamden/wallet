<script>
    import { getContext, onMount } from 'svelte';
    import { themes } from '../../js/themes.js';

	//Stores
    import { SettingsStore, currentNetwork } from '../../js/stores/stores.js';
    
	//Components
    import { NavStatus }  from '../../js/router.js'

    //Context
    const { switchPage } = getContext('app_functions');

    let status = 'checking';

    onMount(() => {
        currentNetworkOnline();
    })

    function toggleTheme(event) {
		SettingsStore.update(current => {
            current.themeStyle = event.detail ? 'light' : 'dark';
            document.querySelector("html").style = themes[current.themeStyle];
            return current;
        })   
    }

    function currentNetworkOnline(){
        status = 'checking';
        fetch(`${$currentNetwork.ip}:${$currentNetwork.port}/ping`)
            .then(res => res.json())
            .then(res => {
                let result = 'online';
                if (res.status !== 'online') result = 'offline';
                status = result;
            })
            .catch(err => {console.log(err); status = 'offline'})
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