<script>
    import {  CacheStore } from '../../src/js/stores/cacheStore.js';

    $: storeExists = !$CacheStore ? false : true;
    $: storeEmpty = Object.keys($CacheStore).length;

    $: numOfContractKeys = $CacheStore['contracts'] ? Object.keys($CacheStore['contracts']).length : 0;
    $: numOfTestNetworkKeys = numOfContractKeys > 0 ? Object.keys($CacheStore['contracts']['testNetwork']).length : 0;
    $: cacheExists = CacheStore.contractExists("testContract", "testNetwork");

    function addContract(contractName, networkName) { CacheStore.addContract(contractName, networkName) }
    function contractExists(contractName, networkName) { cacheExists = CacheStore.contractExists(contractName, networkName) }
    function refreshNetwork(networkName) {CacheStore.refreshNetwork(networkName)} 
    function killStore(){ CacheStore.set(undefined) }
</script>

<!-- Store Meta -->
<div id="storeExists">{storeExists}</div>
<div id="storeEmpty">{storeEmpty}</div>

<!-- Key Counts -->
<div id="numOfContractKeys">{numOfContractKeys}</div>
<div id="numOfTestNetworkKeys">{numOfTestNetworkKeys}</div>

<!-- Key Values -->
{#each Object.keys($CacheStore) as key}
    <div id={`${key}`}>{`${key}`}</div>
    {#each Object.keys($CacheStore[key]) as networkKey}
        <div id={`${key}-${networkKey}`}>{`${networkKey}`}</div>
        {#each Object.keys($CacheStore[key][networkKey]) as contractKey}
        <div id={`${key}-${networkKey}-${contractKey}`}>{`${$CacheStore[key][networkKey][contractKey]}`}</div>
        {/each}
    {/each}
{/each}

<div id="contract-exists">{cacheExists}</div>

<!-- Teating Add Contracts to cache -->
<button id="add-contract" on:click={() => addContract("testContract", "testNetwork")}></button>
<button id="add-undefined-contractName" on:click={() => addContract(undefined, "testNetwork")}></button>
<button id="add-undefined-networkName" on:click={() => addContract("testContract")}></button>

<!-- Teating Value Exists in cache -->
<button id="check-value-exists" on:click={() => contractExists("testContract", "testNetwork")}></button>
<button id="check-value-undefined-contractName" on:click={() => contractExists(undefined, "testBadNetwork")}></button>
<button id="check-value-undefined-networkName" on:click={() => contractExists("testBadContract")}></button>

<!-- Teating Refresh Network Cache -->
<button id="refresh-cache" on:click={() => refreshNetwork("testNetwork")}></button>
<button id="refresh-cache-undefined-networkName" on:click={() => refreshNetwork()}></button>

<!-- Testing Kill Store  -->
<button id="kill-cache-store" on:click={killStore}>Kill Cache Store</button>

