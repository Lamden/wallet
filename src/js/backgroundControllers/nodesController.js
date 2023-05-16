export const nodesController =  (utils) => {

    const getNodesStore = async () => {
       let res = await chrome.storage.local.get({"nodes": []})
       return res && Array.isArray(res.nodes) ? res.nodes : [] 
    }

    const updateNodes = async () => {
        let nodesStore = await getNodesStore()
        let network = await utils.networks.getCurrent()
        let netKey = network.networkKey
        // clear old data 
        nodesStore = nodesStore.filter(t => t.netKey !== netKey || t.status === 'unregister')

        // get candidates
        let res2 = await fetch(`${network.blockservice.host}/contracts/elect_masternodes`)
        .then(res => res.json())
        .then(data => data.elect_masternodes)
            if (res2 && res2.candidate_state && res2.candidate_state.registered) {
                for (const [key, value] of Object.entries(res2.candidate_state.registered)) {
                    if (value) {
                        let index = nodesStore.findIndex(item => key === item.vk && item.netKey === netKey)
                        if (index === -1) {
                            nodesStore.push({
                                vk: key,
                                status: "candidate",
                                type: 'masternode',
                                netKey: netKey
                            })
                        }  else {
                            nodesStore[index].status = "candidate"
                        }
                    }
                }
            }

        // get nodes
        let res = await network.getVariable('masternodes', 'S', 'members')
        let nodes = res.value ? res.value : []
        nodes.forEach(node => {
            let index = nodesStore.findIndex(item => node === item.vk && item.netKey === netKey)
            if (index === -1) {
                nodesStore.push({
                    vk: node,
                    status: "node",
                    type: 'masternode',
                    netKey: netKey
                })
            } else {
                nodesStore[index].status = "node"
            }
        })
        await chrome.storage.local.set({"nodes": nodesStore});
    }

    const addUnregisterNode = async (vk, callback = undefined) => {
        let nodesStore = await getNodesStore()
        let network = await utils.networks.getCurrent()
        let netKey = network.networkKey

        let index = nodesStore.findIndex(item => vk === item.vk && item.netKey === netKey)
        if (index > -1) {
            if (callback) callback({success: false, msg: "Node Already exists"})
            return;
        }
        nodesStore.push({
            vk: vk,
            status: "unregister",
            type: 'masternode',
            netKey: netKey
        })
        await chrome.storage.local.set({"nodes": nodesStore});
        if (callback) callback({success: true, msg: "Success Added"})
    }

    return {
        updateNodes,
        addUnregisterNode
    }
}