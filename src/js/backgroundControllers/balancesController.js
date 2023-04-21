export const balancesController = (utils) => {
    
    chrome.runtime.onInstalled.addListener(function(details) {
        if (details.reason === "update") clearAllNetworks()
    });

    const getBalanceStore = async () => {
        let res = await chrome.storage.local.get({"balances":{}})
        return res.balances
    }

    const updateOne = (account, network) => {
        getUpdate(account, network)
        .catch((e) => console.log(e))
    }

    const updateAll = async (accountsList, network) => {
        let balancesStore = await getBalanceStore()
        let keysToGet =  accountsList.map(account => {
            return{
                contractName: 'currency',
                variableName: "balances",
                key: account.vk
            }
        })
        if (network.blockservice.host) {
            await network.blockservice.getCurrentKeysValues(keysToGet).then(balances => {
                if (balances.length > 0){
                    let newBalances = processBalances(balances, accountsList)
                    let netKey = network.networkKey
                    balancesStore[netKey] = newBalances
                    setStore(balancesStore)
                }
            })
        } else {
            let res = keysToGet.map(item => network.getVariable('currency', 'balances', item.key).then(res => {
                res.key = item.key
                return res
            }))
            Promise.all(res).then(balances => {
                if (balances.length > 0){
                    let newBalances = processBalances(balances, accountsList)
                    let netKey = network.networkKey
                    balancesStore[netKey] = newBalances
                    setStore(balancesStore)
                }
            })
        }
    }

    const processBalance = (balance, account) => {
        let amount = utils.getValueFromReturn(balance.value)
        return  {
            'balance': amount || "0.0",
            watchOnly: account.sk === "watchOnly"
        }
    }

    const processBalances = (balances, accountList) => {
        let newBalancesObj = {}
        balances.map(balance => {
            let vk = balance.key
            let accountInfo = accountList.find(account => account.vk === vk)
            newBalancesObj[vk] = processBalance(balance, accountInfo)
        })
        return newBalancesObj;
    }

    // const processBalanceSocketUpdate = (update) => {
    //     if (actions.walletIsLocked()) return
    //     if (!update) return

    //     update = JSON.parse(update)

    //     const { message, room } = update
    //     if (!message) return

    //     const { key, value, keys } = message
    //     if (key && value && room ){
    //         if (!utils.isLamdenKey(key)) return
    //         if (keys.length !== 1) return
    //         if (room !== `currency.balances:${key}`) return

    //         try{
    //             let network = utils.networks.getCurrent()
    //             let netKey = network.networkKey

    //             let newValue = utils.getValueFromReturn(value)
    //             if (!newValue) newValue = "0"

    //             if (!balancesStore[netKey]) balancesStore[netKey] = {}
                
    //             balancesStore[netKey][key] = {
    //                 'balance': newValue,
    //                 watchOnly: actions.isWatchOnly(key)
    //             }
    //             setStore(balancesStore)
    //         }catch(e){
    //             console.log(e)
    //         }
    //     }
    // }

    const getUpdate = async (account, network) => {
        let balancesStore = await getBalanceStore()
        let vk = account.vk
        let balance = await network.getVariable('currency', 'balances', vk)
            .then(res => {
                if (!res) return {value : "0"}
                if (res.notFound) return {value : "0"}
                return res
            })

        let newBalanceInfo = processBalance(balance, account)
        let netKey = network.networkKey

        if (!balancesStore[netKey]) balancesStore[netKey] = {}
        if (!balancesStore[netKey][vk]){
            balancesStore[netKey][vk] = {}
            balancesStore[netKey][vk] = newBalanceInfo
            await setStore(balancesStore)
            return true;
        }else{
            const currentBalance = balancesStore[netKey][vk].balance
            const newBalance = newBalanceInfo.balance
            if (currentBalance !== newBalance){
                balancesStore[netKey][vk].balance = newBalance
            }
            if (balancesStore[netKey][vk].watchOnly !== newBalanceInfo.watchOnly){
                balancesStore[netKey][vk].watchOnly = newBalanceInfo.watchOnly
            }
            await setStore(balancesStore)
            return true;
        }
    }

    const setStore = async (newValue) => {
        await chrome.storage.local.set({"balances": newValue});
    }

    const clearNetwork = async (network) => {
        let balancesStore = await getBalanceStore()
        let netKey = network.networkKey
        balancesStore[netKey] = {}
        await setStore(balancesStore);
    }

    const clearAllNetworks = async () => {
        await setStore({});
    }

    const deleteOneBalance = async (vk) => {
        let balancesStore = await getBalanceStore()
        Object.keys(balancesStore).map(networkKey => {
            delete balancesStore[networkKey][vk]
        })
        await setStore(balancesStore)
        return true
    }

    return {
        updateAll,
        updateOne,
        clearAllNetworks,
        clearNetwork,
        deleteOneBalance
    }
}