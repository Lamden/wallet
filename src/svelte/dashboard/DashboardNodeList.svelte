<script>
    import {
      getContext,
      onMount
    } from "svelte";
    import { NodesStore, networkKey, currentNetwork, CoinStore} from "../../js/stores/stores.js";

    import Node from "./Node.svelte";

    //Components
	import { Components }  from '../Router.svelte'
    import PlusIcon from "../icons/PlusIcon.svelte";

    const { Button } = Components;

    $: netKey = networkKey($currentNetwork)
    $: nodes = $NodesStore.filter(n => n.netKey === netKey && $CoinStore.findIndex(c => c.vk === n.vk) > -1)
    $: memberNodes = nodes.filter(k => k.status === "node")
    $: candidateNodes = nodes.filter(k => k.status === "candidate")
    $: unregisterNodes = nodes.filter(k => k.status === "unregister")

    onMount(() => {
        chrome.runtime.sendMessage({type: 'updateNodes'})
    })

    //Context
    const { openModal } = getContext("app_functions");

    const openNewNodeModal = () => {
        openModal("AddNewNode");
    }


</script>
<style>
    .icon {
        margin-left: 4px;
    }
    .node-list {
        display: flex;
        flex-direction: column;
    }

    .header {
        display: flex;
        flex-direction: row;
        width: 100%;
        margin-bottom: 0.5rem;
        font-weight: 800;
    }

    .header-name {
        flex-basis: 260px;
        min-width: 260px;
    }
    
    .node-type {
        flex-basis: 240px;
        min-width: 160px;
    }
    .top-btns {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 1em;
    }
    .add-node-btn {
        padding: 4px 11px;
        margin-left: 10px;
        font-size: 0.8em;
        letter-spacing: 0.5px;
        align-items: center;
        font-weight: bold;
        align-items: center;
    }

    .buttons {
        display: flex;
        justify-content: flex-start;
        margin-top: 2rem;
    }

    .comment {
        margin-top: 4rem;
    }

    .empty{
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    hr {
        width: 100%;
        border: 1px dashed var(--divider-dark);
        margin: 2rem 0;
    }
</style>

{#if nodes.length > 0}
    <div class="top-btns">
        <button
            id="add-node-btn"
            class="button__small button__primary add-node-btn flex-row"
            on:click={openNewNodeModal}
        >
            Add Node
            <div class="icon">
                <PlusIcon width="18px" color="var(--color-white)" />
            </div>
        </button>
    </div>
    {#if memberNodes.length > 0}
        <div class="node-list">
            <div class="header header-text text-body1 weight-800">
                <div class="header-name header-text">My Network Nodes</div>
                <div class="node-type header-text">Type</div>
                <!-- <div class="node-type header-text">Rewards</div> -->
                <div class="node-type header-text">Status</div>
            </div>
            {#each memberNodes as item }
                <Node data={item} />
            {/each}
        </div>
        <hr>
    {/if}
    {#if candidateNodes.length > 0}
        <div class="node-list">
            <div class="header header-text text-body1 weight-800">
                <div class="header-name header-text">My Nodes Candidates</div>
                <div class="node-type header-text">Type</div>
                <!-- <div class="node-type header-text">Rewards</div> -->
                <div class="node-type header-text">Status</div>
            </div>
            {#each candidateNodes as item }
                <Node data={item} />
            {/each}
        </div>
        <hr>
    {/if}
    {#if unregisterNodes.length > 0}
        <div class="node-list">
            <div class="header header-text text-body1 weight-800">
                <div class="header-name header-text">My Unregister Nodes</div>
                <div class="node-type header-text">Type</div>
                <!-- <div class="node-type header-text">Rewards</div> -->
                <div class="node-type header-text">Status</div>
            </div>
            {#each unregisterNodes as item }
                <Node data={item} />
            {/each}
        </div>
    {/if}
{:else}
    <div class="empty">
        <div class="text-body1 comment">
            You have no nodes.
        </div>
        <div class="buttons">
            <Button 
                    id={"empty-add-btn"}
                    classes={'button__solid button__primary'}
                    styles={'margin-right: 23px;'}
                    width={'232px'}
                    name="Add New Node" 
                    click={openNewNodeModal} />
            <Button 
                    id={"empty-restore-btn"}
                    classes={'button__solid'} 
                    width={'232px'}
                    name="Learn More" 
                    click={() => window.open('https://docs.lamden.io/docs/wallet/overview', '_blank')} />
        </div>
    </div>
{/if}