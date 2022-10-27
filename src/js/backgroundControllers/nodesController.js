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
        nodesStore = nodesStore.filter(v => nodes.indexOf(v.vk) !== -1 || v.status === 'unregister' || v.netKey !== netKey)
        chrome.storage.local.set({"nodes": nodesStore});
    }

    return {
        updateNodes
    }
}