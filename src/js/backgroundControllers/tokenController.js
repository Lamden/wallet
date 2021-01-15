export const tokenController = (utils, actions) => {
    let tokens = {};
    let token_balances = {};

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

    const validateTokenContract = async (contractName, callback = undefined) => {
        let contractInfo = await getContractInfo(contractName)
        if (!contractInfo) {
            if (callback) callback(false)
            return false
        }
        if (!tokenMethodsAreValid(contractInfo.methods)) {
            if (callback) callback(false)
            return false
        }
        if (!tokenVariablesAreValid(contractInfo.variables)) {
            if (callback) callback(false)
            return false
        }
        if (!tokenHashesAreValid(contractInfo.hashes)) {
            if (callback) callback(false)
            return false
        }
        if (callback) callback(true)
        return true
    }

    const tokenMethodsAreValid = (contractMethods) => {
        const requiredMethods = {
            "transfer": {
                "amount": "float",
                "to": "str"
            },
            "approve":{
                "amount": "float",
                "to": "str"
            },
            "allowance": {
                "owner": "str",
                "spender": "str"
            },
            "balance_of":{
                "account":"str"
            },
            "main_balance_of":{
                "main_account": "str",
                "account": "str"
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

    const tokenVariablesAreValid = (contractVariables) => {
        const requiredVariables = ["token_name", "token_symbol"]
        let validateVariables = requiredVariables.map(variableName => contractVariables.includes(variableName))
        return validateVariables.every((val) => val === true)

    }

    const tokenHashesAreValid = (contractHashes) => {
        const requiredHashes = ["balances"]
        let validateHashes = requiredHashes.map(hashName => contractHashes.includes(hashName))
        return validateHashes.every((val) => val === true)
    }

    const getContractInfo = async (contractName) => {
        // TO DO make this default to mainnet
        let network = utils.networks.getCurrent()

        let contractInfo = await network.API.getContractInfo(contractName)
        if (contractInfo.error) return false
        let contractDetails = await Promise.all([
            await network.API.getContractVariables(contractName),
            await network.API.getContractMethods(contractName),

        ])
        return Object.assign(contractInfo, contractDetails[0], {methods: contractDetails[1]})
    }

    const getTokenMeta = async (contractName, callback = undefined) => {
        let contractInfo = await getContractInfo(contractName)
        const meta = {
            tokenSymbol: await getTokenMetaValue(contractName, "token_symbol"),
            tokenName: await getTokenMetaValue(contractName, "token_name"),
            logo_base64_svg: contractInfo.variables.includes("token_base64_svg") ? await getTokenMetaValue(contractName, "token_base64_svg", "") : undefined,
            logo_base64_png: contractInfo.variables.includes("token_base64_png") ? await getTokenMetaValue(contractName, "token_base64_png", "") : undefined,
            logo_url: contractInfo.variables.includes("token_logo_url") ? await getTokenMetaValue(contractName, "token_logo_url", undefined) : undefined
        }
        if (callback) callback(meta)
        return meta
    }

    const getTokenMetaValue = async (contractName, value, defaultValue = undefined) => {
        let network = utils.networks.getCurrent()
        let res = await network.API.getVariable(contractName, value)
        if (!res) return defaultValue
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

    const refreshTokenBalances = async (callback = undefined) => {
        let keysToGet = [] 
        let accounts = actions.getSanatizedAccounts()
        let network = utils.networks.getCurrent()
        console.log({accounts, network})
        if (!tokens[network.networkKey]) return;
        if (tokens[network.networkKey].length === 0) return;

        accounts.map(account => {
            tokens[network.networkKey].map(token => {
                keysToGet.push({
                    contractName: token.contractName,
                    variableName: "balances",
                    key: account.vk
                })
            })
        })
        console.log({accounts})
        let res = await network.blockExplorer_API.getKeys(keysToGet)
        console.log(res)
        res = res.filter(f => f.value !== null).map(balance => {
            let contractName = balance.key.split(".")[0]
            let vk = balance.key.split(":")[1]
            if (!token_balances[network.networkKey]) token_balances[network.networkKey] = {}
            if (!token_balances[network.networkKey][vk]) token_balances[network.networkKey][vk] = {}
            token_balances[network.networkKey][vk][contractName] = utils.getValueFromReturn(balance.value)
        })
        if (callback) callback(token_balances)
        saveTokensBalancesToStorage()
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
        addToken,
        validateTokenContract,
        getTokenMeta,
        tokenExists,
        refreshTokenBalances,
        reorderUp, reorderDown
    }
}