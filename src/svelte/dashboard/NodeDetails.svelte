<script>
    import { onMount} from 'svelte';

    import LineChart from './LineChart.svelte';
    //Stores
    import { currentNetwork, BalancesStore, SettingsStore, networkKey, NodesStore} from "../../js/stores/stores.js";
    import {
        displayBalance,
        stringToFixed,
        formatAccountAddress,
        copyToClipboard 
    } from "../../js/utils.js";

    //Icons
    import CheckmarkIcon from "../icons/CheckmarkIcon.svelte";
    import CopyIcon from "../icons/CopyIcon.svelte";

    let copied = false
    // default 1970-1-4
    let registerTime = new Date(0)

    let totalRewards = 0
    let totalRewards24hr = 0
    let rewards7Days = []

    export let vk = ''

    $: currencySymbol = $currentNetwork.currencySymbol
    $: balance = BalancesStore.getBalance($currentNetwork, vk)
    $: balanceStr = balance ? displayBalance(stringToFixed(balance, 8)) : "0";
    $: netKey = networkKey($currentNetwork)
    $: node = $NodesStore.find(n => n.netKey === netKey && n.vk === vk)

    onMount(() => {
        getRegisterTime()
        getTotalRewards()
        getTotalRewards24hr()
        getRewards7Day()
    })

    const getRegisterTime = async () => {
        let res = await $currentNetwork.getVariable("elect_masternodes", "candidate_state", `registered:${vk}`)
        if (res.value) {
            let timeStamp = Math.floor(res.blockNum / 1000000)
            let t = new Date(timeStamp)
            registerTime = `${t.getFullYear()}-${t.getMonth() + 1}-${t.getDay()}`
        } else {
            registerTime = "Genesis"
        }
    }

    const getTotalRewards24hr = async () => {
        let stamp = new Date().getTime() - 24 * 60 * 60 * 1000
        try {
            totalRewards24hr = await fetch(`${$currentNetwork.blockservice.host}/rewards/total?recipient=${vk}&start=${stamp}`)
            .then(res => res.json())
            .then(data => data.amount)  
        } catch {
            totalRewards24hr = 0
        }
    }

    const getTotalRewards = async () => {
        try {
            totalRewards = await fetch(`${$currentNetwork.blockservice.host}/rewards/total?recipient=${vk}`)
            .then(res => res.json())
            .then(data => data.amount)  
        } catch {
            totalRewards = 0
        }
    }


    const getRewards7Day = async () => {
        try {
            let res = await fetch(`${$currentNetwork.blockservice.host}/rewards/lastdays?days=7&recipient=${vk}`)
            .then(res => res.json())
            rewards7Days =  res
        } catch {
            rewards7Days = []
        }
    }

    const handleAddressCopy = () => {
        copyToClipboard(vk);
        copied = true;
        setTimeout(() => (copied = false), 2000);
    };

</script>
<div class="node-details flex-row flex-wrap">
    <div class="card flex-col">
            <div class="card-header text-body2">
                <div class="item">
                    <div class="text-subtitle title">Balances</div>
                    <div class="text-bold">{balanceStr} {currencySymbol}</div>
                </div>
                <div class="item">
                    <div class="text-subtitle title">Total Rewards</div>
                    <div class="text-bold">{displayBalance(stringToFixed(totalRewards, 8))} {currencySymbol}</div>
                </div>
                <div class="item">
                    <div class="text-subtitle title">Rewards 24H</div>
                    <div class="text-bold">{displayBalance(stringToFixed(totalRewards24hr, 8))} {currencySymbol}</div>
                </div>
            </div>
            <div class="divider" />
            <div class="card-body text-body2">
                <div class="item flex space-between">
                    <div class="text-subtitle title no-margin">Status</div>
                    <div class:badger={true} class={node.status === "node"? "badger-node" : node.status === "candidate" ? "badger-register" : "badger-unregister"}>{node.status === "node" ? "Node Member" : node.status}</div>
                </div>
                <div class="item flex space-between">
                    <div class="text-subtitle title no-margin">Register Time</div>
                    <div class="text-bold">{registerTime}</div>
                </div>
                <div class="item address-item">
                    <div class="text-subtitle title">Address</div>
                    <div class="address ellipsis" on:click={handleAddressCopy}>
                        {#if !copied}
                            <CopyIcon width="12px" color="var(--color-white)" margin="0 10px 0 0" />
                        {:else}
                            <CheckmarkIcon width="12px" color="var(--success-color)" margin="0 10px 0 0" />
                        {/if}
                        {vk}
                    </div>
                </div>
            </div>
    </div>
    <div class="chart flex-grow-1">
        <LineChart data = {rewards7Days} />
    </div>
 </div>
  
  <style>
    .node-details{
        margin-top: 1rem;
    }
    .chart {
        background-color: var(--secondary-color);
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 36px;
    }
    .space-between {
        justify-content: space-between;
    }

    .badger {
        border-radius: 10px;
        padding: 0 8px;
        line-height: 20px;
    }

    .badger-node {
        background-color: var(--success-color);
    }

    .badger-register {
        background-color: var(--warning-color);
    }

    .badger-unregister {
        background-color: var(--error-color);
    }

    .card {
        width: 250px;
        background: var(--secondary-color);
        box-shadow: var(--box-shadow-2);
        border-radius: 8px;
        margin-right: 36px;
        margin-bottom: 36px;
    }

    .card-header {
        padding: 16px;
    }

    .no-margin {
        margin: 0!important;
    }

    .card-body {
        padding: 16px;
    }

    .item {
        padding: 8px 0;
        color: var(--font-primary-inverse);
    }

    .item > .address:hover {
        text-decoration: underline;
        cursor: pointer;
    }

    .address-item{
        width: 100%;
    }

    .title {
        margin-bottom: 6px;
        color: var(--font-primary-dim);
    }

    .divider {
        background: var(--overlay-color);
        height: 1px;
    }
    @media screen and (max-width: 830px) {
        .card {
            width: unset;
            flex-grow: 1;
            margin-right: 0;
        }
        .address-item{
            width: 250px;
        }
    }
  </style>
  