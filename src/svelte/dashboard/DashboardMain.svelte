<script>
    import {
      getContext,
      onMount
    } from "svelte";
    import { NodesStore, networkKey, currentNetwork } from "../../js/stores/stores.js";

    import Node from "./Node.svelte";
    import Motion from "./Motion.svelte";
    //Components
	import { Components }  from '../Router.svelte'
    import ExpandIcon from "../icons/ExpandIcon.svelte";

    const { Button } = Components;

    $: netKey = networkKey($currentNetwork)
    $: nodes = $NodesStore.filter(n => n.netKey === netKey)

    onMount(() => {
        chrome.runtime.sendMessage({type: 'updateNodes'})
        console.log($NodesStore)
    })

    //Context
    const { openModal } = getContext("app_functions");

    const openNewNodeModal = () => {
        openModal("TokenLamdenSend", {
            token: {}
        });
    }

</script>
<style>
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
</style>

<div>
    
</div>

<!-- <Button
    classes={'button__solid button__primary'}
    name="Add New Node"
    on:click = {openNewNodeModal}
/>

<Button
    classes={'button__solid button__primary'}
    name="Create Motion"
/> -->

<!-- <div class="node-list">
    <Node />
</div> -->
{#if nodes.length > 0}
    <div class="node-list">
        <div class="top-btns">
            <button
                id="add-node-btn"
                class="button__small button__primary add-node-btn flex-row"
                on:click={openNewNodeModal}
            >
                Add Node
                <div class="icon">
                    <ExpandIcon width="18px" color="var(--color-white)" />
                </div>
            </button>
        </div>
        <div class="header header-text text-body1 weight-800">
            <div class="header-name header-text">Node List</div>
            <div class="node-type header-text">Type</div>
            <!-- <div class="node-type header-text">Rewards</div> -->
            <div class="node-type header-text">Status</div>
        </div>
        {#each nodes as item }
            <Node data={item} />
        {/each}
        <!-- <Motion /> -->
    </div>
{/if}