export const balancesController = (utils) => {
    let balancesStore = {};
    let updatingBalances = {status: "waiting", time: new Date()};

    chrome.storage.local.get({"balances":{}},function(getValue) {balancesStore = getValue.balances;})
    chrome.storage.onChanged.addListener(function(changes) {
        for (let key in changes) {
            if (key === 'balances') {
                balancesStore = changes[key].newValue;
            }
        }
    });

    chrome.runtime.onInstalled.addListener(function(details) {
        if (details.reason === "update") clearAllNetworks()
    });

    const updateOne = (account, network) => {
        if (updatingBalances.status === "waiting"){
            updatingBalances = {status: "updating", time: new Date()};
            getUpdate(account, network)
            .then((res) => {
                if (res){
                    chrome.storage.local.set({"balances": balancesStore}, () =>{
                        updatingBalances.status = "waiting";
                    });
                }else{
                    updatingBalances.status = "waiting";
                }
            })
            .catch(() => updatingBalances.status = "waiting")
        }
    }

    const updateAll = (accountsList, network) => {
        let keysToGet =  accountsList.map(account => {
            return{
                contractName: 'currency',
                variableName: "balances",
                key: account.vk
            }
        })
        network.blockExplorer_API.getKeys(keysToGet).then(res => {
            let newBalances = processBalances(res, accountsList, network)
            let netKey = network.networkKey
            balancesStore[netKey] = newBalances
            setStore(balancesStore)
        })
    }

    const processBalances = (balances, accountList) => {
        let newBalancesObj = {}
        balances.map(balance => {
            let vk = balance.key.split(":")[1]
            let amount = utils.getValueFromReturn(balance.value)
            let account = accountList.find(account => account.vk === vk)

            newBalancesObj[vk] =  {
                'balance': amount || "0.0",
                watchOnly: account.sk === "watchOnly"
            }
        })
        return newBalancesObj;
    }

    const getUpdate = async (account, network) => {
        const vk = account.vk;
        const watchOnly = account.sk === "watchOnly"
        let newBalance = await network.API.getCurrencyBalance(vk).then(res => utils.removeTrailingZeros(res.toFixed(8)))   
        let netKey = network.networkKey
        if (!balancesStore[netKey]) balancesStore[netKey] = {}
        if (!balancesStore[netKey][vk]){
            balancesStore[netKey][vk] = {}
            balancesStore[netKey][vk].balance = newBalance
            balancesStore[netKey][vk].watchOnly = watchOnly
            return true;
        }else{
            const currentBalance = balancesStore[netKey][vk].balance
            if (currentBalance !== newBalance){
                balancesStore[netKey][vk].balance = newBalance
                balancesStore[netKey][vk].watchOnly = watchOnly
                return true;
            }
            if (balancesStore[netKey][vk].watchOnly !== watchOnly){
                balancesStore[netKey][vk].watchOnly = watchOnly
                return true;
            }
        }
        return false
    }

    const setStore = (newValue) => {
        if (updatingBalances === "updating") setTimeout(setStore, 100)
        else{
            updatingBalances = {status: "updating", time: new Date()};
            chrome.storage.local.set({"balances": newValue}, () =>{
                updatingBalances.status = "waiting";
            });
        }
    }

    const clearNetwork = (network) => {
        let netKey = network.networkKey
        balancesStore[netKey] = {}
        setStore(balancesStore);
    }

    const clearAllNetworks = () => {
        setStore({});
    }

    const getBalance = (vk, networkKey) => {
        if (!balancesStore[networkKey]) return '0'
        if (!balancesStore[networkKey][vk]) return '0'
        if (!balancesStore[networkKey][vk].balance) return '0'
        return  balancesStore[networkKey][vk].balance
    }

    const addBalances = (accounts, networkKey) => {
        accounts.forEach(account => account.balance = getBalance(account.vk, networkKey))
        return accounts
    }

    setInterval(() => {
        if (updatingBalances.status === "updating" && new Date() - updatingBalances.time > 5) {
            updatingBalances.status = "waiting"
        }
    }, 5000)
    return {
        updateAll,
        updateOne,
        clearAllNetworks,
        clearNetwork,
        addBalances
    }
}