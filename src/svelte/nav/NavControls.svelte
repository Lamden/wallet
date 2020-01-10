<script>
    import { getContext, onMount } from 'svelte';
    import { themes } from '../../js/themes.js';

	//Stores
	import { SettingsStore, currentNetwork } from '../../js/stores/stores.js';

    //Context
    const { switchPage } = getContext('app_functions');

    function toggleTheme(event) {
		SettingsStore.update(current => {
            current.themeStyle = event.detail ? 'light' : 'dark';
            document.querySelector("html").style = themes[current.themeStyle];
            return current;
        })   
    }

    $: currentNetworkOnline = () => {
            return fetch(`http://${$currentNetwork.ip}:${$currentNetwork.port}/ping`)
            .then(res => res.json())
            .then(res => {
                let online = true;
                if (res.status !== 'online') return false;
                return true;
            })
            .catch(err => {console.log(err); return false})
    }

</script>

<style>
.box{
    justify-content: center;
    align-items: flex-end;
    padding: 0 61px 0 30px;
}
.online{
    color:green;
}
.offline{
    color:red;
}
</style>

<div class="box text-body2 flex-column">
    <div>{`Current Network`}</div>
    <div class="text-primary-dark clickable" on:click={() => switchPage('DevToolsMain')}>{$currentNetwork.name}</div>
    {#await currentNetworkOnline()}
        <div>{'checking'}</div>
    {:then status}
        {#if status}
            <div class="online">{'online'}</div>
        {:else}
            <div class="offline">{'offline'}</div>
        {/if}
    {:catch error}
        <div class="offline">{'offline'}</div>
    {/await}
</div>