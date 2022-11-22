<script>
    import {
      getContext,
      onMount
    } from "svelte";
    import { NodesStore, networkKey, currentNetwork, CoinStore} from "../../js/stores/stores.js";

    import Node from "./Node.svelte";
    import Motion from "./Motion.svelte";

    //Images
    import doco from '../../img/menu_icons/icon_doco.svg';
    import nodeicon from '../../img/menu_icons/icon_network.svg';
    import tau from '../../img/coin_logos/lamden_logo_white.svg';

    //Components
	import { Components }  from '../Router.svelte'
    import ExpandIcon from "../icons/ExpandIcon.svelte";
    import { keysFromNew } from "../../js/crypto/wallets.js";

    import Card from './Card.svelte';

    const { Button } = Components;

    let policies, motions = []

        
    let cardList = [
        {
            name: 'Reawards',
            desc: '20,649,472.7302',
            logo: tau
        },
        {
            name: 'Guide',
            desc: [{url: "", name: "Node Installation Guide"}, {url: "", name: "How to use admin dashbord"}],
            logo: doco
        },
    ]

    $: netKey = networkKey($currentNetwork)
    $: nodes = $NodesStore.filter(n => n.netKey === netKey && $CoinStore.findIndex(c => c.vk === n.vk) > -1)
    $: memberNodes = nodes.filter(k => k.status === "node")
    $: allMemberNodes = $NodesStore.filter(n => n.netKey === netKey && n.status === "node")

    onMount(() => {
        chrome.runtime.sendMessage({type: 'updateNodes'})
        getCurrentMasterNodeMotion()
    })

    //Context
    const { openModal } = getContext("app_functions");

    const openNewNodeModal = () => {
        openModal("AddNewNode");
    }

    const getCurrentMasterNodeMotion = async () => {
        let name = "masternodes"
        let data = await fetch(`${$currentNetwork.blockservice.host}/contracts/${name}`)
            .then(res => res.json())
            .then(data => data[name].S)
        let motion = {
            policy: "masternodes",
            status:  new Date(data.motion_opened).getTime() + 86400000 < new Date().getTime(),
            yays: data.yays,
            nays: data.nays,
            value: data.current_motion,
            positions: []
        }

        const len = data.members.length 
        if ( new Date(data.motion_opened).getTime() + 86400000 < new Date().getTime()) {
            motion.status = "open"
        } else if (motion.yays > len) {
            motion.status = "✔️"
        } else {
            motion.status = "❌" 
        } 

        for (const m of allMemberNodes) {
            let isNodeOwner = memberNodes.findIndex(n => n.vk === m.vk) > -1
            if (data.positions[m.vk] === null) {
                motion.positions.push({vk: m.vk, value: 1, isNodeOwner})
            } else if (data.positions[m.vk] === true) {
                motion.positions.push({vk: m.vk, value: 2, isNodeOwner})
            } else {
                motion.positions.push({vk: m.vk, value: 0, isNodeOwner})
            }
        }

        // process masternode motion
        switch(motion.value) {
            case 1:
                // REMOVE_MEMBER
                motion.name = "Remove Member"
                motion.desc = `This is a motion to remove member ${data.member_in_question}`
                break;
            case 2:
                // ADD_SEAT
                motion.name = "Add Seat"
                break;
            case 3:
                // REMOVE_SEAT
                motion.name = "Remove Seat"
                break;
            default:
                motion.name = "No Motion"
                // NO_MOTION
        }
        motions.push(motion)
        motions = motions
    }

</script>
<style>
    .motion-header-name {
        flex-basis: 340px;
        min-width: 160px;
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
        flex-basis: 240px;
        min-width: 160px;
    }
    .node-type {
        flex-basis: 240px;
        min-width: 100px;
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
    .buttons{
        display: flex;
        justify-content: flex-start;
        margin-top: 2rem;
    }
    .comment{
        margin-top: 4rem;
    }
    .empty{
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    hr{
        width: 100%;
        border: 1px dashed var(--divider-dark);
        margin: 0.5rem 0;
    }
    .card-box{
        display: flex;
        flex-direction: row;
        margin-top: 1rem;
        flex-wrap: wrap;
    }
</style>
<div class="card-box">
{#each cardList as cardInfo}
    <Card {cardInfo} logo={cardInfo.logo} width={'300px'}/>
{/each}
</div>

<div class="node-list">
    <div class="header header-text text-body1 weight-800">
        <div class="motion-header-name header-text">Motion List</div>
        <div class="node-type header-text">Policy</div>
        <!-- <div class="node-type header-text">Rewards</div> -->
        <div class="node-type header-text">Motion</div>
        <div class="node-type header-text">Result</div>
        <div class="node-type header-text">Status</div>
    </div>
    {#each motions as item }
        <Motion data={item} />
    {/each}
</div>
<hr>
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
{:else}
<div class="empty">
    <div class="text-body1 comment">
        You have no member nodes.
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