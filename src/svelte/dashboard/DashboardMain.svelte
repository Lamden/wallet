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
    import tau from '../../img/coin_logos/lamden_logo_white.svg';
    import heart from '../../img/menu_icons/icon_heart.svg';

    import utils from "../../js/utils"

    //Components
	import { Components }  from '../Router.svelte';

    import Card from './Card.svelte';

    const { Button } = Components;

    let motions = []
    let daoBalance = 0
    let totalRewards = 0

        
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
            desc: [{url: "", name: "Node Installation Guide"}, {url: "", name: "How to use admin dashbord"}],
            logo: doco
        },
    ]

    $: netKey = networkKey($currentNetwork)
    $: nodes = $NodesStore.filter(n => n.netKey === netKey && $CoinStore.findIndex(c => c.vk === n.vk) > -1)
    // user's nodes
    $: memberNodes = nodes.filter(k => k.status === "node")
    // all nodes
    $: allMemberNodes = $NodesStore.filter(n => n.netKey === netKey && n.status === "node")

    onMount(() => {
        chrome.runtime.sendMessage({type: 'updateNodes'})
        getCurrentMasterNodeMotion()
        getCurrentDaoMotion()
        getRewardsMotion()
        getStampCostMotion()
        getStatics()
        getUpgradeMotion()
    })

    //Context
    const { openModal } = getContext("app_functions");

    const openNewNodeModal = () => {
        openModal("AddNewNode");
    }

    const getRewardsMotion = async () => {
        let name = "rewards"
        let data = await fetch(`${$currentNetwork.blockservice.host}/contracts/${name}`)
            .then(res => res.json())
            .then(data => data[name].S)

        let motion = {
            policy: "rewards",
            yays: data.vote_count,
            nays: 0,
            positions: []
        }

        if (data.election_start) {
            // check whether ended
            let isOver = data['vote_count'] >= data['min_votes_required'] 
            || new Date().getTime() - utils.decodePythonTime(data['election_start'], "time") >= utils.decodePythonTime(data['election_max_length'], "delta")

            if (!isOver) {
                // starting
                motion.status = 1
            } else {
                motion.status = 0
            }

            for (const m of allMemberNodes) {
                let isNodeOwner = memberNodes.findIndex(n => n.vk === m.vk) > -1
                if (data.has_voted[m.vk] && !isOver) {
                    motion.positions.push({vk: m.vk, value: 2, isNodeOwner})
                } else {
                    motion.positions.push({vk: m.vk, value: 0, isNodeOwner})
                }
            }
        } else {
            motion.status = 0
            for (const m of allMemberNodes) {
                let isNodeOwner = memberNodes.findIndex(n => n.vk === m.vk) > -1
                motion.positions.push({vk: m.vk, value: 0, isNodeOwner})
            }
        }

        motion.name = motion.status ? "rewards" : "No Motion",
        motion.desc = `<p>Current Reward Split: </p>masternode: ${data.value[0].__fixed__}<br> blackhole: ${data.value[1].__fixed__} <br> foundation: ${data.value[2].__fixed__} <br> developer: ${data.value[3].__fixed__}`

        motions.push(motion)
        motions = motions
    }

    const getStampCostMotion = async () => {
        let name = "stamp_cost"
        let data = await fetch(`${$currentNetwork.blockservice.host}/contracts/${name}`)
            .then(res => res.json())
            .then(data => data[name].S)
        
        let motion = {
            policy: "stamp_cost",
            yays: data.vote_count,
            nays: 0,
            positions: []
        }

        if (data.election_start) {
            // check whether ended
            let isOver = data['vote_count'] >= data['min_votes_required'] 
            || new Date().getTime() - utils.decodePythonTime(data['election_start'], "time") >= utils.decodePythonTime(data['election_max_length'], "delta")

            if (!isOver) {
                // starting
                motion.status = 1
            } else {
                motion.status = 0
            }

            for (const m of allMemberNodes) {
                let isNodeOwner = memberNodes.findIndex(n => n.vk === m.vk) > -1
                if (data.has_voted[m.vk] && !isOver) {
                    motion.positions.push({vk: m.vk, value: 2, isNodeOwner})
                } else {
                    motion.positions.push({vk: m.vk, value: 0, isNodeOwner})
                }
            }
        } else {
            motion.status = 0
            for (const m of allMemberNodes) {
                let isNodeOwner = memberNodes.findIndex(n => n.vk === m.vk) > -1
                motion.positions.push({vk: m.vk, value: 0, isNodeOwner})
            }
        }

        motion.name = motion.status ? "Stamps" : "No Motion"

        let data2 = await fetch(`${$currentNetwork.blockservice.host}/rootkey_history?contract=stamp_cost&variable=S&root_key=value`)
            .then(res => res.json())
            .then(data => data['history'])

        let changedTime = ""
        if (data2.length > 0) {
            let timeStamp = Math.floor(data2[0].blockNum / 1000000)
            let strarr = new Date(timeStamp).toDateString().split(' ')
            changedTime = `Changed: ${strarr[1]} ${strarr[2]}, ${strarr[3]}`
        } else {
            changedTime = "Changed: Genesis"
        }

        motion.desc = `
            Current Stamp Ratio: ${data.value} Stamps/${$currentNetwork.currencySymbol}
            <p class="text-secondary">${changedTime}</p>
        `

        motions.push(motion)
        motions = motions
    }

    const getCurrentMasterNodeMotion = async () => {
        let name = "masternodes"
        let data = await fetch(`${$currentNetwork.blockservice.host}/contracts/${name}`)
            .then(res => res.json())
            .then(data => data[name].S)
        let motion = {
            policy: "masternodes",
            yays: data.yays,
            nays: data.nays,
            value: data.current_motion,
            positions: []
        }
        let stamp = utils.decodePythonTime(data.motion_opened, "time") + 86400000
        if (data.motion_opened && stamp > new Date().getTime()) {
            // starting
            motion.status = 1
        } else {
            motion.status = 0
        }

        if (!data.positions) data.positions = []
        for (const m of allMemberNodes) {
            let isNodeOwner = memberNodes.findIndex(n => n.vk === m.vk) > -1
            if (data.positions[m.vk] === true && motion.status) {
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

    const getCurrentDaoMotion = async () => {
        let name = "dao"
        let data = await fetch(`${$currentNetwork.blockservice.host}/contracts/${name}`)
            .then(res => res.json())
            .then(data => data[name].S)
        let amount = data.amount ? data.amount.__fixed__? data.amount.__fixed__ : data.amount : 0
        let isStart = utils.decodePythonTime(data.motion_start, "time") + utils.decodePythonTime(data.motion_period, "delta") > new Date().getTime()
        let motion = {
            policy: name,
            name: isStart? "Dao" : "No Motion",
            desc: isStart? `${data.recipient_vk} will get ${amount} ${$currentNetwork.currencySymbol}s ` : null,
            yays: data.yays,
            nays: data.nays,
            positions: []
        }

        if (isStart) {
            motion.status = 1
        } else {
            motion.status = 0
        }

        if (!data.positions) data.positions = []

        for (const m of allMemberNodes) {
            let isNodeOwner = memberNodes.findIndex(n => n.vk === m.vk) > -1
            if (data.positions[m.vk] === true) {
                motion.positions.push({vk: m.vk, value: 2, isNodeOwner})
            } else {
                motion.positions.push({vk: m.vk, value: 0, isNodeOwner})
            }
        }

        motions.push(motion)
        motions = motions
    }

    const getUpgradeMotion = async () => {
        let name = "upgrade"
        let data = await fetch(`${$currentNetwork.blockservice.host}/contracts/${name}`)
            .then(res => res.json())
            .then(data => data[name])
        let isStart =  data['vote_state']['started'] && new Date().getTime() <= utils.decodePythonTime(data['vote_state']['started'], "time") + 7 * 24 * 60 * 60 * 1000
        let motion = {
            policy: name,
            name: isStart? "Upgrade" : "No Motion",
            desc: isStart? `Click the links below to view the update. 
            <p><a target="_blank" class="text-link" href="https://github.com/Lamden/lamden/tree/${data['vote_state']['lamden_tag']}">https://github.com/Lamden/lamden/tree/${data['vote_state']['lamden_tag']}</a></p>
            <p><a class="text-link" target="_blank" href="https://github.com/Lamden/contracting/tree/${data['vote_state']['contracting_tag']}">https://github.com/Lamden/contracting/tree/${data['vote_state']['contracting_tag']}</a></p>` : null,
            yays: data['vote_state'].yays ? data['vote_state'].yays : 0,
            nays: data['vote_state'].nays ? data['vote_state'].nays : 0,
            positions: []
        }

        if (isStart) {
            motion.status = 1
        } else {
            motion.status = 0
        }

        if (!data['vote_state'].positions) data['vote_state'].positions = []

        for (const m of allMemberNodes) {
            let isNodeOwner = memberNodes.findIndex(n => n.vk === m.vk) > -1
            if (data['vote_state'].positions[m.vk] === true) {
                motion.positions.push({vk: m.vk, value: 2, isNodeOwner})
            } else {
                motion.positions.push({vk: m.vk, value: 0, isNodeOwner})
            }
        }

        motions.push(motion)
        motions = motions
    }

    const getStatics = async () => {
        let res1 = await $currentNetwork.getVariable("currency", "balances", "con_dao")
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