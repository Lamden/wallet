<script>
    import {  
        SettingsStore,
        currentPage,
        firstRun,
        themeStyle,
        networks,
        currentNetwork, 
        storageInfo
    } from '../../src/js/stores/settingsStore.js';
    let emptyNetwork;
    let newNetwork = {
        name: 'New Testing Network', 
        ip:'http://127.0.0.1', 
        port: '8080',
        selected: true,
    }
    let lamdenNetwork = {
        name: 'New Lamden Network', 
        ip:'http://localhost', 
        port: '443', 
        lamden: true
    }
    let newBadNetwork = {
        name:'Bad Netowrk Info'
    };
    let missingNetwork = {
        name:'Missing Netowrk',
        ip: 'http://missing',
        port: '8080'
    };

    $: storeExists = !$SettingsStore || Object.keys($SettingsStore).length === 0 ? false : true; 
    $: numOfNetworks = $SettingsStore.networks.length;
    $: numOfDerivedNetworks = $networks.length;

    function firstRunComplete() { SettingsStore.firstRunComplete() }
    function changePage(name, data) { SettingsStore.changePage({name, data}) }
    function changeTheme(theme) { SettingsStore.changeTheme(theme) }
    function addNetwork(network) { SettingsStore.addNetwork(network) }
    function setNetworkStatus(network, status) { SettingsStore.setNetworkStatus(network, status) }
    function deleteNetwork(network) { SettingsStore.deleteNetwork(network) }
    function setCurrentNetwork(network) { SettingsStore.setCurrentNetwork(network) }
    function setStoreValue(value) { SettingsStore.set(value) }
</script>


{#if storeExists}
    <!-- Settings Store Values -->
    <h2>Settings Store Values</h2>
    <div id={"currentPage-name"}>{$SettingsStore.currentPage.name}</div>
    <div id={"currentPage-data"}>{$SettingsStore.currentPage.data}</div>
    <div id={"firstRun"}>{$SettingsStore.firstRun}</div>
    <div id={"themeStyle"}>{$SettingsStore.themeStyle}</div>
    <div id={"version"}>{$SettingsStore.version}</div>
    <div id={"storage-used"}>{$SettingsStore.storage.used}</div>
    <div id={"storage-remaining"}>{$SettingsStore.storage.remaining}</div>
    <div id={"storage-max"}>{$SettingsStore.storage.max}</div>

    <div id={"numOfNetworks"}>{numOfNetworks}</div>

    <!-- Networks Values -->
    {#each $SettingsStore.networks as network, index}
        <h2>{`Networks Value ${index}`}</h2>
        <div id={`${index}-network-name`}>{$SettingsStore.networks[index].name}</div>
        <div id={`${index}-network-ip`}>{$SettingsStore.networks[index].ip}</div>
        <div id={`${index}-network-port`}>{$SettingsStore.networks[index].port}</div>
        <div id={`${index}-network-lamden`}>{$SettingsStore.networks[index].lamden}</div>
        <div id={`${index}-network-online`}>{$SettingsStore.networks[index].online}</div>
        <div id={`${index}-network-selected`}>{$SettingsStore.networks[index].selected}</div>
    {/each}

    <!-- Derived Store Values -->
    <h2>Derived Store Values</h2>
    <div id={"derived-currentPage-name"}>{$currentPage.name}</div>
    <div id={"derived-currentPage-data"}>{$currentPage.data}</div>
    <div id={"derived-firstRun"}>{$firstRun}</div>
    <div id={"derived-themeStyle"}>{$themeStyle}</div>
    <div id={"derived-currentNetwork-name"}>{$currentNetwork.name}</div>
    <div id={"derived-currentNetwork-ip"}>{$currentNetwork.ip}</div>
    <div id={"derived-currentNetwork-port"}>{$currentNetwork.port}</div>
    <div id={"derived-currentNetwork-lamden"}>{$currentNetwork.lamden}</div>
    <div id={"derived-currentNetwork-online"}>{$currentNetwork.online}</div>
    <div id={"derived-currentNetwork-selected"}>{$currentNetwork.selected}</div>
    <div id={"derived-storage-used"}>{$storageInfo.used}</div>
    <div id={"derived-storage-remaining"}>{$storageInfo.remaining}</div>
    <div id={"derived-storage-max"}>{$storageInfo.max}</div>

    <div id={"numOfDerivedNetworks"}>{numOfDerivedNetworks}</div>

    <!-- Derived Store Networks Values -->
    {#each $networks as network, index}
        <h2>{`Derived Store Network ${index}`}</h2>
        <div id={`${index}-derived-network-name`}>{$networks[index].name}</div>
        <div id={`${index}-derived-network-isSelected`}>{$networks[index].selected}</div>
        <div id={`${index}-derived-network-ip`}>{$networks[index].value.ip}</div>
        <div id={`${index}-derived-network-port`}>{$networks[index].value.port}</div>
        <div id={`${index}-derived-network-lamden`}>{$networks[index].value.lamden}</div>
        <div id={`${index}-derived-network-online`}>{$networks[index].value.online}</div>
        <div id={`${index}-derived-network-selected`}>{$networks[index].value.selected}</div>
    {/each}

    <!-- Testing setting first run complete -->
    <button id={"firstrun-complete"} on:click={() => firstRunComplete()} />

    <!--Testing Currnet Page-->
    <button id={"change-page"} on:click={() => changePage('Testing', 'page data')} />
    <button id={"change-blank-page"} on:click={() => changePage('')} />
    <button id={"change-undefined-page"} on:click={() => changePage()} />
    <button id={"change-undefined-data"} on:click={() => changePage('New Page')} />

    <!--Testing Current Theme-->
    <button id={"change-theme"} on:click={() => changeTheme('light')} />
    <button id={"change-theme-undefined"} on:click={() => changeTheme()} />

    <!--Testing Adding Networks-->
    <button id={"add-network"} on:click={() => addNetwork(newNetwork)} />
    <button id={"add-undefined-network"} on:click={() => addNetwork(emptyNetwork)} />
    <button id={"add-bad-network"} on:click={() => addNetwork(newBadNetwork)} />
    <!--Testing Changing Network Status-->
    <button id={"change-network-status"} on:click={() => setNetworkStatus(newNetwork, true)} />
    <button id={"change-network-status-bad"} on:click={() => setNetworkStatus(newNetwork, 'online')} />
    <!--Testing Deleting Networks-->
    <button id={"delete-network"} on:click={() => deleteNetwork(newNetwork)} />
    <button id={"add-network-lamden"} on:click={() => addNetwork(lamdenNetwork)} />
    <button id={"delete-undefined-network"} on:click={() => deleteNetwork()} />
    <button id={"delete-lamden-network"} on:click={() => deleteNetwork(lamdenNetwork)} />
    <!--Testing Setting Network Current-->
    <button id={"set-current-network"} on:click={() => setCurrentNetwork(lamdenNetwork)} />
    <button id={"set-current-network-undefined"} on:click={() => setCurrentNetwork()} />
    <button id={"set-current-network-badnetwork"} on:click={() => setCurrentNetwork(newBadNetwork)} />
    <button id={"set-current-network-doesntexist"} on:click={() => setCurrentNetwork(missingNetwork)} />

    <!--Testing Setting Store Values-->
    <button id={"set-undefiened-store-value"} on:click={() => setStoreValue()} />
    <button id={"set-empty-store-value"} on:click={() => setStoreValue({})} />

{/if}
<div id="store-exists">{storeExists}</div>