export const tokenController = (utils, services, actions) => {
    let tokens = {};
    let token_balances = {};

    chrome.runtime.onSuspend.addListener(removeSocketListeners)
    chrome.runtime.onSuspendCanceled.addListener(addSocketListeners)
    addSocketListeners()


    services.socketService.testnet_socket_on('new-state-changes-one', (update) => processTokenBalanceSocketUpdate(update, 'testnet'))
    services.socketService.mainnet_socket_on('new-state-changes-one', (update) => processTokenBalanceSocketUpdate(update, 'mainnet'))

    const LST002_RS_TOKEN_METADATA = [
        'token_name',
        'token_symbol',
        'token_logo_url',
        'token_logo_base64_svg',
        'token_logo_base64_png'
    ]

    chrome.storage.local.get({
        "tokens": {}, 
        "token_balances": {}
    },
    function(getValue) {
        tokens = getValue.tokens;
        token_balances = getValue.token_balances;
    })
    chrome.storage.onChanged.addListener(function(changes) {
        for (let key in changes) {
            if (key === 'tokens') tokens = changes[key].newValue;
            if (key === "token_balances") token_balances = changes[key].newValue;
        }
    });

    function addSocketListeners() {
        services.socketService.testnet_socket_on('new-state-changes-one', (update) => processTokenBalanceSocketUpdate(update, 'testnet'))
        services.socketService.mainnet_socket_on('new-state-changes-one', (update) => processTokenBalanceSocketUpdate(update, 'mainnet'))
        if (!actions.walletIsLocked()) joinAllTokenSockets()
    }

    function removeSocketListeners() {
        services.socketService.testnet_socket_off('new-state-changes-one')
        services.socketService.mainnet_socket_off('new-state-changes-one')
        leaveAllTokenSockets()
    }

    const validateTokenContract = async (contractName, callback = undefined) => {
        let contractInfo = await getContractInfo(contractName)
        if (!contractInfo) {
            if (callback) callback(false)
            return false
        }
        if (!enforce_LST001_methods(contractInfo.methods)) {
            if (callback) callback(false)
            return false
        }
        /* // Removed as requirement
         if (!tokenVariablesAreValid(contractInfo.variables)) {
            if (callback) callback(false)
            return false
        }
        */
        if (!enforce_LST001_hashes(contractInfo.hashes)) {
            if (callback) callback(false)
            return false
        }
        if (callback) callback(true)
        return true
    }

    const enforce_LST001_methods = (contractMethods) => {
        const requiredMethods = {
            "transfer": {
                "amount": "float",
                "to": "str"
            },
            "approve":{
                "amount": "float",
                "to": "str"
            },
            "transfer_from":{
                "amount": "float",
                "to": "str",
                "main_account": "str"
            }
        }

        let validateMethods = Object.keys(requiredMethods).map(methodName => {
            let validMethod = requiredMethods[methodName]
            // Make sure the required method is in the contract
            let contractMethod = contractMethods.find(method => method.name === methodName)
            if (!contractMethod) return false
            
            //Make sure the method has the required number of arguments
            if (Object.keys(contractMethod.arguments).length !== Object.keys(validMethod).length) return false

            //Make sure the methods arguments are named correctly and of the correct type
            let checkArgNames = Object.keys(validMethod).map(validArgName => {
                //Check to see if the required Argument NAME is in the contract
                let foundArg = contractMethod.arguments.find(arg => arg.name === validArgName)
                if (!foundArg) return false

                //Check that the argument is of the correct TYPE
                if (foundArg.type !== validMethod[validArgName]) return false
                return true
            })
            if (!checkArgNames.every((val) => val === true)) return false
			return true
        })
        return validateMethods.every((val) => val === true)
    }
/*
    // Removed as requirement

    const tokenVariablesAreValid = (contractVariables) => {
        const requiredVariables = ["token_name", "token_symbol"]
        let validateVariables = requiredVariables.map(variableName => contractVariables.includes(variableName))
        return validateVariables.every((val) => val === true)

    }
*/
    const enforce_LST001_hashes = (contractHashes) => {
        const requiredHashes = ["balances"]
        let validateHashes = requiredHashes.map(hashName => contractHashes.includes(hashName))
        return validateHashes.every((val) => val === true)
    }

    const getContractInfo = async (contractName) => {
        let network = utils.networks.getCurrent()
        let contractInfo = await network.API.getContractInfo(contractName)
        if (!contractInfo) return false
        if (contractInfo.error) return false
        let contractDetails = await Promise.all([
            await network.API.getContractVariables(contractName),
            await network.API.getContractMethods(contractName)
        ])
        return Object.assign(contractInfo, contractDetails[0], {methods: contractDetails[1]})
    }

    const getTokenMeta = async (contractName, callback = undefined) => {
        let contractInfo = await getContractInfo(contractName)
        if (!contractInfo.hashes.includes("metadata")) {
            if (callback) callback(false)
            return false
        }

        let metaKeys = LST002_RS_TOKEN_METADATA.map(metaItem => {
            return{
                contractName: contractName,
                variableName: "metadata",
                key: metaItem
            }
        })
        let tokenMeta = await getTokenMetaValues(metaKeys)
        let meta = {}
        tokenMeta.map(metaItem => {
            let metaItemKey = metaItem.key.split(":")[1]
            if (metaItemKey === "token_name") metaItemKey = "tokenName"
            if (metaItemKey === "token_symbol") metaItemKey = "tokenSymbol"
            if (metaItemKey === "token_logo_base64_svg") metaItemKey = "logo_base64_svg"
            if (metaItemKey === "token_logo_base64_png") metaItemKey = "logo_base64_png"
            if (metaItemKey === "token_logo_url") metaItemKey = "logo_url"
            meta[metaItemKey] = metaItem.value
        })
        if (callback) callback(meta)
        return meta
    }

    const getTokenMetaValues = async (metaKeys) => {
        let network = utils.networks.getCurrent()
        let res = await network.blockExplorer_API.getKeys(metaKeys)
        return res
    }

    const tokenExists = (contractName, callback = undefined) => {
        let network = utils.networks.getCurrent()
        let exists = true;
        if (!tokens[network.networkKey]) exists = false;
        else{
            if (!tokens[network.networkKey].find(token => token.contractName === contractName)) exists = false;
        }
        if (callback) callback(exists)
        return exists
    }

    const addToken = async (tokenInfo, callback = undefined) => {
        let network = utils.networks.getCurrent()
        let validatedContractInfo = await validateTokenContract(tokenInfo.contractName)
        if (!validatedContractInfo){
            if (callback) callback(false)
            return false
        }
        if (!tokens[network.networkKey]) tokens[network.networkKey] = []
        tokens[network.networkKey].push(tokenInfo)
        saveTokensToStorage()
        if (callback) callback(true)
        return true
    }

    const updateToken = async (tokenInfo, callback = undefined) => {
        let network = utils.networks.getCurrent()
        tokens[network.networkKey] = tokens[network.networkKey].map((token) => {
            if (token.contractName === tokenInfo.contractName) return tokenInfo
            return token
        })
        saveTokensToStorage()
        if (callback) callback(true)
        return true
    }

    const deleteTokenOne = async (tokenInfo, callback = undefined) => {
        let network = utils.networks.getCurrent()
        const before = tokens[network.networkKey].length
        tokens[network.networkKey].forEach((token, index) => {
            if (token.contractName === tokenInfo.contractName) tokens[network.networkKey].splice(index, 1);
        })
        if (tokens[network.networkKey].length < before){  
            saveTokensToStorage();
            if (callback) callback(true)
            return true
        }else{
            if (callback) callback(false)
            return false
        }
    }

    const deleteTokenAll = async (callback = undefined) => {
        let network = utils.networks.getCurrent()
        tokens[network.networkKey] = []
        saveTokensToStorage();
        if (callback) callback(true)
        return true
    }

    const joinAllTokenSockets = (accountsList) => {
        let network = utils.networks.getCurrent()
        let netKey = network.networkKey

        accountsList.map(account => {
            tokens[netKey].map(token => {
                services.socketService.joinTokenBalanceFeed(token.contractName, account.vk, network.type)
            })
        })
    }

    const leaveAllTokenSockets = (accountsList) => {
        let network = utils.networks.getCurrent()
        let netKey = network.networkKey

        accountsList.map(account => {
            tokens[netKey].map(token => {
                services.socketService.leaveTokenBalanceFeed(token.contractName, account.vk, network.type)
            })
        })
    }

    const refreshTokenBalances = async (callback = undefined) => {
        let keysToGet = [] 
        let accounts = actions.getSanatizedAccounts()
        let network = utils.networks.getCurrent()
        let netKey = network.networkKey

        if (!tokens[netKey]) return;
        if (tokens[netKey].length === 0) return;

        accounts.map(account => {
            tokens[netKey].map(token => {
                keysToGet.push({
                    contractName: token.contractName,
                    variableName: "balances",
                    key: account.vk
                })
            })
        })

        await network.blockservice_API.getCurrentKeysValues(keysToGet).then(balances => {
            try{
                let newBalances = keysReturnToTokenStoreObject(balances)
                token_balances[netKey] = newBalances
                saveTokensBalancesToStorage()
            }catch(e){
                console.log(e)
            }
        })

        if (callback) callback(newBalances)
    }

    const processTokenBalanceSocketUpdate = (update, networkType) => {
        if (!update) return
        if (actions.walletIsLocked()) return

        update = JSON.parse(update)

        const { message, room } = update
        if (!message) return

        const { key, value, keys, contractName } = message

        if (key && value && room ){
            if (!utils.isLamdenKey(key)) return
            if (keys.length !== 1) return
            if (room !== `${contractName}.balances:${key}`) return

            try{
                let network = utils.networks.getLamdenNetwork(networkType)
                let netKey = network.networkKey
        
                let newValue = utils.getValueFromReturn(value)
                if (!newValue) newValue = "0"

                setTokenBalance(netKey, key, contractName, newValue)
                saveTokensBalancesToStorage()
            }catch(e){
                console.log(e)
            }
        }
    }

    const keysReturnToTokenStoreObject = (balances) => {
        let newBalances = {}
        balances.forEach(balance => {
            const { key, value, contractName } = balance
            if (!newBalances[key]) newBalances[key] = {}
            newBalances[key][contractName] = utils.getValueFromReturn(value)
        })
        return newBalances
    }

    const setTokenBalance = (netKey, vk, tokenContractName, newValue) => {
        if (!token_balances[netKey]) token_balances[netKey] = {}
        if (!token_balances[netKey][vk]) token_balances[netKey][vk] = {}
        token_balances[netKey][vk][tokenContractName] = newValue
    }

    const reorderUp = (index, callback = undefined) => {
        if (index <= 0) {
            if (callback) callback(true)
            return true
        }
        moveArrayItemToNewIndex(index, index - 1)
        if (callback) callback(true)
    }

    const reorderDown = (index, callback = undefined) => {
        let network = utils.networks.getCurrent()
        if (!tokens[network.networkKey]){
            if (callback) callback(true)
            return true
        }
        if (index >= (tokens[network.networkKey].length - 1)) {
            if (callback) callback(true)
            return true
        }
        moveArrayItemToNewIndex(index, index + 1)
        if (callback) callback(true)
    }

    const moveArrayItemToNewIndex = (old_index, new_index) => {
        let network = utils.networks.getCurrent()
        if (!tokens[network.networkKey]) return
        if (new_index >= tokens[network.networkKey].length) {
            var k = new_index - tokens[network.networkKey].length + 1;
            while (k--) {
                tokens[network.networkKey].push(undefined);
            }
        }
        tokens[network.networkKey].splice(new_index, 0, tokens[network.networkKey].splice(old_index, 1)[0]);
        saveTokensToStorage()
    };

    const saveTokensToStorage = () => chrome.storage.local.set({"tokens": tokens});
    const saveTokensBalancesToStorage = () => chrome.storage.local.set({"token_balances": token_balances})

    return {
        addToken, updateToken, deleteTokenOne, deleteTokenAll,
        validateTokenContract,
        getTokenMeta,
        tokenExists,
        refreshTokenBalances,
        joinAllTokenSockets,
        leaveAllTokenSockets,
        reorderUp, reorderDown
    }
}