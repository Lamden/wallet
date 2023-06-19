<script>
    import {
      getContext,
      onMount
    } from "svelte";
    import { NodesStore, networkKey, currentNetwork, CoinStore, PolicyStore, freshPolicy} from "../../js/stores/stores.js";

    import Node from "./Node.svelte";
    import Motion from "./Motion.svelte";

    //Images
    import doco from '../../img/menu_icons/icon_doco.svg';
    import tau from '../../img/coin_logos/lamden_logo_white.svg';
    import heart from '../../img/menu_icons/icon_heart.svg';

    import utils from "../../js/utils"

    //Components
	import { Components }  from '../Router.svelte';

    import Card from './Card.svelte';

    const { Button } = Components;

    let daoBalance = 0
    let totalRewards = 0

    $: netKey = networkKey($currentNetwork)
    $: motions = $PolicyStore && $PolicyStore[netKey] ? $PolicyStore[netKey] : [];
    $: cardList = [
        {
            name: 'Rewards',
            desc: totalRewards,
            logo: tau
        },
        {
            name: 'Dao Balance',
            desc: daoBalance,
            logo: heart
        },
        {
            name: 'Guide',
            desc: [{url: "https://arko.lamden.io", name: "Node Installation Guide"}, {url: "https://docs.lamden.io", name: "How to use admin dashbord"}],
            logo: doco
        },
    ]

    $: nodes = $NodesStore.filter(n => n.netKey === netKey && $CoinStore.findIndex(c => c.vk === n.vk) > -1)
    // user's nodes
    $: memberNodes = nodes.filter(k => k.status === "node")
    // all nodes
    $: allMemberNodes = $NodesStore.filter(n => n.netKey === netKey && n.status === "node")

    onMount(() => {
        chrome.runtime.sendMessage({type: 'updateNodes'})
        getStatics()
        freshPolicy("all")
    })

    //Context
    const { openModal } = getContext("app_functions");

    const openNewNodeModal = () => {
        openModal("AddNewNode");
    }

    const getStatics = async () => {
        let res1 = await $currentNetwork.getVariable("currency", "balances", "dao")
        if (res1.value) {
            if (res1.value.__fixed__) {
                daoBalance = res1.value.__fixed__
            } else {
                daoBalance = res1.value
            }
        } else {
            daoBalance = 0
        }

        totalRewards = await fetch(`${$currentNetwork.blockservice.host}/rewards/total`)
            .then(res => res.json())
            .then(data => utils.displayBalance(data.amount))

    }

    const refresh = () => {
        chrome.runtime.sendMessage({type: 'updateNodes'})
        getStatics()
        freshPolicy("all")
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
        flex-basis: 260px;
        min-width: 160px;
    }
    .node-type {
        flex-basis: 240px;
        min-width: 100px;
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

<Button id="refresh-dashboard"
    margin={'0 0 .625rem 0'}
    classes={'button__solid button__primary'}
    name="Refresh" 
    width={'200px'}
    click={refresh} />  

<div class="node-list">
    <div class="header header-text text-body1 weight-800">
        <div class="motion-header-name header-text">Policy List</div>
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