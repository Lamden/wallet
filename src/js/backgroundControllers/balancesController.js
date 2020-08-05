export const balancesController = (utils) => {
    let balancesStore = {};
    let updatingBalances = false;

    chrome.storage.local.get({"balances":{}},function(getValue) {balancesStore = getValue.balances;})
    chrome.storage.onChanged.addListener(function(changes) {
        for (let key in changes) {
            if (key === 'balances') {
                console.log(changes)
                balancesStore = changes[key].newValue;
            }
        }
    });

    const updateOne = (account, network) => {
        console.log({updatingBalances})
        if (!updatingBalances){
            updatingBalances = true;
            getUpdate(account, network)
            .then((res) => {
                console.log({res, account, network})
                if (res){
                    chrome.storage.local.set({"balances": balancesStore}, () =>{
                        updatingBalances = false;
                    });
                }else{
                    updatingBalances = false;
                }
            })
        }
    }

    const updateAll = (accountsList, network) => {
        const accountsToProcess = accountsList.length; 
        if (accountsToProcess > 0){
            let accountsProcessed = 0;
            updatingBalances = true;
            let somethingUpdated = false;
            accountsList.forEach((account) => {
                getUpdate(account, network)
                .then((updated) => {
                    if (updated) somethingUpdated = true;
                    accountsProcessed = accountsProcessed + 1
                    if (accountsProcessed >= accountsToProcess){
                        if (somethingUpdated){
                            chrome.storage.local.set({"balances": balancesStore}, () =>{
                                updatingBalances = false;
                            });
                        }
                    }
                })
            })
        }else{
            setStore(balancesStore)
        }
    }

    const getUpdate = async (account, network) => {
        const vk = account.vk;
        const watchOnly = account.sk === "watchOnly"
        let response = await network.API.getCurrencyBalance(vk)
        let newBalance = parseFloat(parseFloat(response).toFixed(8))
        let netKey = network.networkKey
        if (!balancesStore[netKey]) balancesStore[netKey] = {}
        if (!balancesStore[netKey][vk]){
            balancesStore[netKey][vk] = {}
            balancesStore[netKey][vk].balance = newBalance
            balancesStore[netKey][vk].watchOnly = watchOnly
            return true;
        }else{
            const currentBalance = parseFloat(parseFloat(balancesStore[netKey][vk].balance).toFixed(8))
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
        if (updatingBalances) setTimeout(setStore, 100)
        else{
            updatingBalances = true;
            chrome.storage.local.set({"balances": newValue}, () =>{
                updatingBalances = false;
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
        if (!balancesStore[networkKey]) return 0
        if (!balancesStore[networkKey][vk]) return 0
        if (!balancesStore[networkKey][vk].balance) return 0
        return  balancesStore[networkKey][vk].balance
    }

    const addBalances = (accounts, networkKey) => {
        accounts.forEach(account => account.balance = getBalance(account.vk, networkKey))
        return accounts
    }

    return {
        updateAll,
        updateOne,
        clearAllNetworks,
        clearNetwork,
        addBalances
    }
}