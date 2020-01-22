<script>
    import {  SettingsStore } from '../../src/js/stores/settingsStore.js';
    let emptyNetwork;
    let newNetwork = {
        name: 'New Testing Network', 
        ip:'http://127.0.0.1', 
        port: '8080', 
        selected: false
    }
    let newBadNetwork = {name:'Bad Netowrk Info'};

    $: numOfNetworks = $SettingsStore.networks.length;

    function changePage(){$SettingsStore.currentPage = {name: 'Testing', data:{}};}
    function changeTheme(){$SettingsStore.themeStyle = 'light'}
    function addNetwork(){SettingsStore.addNetwork(newNetwork)}
    function addUndefinedNetwork(){SettingsStore.addNetwork(emptyNetwork)}
    function addBadNetwork(){SettingsStore.addNetwork(newBadNetwork)}
    function setNetworkStatus(){SettingsStore.setNetworkStatus(newNetwork, true)}
    function setBadNetworkStatus(){SettingsStore.setNetworkStatus(newNetwork, 'online')}
</script>

<div id={"currentPage-name"}>{$SettingsStore.currentPage.name}</div>
<div id={"firstRun"}>{$SettingsStore.firstRun}</div>
<div id={"themeStyle"}>{$SettingsStore.themeStyle}</div>
<div id={"version"}>{$SettingsStore.version}</div>
<div id={"storage-used"}>{$SettingsStore.storage.used}</div>
<div id={"storage-remaining"}>{$SettingsStore.storage.remaining}</div>
<div id={"storage-max"}>{$SettingsStore.storage.max}</div>

<div id={"numOfNetworks"}>{numOfNetworks}</div>

{#each $SettingsStore.networks as network, index}
    <div id={`${index}-network-name`}>{$SettingsStore.networks[index].name}</div>
    <div id={`${index}-network-ip`}>{$SettingsStore.networks[index].ip}</div>
    <div id={`${index}-network-port`}>{$SettingsStore.networks[index].port}</div>
    <div id={`${index}-network-lamden`}>{$SettingsStore.networks[index].lamden}</div>
    <div id={`${index}-network-online`}>{$SettingsStore.networks[index].online}</div>
    <div id={`${index}-network-selected`}>{$SettingsStore.networks[index].selected}</div>
{/each}

<button id={"change-page"} on:click={changePage} />
<button id={"change-theme"} on:click={changeTheme} />
<button id={"add-network"} on:click={addNetwork} />
<button id={"add-undefined-network"} on:click={addUndefinedNetwork} />
<button id={"add-bad-network"} on:click={addBadNetwork} />
<button id={"change-network-status"} on:click={setNetworkStatus} />
<button id={"change-network-status-bad"} on:click={setBadNetworkStatus} />

