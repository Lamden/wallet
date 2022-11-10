export const nodesController = (utils) => {
    let nodesStore = [];

    chrome.storage.local.get({
        "nodes": [],
    },
    function(getValue) {
        nodesStore = getValue.nodes;
    })
    chrome.storage.onChanged.addListener(function(changes) {
        for (let key in changes) {
            if (key === 'nodes') nodesStore = changes[key].newValue;
        }
    });

    const updateNodes = async () => {
        let network = utils.networks.getCurrent()
        let netKey = network.networkKey
        // clear old data 
        nodesStore.filter(t => t.netKey !== netKey || t.status === 'unregister')

        // get nodes
        let res = await network.getVariable('masternodes', 'S', 'members')
        let nodes = res.value ? res.value : []
        nodes.forEach(node => {
            let index = nodesStore.findIndex(item => node === item.vk)
            if (index === -1) {
                nodesStore.push({
                    vk: node,
                    status: "node",
                    type: 'masternode',
                    netKey: netKey
                })
            } 
        })
        // get candidates
        let res2 = await fetch(`${network.blockservice.host}/contracts/elect_masternodes`)
            .then(res => res.json())
            .then(data => data.elect_masternodes)
        if (res2.candidate_state && res2.candidate_state.registered) {
            for (const [key, value] of Object.entries(res2.candidate_state.registered)) {
                if (value) {
                    let index = nodesStore.findIndex(item => key === item.vk)
                    if (index === -1) {
                        nodesStore.push({
                            vk: key,
                            status: "candidate",
                            type: 'masternode',
                            netKey: netKey
                        })
                    } 
                }
            }
        }
        chrome.storage.local.set({"nodes": nodesStore});
    }

    const addUnregisterNode = (vk, callback = undefined) => {
        let index = nodesStore.findIndex(item => vk === item.vk)
        if (index > -1) {
            if (callback) callback({success: false, msg: "Node Already exists"})
            return;
        }

        let network = utils.networks.getCurrent()
        let netKey = network.networkKey
        nodesStore.push({
            vk: vk,
            status: "unregister",
            type: 'masternode',
            netKey: netKey
        })
        chrome.storage.local.set({"nodes": nodesStore});
        if (callback) callback({success: true, msg: "Success Added"})
    }

    return {
        updateNodes,
        addUnregisterNode
    }
}