import { writable, get, derived} from 'svelte/store';
import policy from '../../../policy.json';
import { currentNetwork, NodesStore, networkKey, CoinStore } from './stores.js';
import utils from "../../js/utils"

export const createPolicyStore = () => {
    let initialized = false;
    let startValue = {};

    const getStore = () => {
        //Set the Coinstore to the value of the chome.storage.local
        chrome.storage.local.get({"policy": startValue}, function(getValue) {
            initialized = true;
            PolicyStore.set(getValue.events)
        });
    }

    //Create Intial Store
    const PolicyStore = writable(startValue);

    chrome.storage.onChanged.addListener(function(changes) {
        for (let key in changes) {
            if (key === 'policy') {
                PolicyStore.set(changes[key].newValue)
            }
        }
    });

    //Get the value of the event Store from chome.storage.local
    getStore()

    let subscribe = PolicyStore.subscribe;
    let update = PolicyStore.update;
    let set = PolicyStore.set;

    return {
        subscribe,
        set,
        update,
        updatePolicy: (data) => {
            PolicyStore.update(policyStore => {
                const netKey = networkKey(get(currentNetwork))

                if (!policyStore) policyStore = {}
                if (!policyStore[netKey]) policyStore[netKey] = []
                // check if the policy name is correct
                if (!policy[data.policy]) return;

                let index = policyStore[netKey].findIndex(x => x.policy === data.policy);
                if (index === -1) {
                    policyStore[netKey].push(data)
                } else {
                    policyStore[netKey][index] = data;
                }
                chrome.storage.local.set({"policy": policyStore});
                return policyStore;
            }) 
        }
    };
}

//Event Stores
export const PolicyStore = createPolicyStore();


export const freshPolicy = (policy) => {
    if (policy === "all") {
        getRewardsMotion()
        getStampCostMotion()
        getCurrentMasterNodeMotion()
        getCurrentDaoMotion()
        getUpgradeMotion()
    } else if (policy === "rewards") {
        getRewardsMotion()
    } else if (policy === "stamp_cost") {
        getStampCostMotion()
    } else if (policy === "masternodes") {
        getCurrentMasterNodeMotion()
    } else if (policy === "dao") {
        getCurrentDaoMotion()
    } else if (policy === "upgrade") {
        getUpgradeMotion()
    }
}

const getRewardsMotion = async () => {
    const netKey = networkKey(get(currentNetwork))

    const nodes = get(NodesStore).filter(n => n.netKey === netKey && get(CoinStore).findIndex(c => c.vk === n.vk) > -1)
    // user's nodes
    const memberNodes = nodes.filter(k => k.status === "node")
    const allMemberNodes =  get(NodesStore).filter(n => n.netKey === netKey && n.status === "node")

    let name = "rewards"
    let data = await fetch(`${get(currentNetwork).blockservice.host}/contracts/${name}`)
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

    PolicyStore.updatePolicy(motion)
}


const getStampCostMotion = async () => {

    const netKey = networkKey(get(currentNetwork))

    const nodes = get(NodesStore).filter(n => n.netKey === netKey && get(CoinStore).findIndex(c => c.vk === n.vk) > -1)
    // user's nodes
    const memberNodes = nodes.filter(k => k.status === "node")
    const allMemberNodes =  get(NodesStore).filter(n => n.netKey === netKey && n.status === "node")

    let name = "stamp_cost"
    let data = await fetch(`${get(currentNetwork).blockservice.host}/contracts/${name}`)
        .then(res => res.json())
        .then(data => data[name].S)
    
    let motion = {
        policy: name,
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

    let data2 = await fetch(`${get(currentNetwork).blockservice.host}/rootkey_history?contract=stamp_cost&variable=S&root_key=value`)
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
        Current Stamp Ratio: ${data.value} Stamps/${get(currentNetwork).currencySymbol}
        <p class="text-secondary">${changedTime}</p>
    `

    PolicyStore.updatePolicy(motion)
}


const getCurrentMasterNodeMotion = async () => {
    const netKey = networkKey(get(currentNetwork))

    const nodes = get(NodesStore).filter(n => n.netKey === netKey && get(CoinStore).findIndex(c => c.vk === n.vk) > -1)
    // user's nodes
    const memberNodes = nodes.filter(k => k.status === "node")
    const allMemberNodes =  get(NodesStore).filter(n => n.netKey === netKey && n.status === "node")
    let name = "masternodes"
    let data = await fetch(`${get(currentNetwork).blockservice.host}/contracts/${name}`)
        .then(res => res.json())
        .then(data => data[name].S)
    let motion = {
        policy: name,
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

    PolicyStore.updatePolicy(motion)
}

const getCurrentDaoMotion = async () => {
    const netKey = networkKey(get(currentNetwork))

    const nodes = get(NodesStore).filter(n => n.netKey === netKey && get(CoinStore).findIndex(c => c.vk === n.vk) > -1)
    // user's nodes
    const memberNodes = nodes.filter(k => k.status === "node")
    const allMemberNodes =  get(NodesStore).filter(n => n.netKey === netKey && n.status === "node")

    let name = "dao"
    let data = await fetch(`${get(currentNetwork).blockservice.host}/contracts/${name}`)
        .then(res => res.json())
        .then(data => data[name].S)
    let amount = data.amount ? data.amount.__fixed__? data.amount.__fixed__ : data.amount : 0
    let isStart = utils.decodePythonTime(data.motion_start, "time") + utils.decodePythonTime(data.motion_period, "delta") > new Date().getTime()
    let motion = {
        policy: name,
        name: isStart? "Dao" : "No Motion",
        desc: isStart? `${data.recipient_vk} will get ${amount} ${get(currentNetwork).currencySymbol}s ` : null,
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

    PolicyStore.updatePolicy(motion)
}

const getUpgradeMotion = async () => {
    const netKey = networkKey(get(currentNetwork))

    const nodes = get(NodesStore).filter(n => n.netKey === netKey && get(CoinStore).findIndex(c => c.vk === n.vk) > -1)
    // user's nodes
    const memberNodes = nodes.filter(k => k.status === "node")
    const allMemberNodes =  get(NodesStore).filter(n => n.netKey === netKey && n.status === "node")

    let name = "upgrade"
    let data = await fetch(`${get(currentNetwork).blockservice.host}/contracts/${name}`)
        .then(res => res.json())
        .then(data => data[name])
    let isStart =  data['vote_state']['started'] && new Date().getTime() <= utils.decodePythonTime(data['vote_state']['started'], "time") + 7 * 24 * 60 * 60 * 1000
    let motion = {
        policy: name,
        name: isStart? "Upgrade" : "No Motion",
        desc: isStart? `Click the links below to view the current update. 
        <p><a target="_blank" class="text-link" href="https://github.com/Lamden/lamden/tree/${data['vote_state']['lamden_tag']}">Current Lamden Code</a></p>
        <p><a class="text-link" target="_blank" href="https://github.com/Lamden/contracting/tree/${data['vote_state']['contracting_tag']}">Current Contracting Code</a></p>` : null,
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

    PolicyStore.updatePolicy(motion)
}