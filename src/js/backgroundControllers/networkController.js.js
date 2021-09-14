import { LamdenBlockexplorer_API } from '../blockExplorer_API.js'

export const networkController = (utils, services) => {
    let networksStore = {};
    const LamdenNetworkTypes = ['mainnet','testnet']
    const blockserviceIPs = {
        mainnet: 'http://165.22.47.195',
        testnet: 'http://165.227.181.34'
        // testnet: 'http://localhost'
    }

    chrome.storage.local.get({"networks":{}},function(getValue) {networksStore = getValue.networks;})
    chrome.storage.onChanged.addListener(function(changes) {
        for (let key in changes) {
            if (key === 'networks') networksStore = changes[key].newValue;
        }
    });

    const networkKey = (networkObj) => {
        return `${networkObj.name}|${networkObj.type}|${networkObj.lamden ? 'lamden': 'user'}`
    }

    const addNetworkKey = (networkObj) => {
        networkObj.networkKey = networkKey(networkObj)
        return networkObj
    }

    const addBlockexplorer = (networkObj) => {
        networkObj.blockExplorer_API = new LamdenBlockexplorer_API(`${networkObj.blockExplorer}/api`)
    }

    const addBlockservice = (networkObj) => {
        if (networkObj.type === 'mainnet'){
            networkObj.blockservice_API = services.blockservice.getBlockservice(blockserviceIPs['mainnet'], 3535)
        }
        if (networkObj.type === 'testnet') {
            networkObj.blockservice_API = services.blockservice.getBlockservice(blockserviceIPs['testnet'], 3535)
        }
    }

    const addExtras = (networkObj) => {
        addNetworkKey(networkObj)
        addBlockexplorer(networkObj)
        addBlockservice(networkObj)
        return networkObj
    }

    const getAll = () => {
        return [...networksStore.user, ...networksStore.lamden]
    }

    const getCurrent = () => {
        const networks = [...networksStore.lamden, ...networksStore.user]
        const foundNetwork = networks.find(network => networksStore.current === networkKey(network))
        return addExtras(new utils.Lamden.Network(foundNetwork))
    }

    const getNetwork = (networkInfo) => {
        let network = new utils.Lamden.Network(networkInfo)
        return addNetworkKey(network)
    }

    const getLamdenNetwork = (networkType) => {
        const foundNetwork = networksStore.lamden.find(network => network.type === networkType.toLowerCase())
        if (!foundNetwork) return false;
        return addExtras(new utils.Lamden.Network(foundNetwork))
    }

    const isAcceptedNetwork = (networkType) => {
        return LamdenNetworkTypes.includes(networkType)
    }

    const contractExists = (networkType, contractName) => {
        const networkInfo = getLamdenNetwork(networkType)
        if (!networkInfo) return false;
        const network = new utils.Lamden.Network(networkInfo)
        return network.API.contractExists(contractName)
    }
    return {
        getAll,
        getCurrent,
        getNetwork,
        getLamdenNetwork,
        isAcceptedNetwork,
        contractExists: (networkType, contractName) => contractExists(networkType, contractName),
        LamdenNetworkTypes
    }
}