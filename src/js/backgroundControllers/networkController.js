import { LamdenBlockexplorer_API } from '../blockExplorer_API.js'
import whitelabel from '../../../whitelabel.json'

let lamdenNetworks = whitelabel.networks

export const networkController = (utils) => {
    const LamdenNetworkTypes = ['mainnet','testnet', 'devnet']

    const getNetworksStore = async () => {
        let res = await chrome.storage.local.get({"networks":{}})
        return res.networks
    }

    const networkKey = (networkObj) => {
        return `${networkObj.name}|${networkObj.type}|${networkObj.lamden ? 'lamden': 'user'}`
    }

    const addNetworkKey = (networkObj) => {
        networkObj.networkKey = networkKey(networkObj)
        return networkObj
    }

    const addBlockexplorer = (networkObj) => {
        if (networkObj.blockExplorer){
            networkObj.blockExplorer_API = new LamdenBlockexplorer_API(`${networkObj.blockExplorer}/api`)
        }
    }

    const addExtras = (networkObj) => {
        addNetworkKey(networkObj)
        addBlockexplorer(networkObj)
        return networkObj
    }

    const getAll = async () => {
        let networksStore = await getNetworksStore()
        if (!Array.isArray(networksStore.user)) networksStore.user = []
        return [...networksStore.user, ...networksStore.lamden]
    }

    const getCurrent = async () => {
        let networksStore = await getNetworksStore()
        const networks = [...networksStore.lamden, ...networksStore.user]
        const foundNetwork = networks.find(network => networksStore.current === networkKey(network))
        return addExtras(new utils.Lamden.Network(foundNetwork))
    }

    const getNetwork = (networkInfo) => {
        let network = new utils.Lamden.Network(networkInfo)
        return addExtras(network)
    } 

    const getLamdenNetwork = async (networkType, networkName="legacy") => {
        let networksStore = await getNetworksStore()
        const foundNetwork = networksStore.lamden.find(network => network.type === networkType.toLowerCase() && networkName === network.networkName)
        if (!foundNetwork) return false;
        return addExtras(new utils.Lamden.Network(foundNetwork))
    }

    const isAcceptedNetwork = (networkType) => {
        return LamdenNetworkTypes.includes(networkType)
    }

    const contractExists = async (networkType, contractName, networkName = "legacy") => {
        const networkInfo = await getLamdenNetwork(networkType, networkName)
        if (!networkInfo) return false;
        const network = new utils.Lamden.Network(networkInfo)
        let res = await network.contractExists(contractName)
        return res
    }

    const purgeNetworksStorage = async () => {
        let networksStore = await getNetworksStore();
        networksStore.lamden = lamdenNetworks;
        await chrome.storage.local.set({"networks": networksStore});
    }

    return {
        purgeNetworksStorage,
        getAll,
        getCurrent,
        getNetwork,
        getLamdenNetwork,
        isAcceptedNetwork,
        contractExists: (networkType, contractName, version = 1) => contractExists(networkType, contractName, version),
        LamdenNetworkTypes
    }
}