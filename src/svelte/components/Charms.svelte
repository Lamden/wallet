<script>
    //Stores
    import { currentNetwork, currentNetworkName } from '../../js/stores/stores.js';

    //Components
    import Charm from './Charm.svelte'

    //Props
    export let dappInfo;

    $: symbol = `${$currentNetworkName}|${$currentNetwork.type}`
    $: currentNetworkInfo = dappInfo[symbol]
    $: charms = currentNetworkInfo.charms || []
    $: contractName = currentNetworkInfo.contractName

</script>

<style>
.charms{
    flex-wrap: wrap;
}
</style>

<div class="charms flex-row">
    {#each charms as charmInfo}
        <Charm {charmInfo} {dappInfo} {contractName}/>
    {/each}
</div>