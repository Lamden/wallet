export const balancesController = (utils, services, actions) => {
    let balancesStore = {};
    let updatingBalances = {status: "waiting", time: new Date()};

    //chrome.runtime.onSuspend.addListener(removeSocketListeners)
    //chrome.runtime.onSuspendCanceled.addListener(addSocketListeners)
    //addSocketListeners()

    document.addEventListener('BlockServiceConnected', (e) => {
        addSocketListeners()
    })

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

    function addSocketListeners() {
        services.socketService.socket_on('new-state-changes-one', (update) => processBalanceSocketUpdate(update))
    }

    function removeSocketListeners() {
        services.socketService.socket_off('new-state-changes-one')
        leaveAllSockets()
    }

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

    const joinSocket = (account) => {
        services.socketService.joinCurrencyBalanceFeed(account)
        return true
    }

    const joinAllSockets = (accountsList) => {
        accountsList.forEach(account => services.socketService.joinCurrencyBalanceFeed(account.vk))
        return true
    }

    const leaveSocket = (account) => {
        services.socketService.leaveCurrencyBalanceFeed(account)
        return true
    }

    const leaveAllSockets = (accountsList) => {
        accountsList.forEach(account => services.socketService.leaveCurrencyBalanceFeed(account.vk))
        return true
    }

    const updateAll = (accountsList, network) => {
        let keysToGet =  accountsList.map(account => {
            return{
                contractName: 'currency',
                variableName: "balances",
                key: account.vk
            }
        })
        network.blockservice.getCurrentKeysValues(keysToGet).then(balances => {
            if (balances.length > 0){
                let newBalances = processBalances(balances, accountsList)
                let netKey = network.networkKey
                balancesStore[netKey] = newBalances
                setStore(balancesStore)
            }
        })
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

    const processBalanceSocketUpdate = (update) => {
        if (actions.walletIsLocked()) return
        if (!update) return

        update = JSON.parse(update)

        const { message, room } = update
        if (!message) return

        const { key, value, keys } = message
        if (key && value && room ){
            if (!utils.isLamdenKey(key)) return
            if (keys.length !== 1) return
            if (room !== `currency.balances:${key}`) return

            try{
                let network = utils.networks.getCurrent()
                let netKey = network.networkKey

                let newValue = utils.getValueFromReturn(value)
                if (!newValue) newValue = "0"

                if (!balancesStore[netKey]) balancesStore[netKey] = {}
                
                balancesStore[netKey][key] = {
                    'balance': newValue,
                    watchOnly: actions.isWatchOnly(key)
                }
                setStore(balancesStore)
            }catch(e){
                console.log(e)
            }
        }
    }

    const getUpdate = async (account, network) => {
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
            return true;
        }
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

    const deleteOneBalance = (vk) => {
        Object.keys(balancesStore).map(networkKey => {
            delete balancesStore[networkKey][vk]
        })
        setStore(balancesStore)
        return true
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
        addBalances,
        joinSocket,
        joinAllSockets,
        leaveSocket,
        leaveAllSockets,
        deleteOneBalance
    }
}