export const networkController = (LamdenJs) => {
    const Lamden = LamdenJs;
    let networksStore = {};
    const LamdenNetworkTypes = ['mainnet','testnet']

    const networkKey = (networkObj) => {
        return `${networkObj.name}|${networkObj.type}|${networkObj.lamden ? 'lamden': 'user'}`
    }

    const getAllNetworks = () => {
        return [...networksStore.user, ...networksStore.lamden]
    }

    const getCurrentNetwork = () => {
        const networks = [...networksStore.lamden, ...networksStore.user]
        const foundNetwork = networks.find(network => networksStore.current === networkKey(network))
        return new Lamden.Network(foundNetwork) 
    }

    const getNetwork = (networkInfo) => {
        return new Lamden.Network(networkInfo) 
    }

    const getLamdenNetwork = (networkType) => {
        const foundNetwork = networksStore.lamden.find(network => network.type === networkType.toLowerCase())
        if (!foundNetwork) return false;
        return foundNetwork;
    }

    const isAcceptedNetwork = (networkType) => {
        return LamdenNetworkTypes.includes(networkType)
    }

    const contractExists = (networkType, contractName) => {
        const networkInfo = getLamdenNetwork(networkType)
        if (!networkInfo) return false;
        const network = new Lamden.Network(networkInfo)
        return network.API.contractExists(contractName)
    }

    chrome.storage.local.get({"networks":{}},function(getValue) {networksStore = getValue.networks;})
    chrome.storage.onChanged.addListener(function(changes) {
        for (let key in changes) {
            if (key === 'networks') networksStore = changes[key].newValue;
        }
    });
    return {
        getAllNetworks,
        getCurrentNetwork,
        getNetwork: (networkInfo) => getNetwork(networkInfo),
        getLamdenNetwork: (networkType) => getLamdenNetwork(networkType),
        isAcceptedNetwork: (networkType) => isAcceptedNetwork(networkType),
        contractExists: (networkType, contractName) => contractExists(networkType, contractName),
        LamdenNetworkTypes
    }
}