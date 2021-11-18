export const accountsController = (utils, services) => {
    let vault = "";
    let hash = "";
    let accountStore = [];
    let current = "";

    chrome.storage.local.get({
        "hash": "", //depreciated and replaced with vault storage
        "coins":[],
        "vault": "",
    },
    function(getValue) {
        accountStore = getValue.coins;
        vault = getValue.vault
        hash = getValue.hash
        if (vault === "" && utils.validateTypes.isStringWithValue(hash)) accountStore = getValue.coins;
    })
    chrome.storage.onChanged.addListener(function(changes) {
        for (let key in changes) {
            if (key === 'coins') accountStore = changes[key].newValue;
            if (key === "vault") vault = changes[key].newValue;
        }
    });

    const createPassword = (string) => {
        try{
            current = string
            accountStore = []
            setVaultStorage()
            setAccountStorage()
            return true;
        } catch (e){
            return false
        }
    }
    const changePassword = (oldpd, newpd) => {
        try{
            if (utils.validateTypes.isStringWithValue(oldpd) && utils.validateTypes.isStringWithValue(newpd)){
                current = oldpd
                let accounts = utils.stripRef(accountStore).map( account => {
                    let decryptedKey;
                    if (account.sk === "watchOnly") return account
                    decryptedKey = decryptString(account.sk);
                    if (decryptedKey) account.sk = decryptedKey
                    else throw("Old password error")
                    return account
                })
                current = newpd
                accounts.forEach(account => {
                    if (account.sk !== 'watchOnly') account.sk = encryptString(account.sk)
                })
                accountStore = accounts
                setVaultStorage()
                return true;
            }
            return false
        } catch (e){
            return false
        }
    }
    const checkPassword = (string) => {
        return string === current
    }

    const createKeystore = (info) => {
        return JSON.stringify({
            data: utils.encryptObject(info.pwd, {'version' : info.version, keyList: decryptedKeys().filter(f => !f.sk.includes("watchOnly"))}),
            w: info.hint === "" ? "" : utils.encryptStrHash(info.obscure, info.hint),
        });
    }

    const decryptKeys = (string) => {
        if (checkPassword(string)) return decryptedKeys()
        return false
    }

    const decryptedKeys = () => {
        return utils.stripRef(accountStore).map( account => {
            let decryptedKey;
            if (account.sk === "watchOnly") return account
            try{
                decryptedKey = decryptString(account.sk);
            } catch (e) {}
            if (decryptedKey) account.sk = decryptedKey
            else {
                account.sk = `Cannot decrypt Secret Key: wrong password or bad data. Encrypted Data: ${account.sk}`
            }
            return account
        })
    }

    const encryptString = (string) => {
        try{
            return utils.encryptStrHash(current, string);
        }catch(e){console.log(e)}
        return false;
    }
    
    const decryptString = (string) => {
        try{
            return utils.decryptStrHash(current, string);
        }catch(e){console.log(e)} 
        return false;
    }

    const getAccountByVK = (vk) => {
        return accountStore.find(account => account.vk === vk)
    }
    
    const addNewLamdenAccount = (nickname) => {
        const keyPair = utils.Lamden.wallet.new_wallet()
        const accountInfo = {
            'network': 'lamden',
            'name': "Lamden",
            nickname,
            'symbol': "TAU",
            'vk': keyPair.vk,
            'sk': keyPair.sk
        }
        let result = addAccount(accountInfo)
        result.vk = accountInfo.vk 
        try{
            return result
        }finally{
            refreshAccountStore();
        }
    }
    const addOne = (account) => {
        let result = addAccount(account)
        try{
            return result
        }finally{
            if (result.added) refreshAccountStore();
        }
    }
    
    const addMany = (accounts, callback = undefined) => {
        if (!utils.validateTypes.isArray(accounts)) return {error: `Error processing keyStore. Expected Array of accounts but got <${typeof accounts}> instead.`}
        let accountAdded = false
        accounts.forEach(account => {
            let res = addAccount(account)
            account.result = res
            if (account.result.added) {
                accountAdded = true
                services.socketService.joinCurrencyBalanceFeed(account.vk)
            }
            return account
        })
        if (accountAdded) refreshAccountStore();
        if (callback) callback(accounts)
        return accounts
    }
    
    const updateWatchedAccount = (foundAccount, accountInfo) => {
        if (accountInfo.sk === 'watchOnly') return false
        if (foundAccount.sk === 'watchOnly'){
            foundAccount.sk = encryptString(accountInfo.sk)
            return true
        }
        return false
    }   
    
    const addAccount = (account) => {
        let foundAccount = getAccountByVK(account.vk)
        if (foundAccount){
            if(updateWatchedAccount(foundAccount, account)) return {added: true, reason: `Updated the private key for '${foundAccount.nickname}'`}
            else return {added: false, reason: `Keypair already exists as '${foundAccount.nickname}'`}
        }else{
            try{
                if (account.sk !== 'watchOnly') account.sk = encryptString(account.sk)
                accountStore.push(utils.stripRef(account))
                return {added: true, reason: `Added ${account.nickname} to your wallet`}
            }catch (e){
                return {added: false, reason: e.message}
            }
        }
    }

    const changeAccountNickname = (data) => {
        let { accountInfo, newNickname } = data;
        let changed = false
        accountStore.forEach((account) => {
            if (account.vk === accountInfo.vk) {
                if (account.nickname !== newNickname){
                    account.nickname = newNickname
                    changed = true
                }
            }
        })
        if (changed) refreshAccountStore();
        return true
    }
    
    const deleteOne = (accountInfo) => {
        const before = accountStore.length
        accountStore.forEach((account, index) => {
            if (account.vk === accountInfo.vk) accountStore.splice(index, 1);
        })
        if (accountStore.length < before){  
            refreshAccountStore();
            return true
        }else{
            return false
        }
    }
    const vaultCreated = () => {
        return utils.validateTypes.isStringWithValue(vault)
    }
    
    const createIntialVault = () => {
        setVaultStorage();
        chrome.storage.local.remove("hash") 
    }
    
    const setVaultStorage = () => {
        //account object cleanup - TBD fix these attachments
        accountStore.forEach(account => {
            delete account.result
            delete account.checked
        })
        //Only save the vault if there is a current password
        if (utils.validateTypes.isStringWithValue(current)){
            chrome.storage.local.set({"vault": utils.encryptObject(current, {data: accountStore})})  
        }
    }
    
    const decryptVaultStorage = () => {
        try {
            let decryptedStore = utils.decryptObject(current, vault)
            if (typeof decryptedStore.data === "undefined") throw new Error('Could not get vault data')
            accountStore = decryptedStore.data
        }catch (e){
            console.log(e.message)
        }
    }
    
    const setAccountStorage = () => {
        chrome.storage.local.set({"coins": accountStore});
    }
    
    const wipeAccountStorage = () => {
        chrome.storage.local.set({"coins": []});
        current = "";
    }
    
    const refreshAccountStore = () => {
        setVaultStorage();
        setAccountStorage();
    }

    const getSanatizedAccounts = (accounts = undefined) => {
        if (!accounts) accounts = accountStore;
        return utils.stripRef(accounts).map(account => {
            if (account.sk !== "watchOnly") account.sk = "encrypted"
            return account
        })
    }

    const unlock = (string) => {
        //Validate the password is correct first
        if (vaultCreated()){
            if (validatePasswordFromVault(string)){
                current = string
            }
        }else{
            if(validatePasswordFromHash(string)){
                current = string
                createIntialVault()
            }
        }
        if (utils.validateTypes.isStringWithValue(current)){
            decryptVaultStorage()
            setAccountStorage()
            return true;
        }
        return false;
    }
    const lock = () => {
        wipeAccountStorage()
        current = ""
    }

    const walletIsLocked = () => {
        return !utils.validateTypes.isStringWithValue(current)
    }

    const validatePasswordFromHash = (string) => {
        try{
            return utils.decryptObject(string, hash).valid
        } catch (e) {}
        return false
    }
    
    const validatePasswordFromVault = (string) => {
        try{
            return  utils.validateTypes.isObject(utils.decryptObject(string, vault))
        } catch (e) {console.log(e)}
        return false
    }

    const signTx = (txBuilder) => {
        let account = getAccountByVK(txBuilder.sender)
        console.log(account)
        if (!account) throw new Error(`Error: Account address ${xBuilder.sender} not in wallet.`)
        console.log("here")
        let sk = decryptString(account.sk)
        console.log(sk)
        txBuilder.sign(decryptString(account.sk))
    }

    const firstRun = () => {
        return hash === "" && vault === "" ? true : false
    }

    const reorderUp = (index, callback = undefined) => {
        if (index <= 0) {
            if (callback) callback(true)
            return true
        }

        let accountType = accountStore[index].sk === "watchOnly" ? "watchOnly" : "encrypted";

        for (let i=1; i < accountStore.length; i++){
            let nextAccountType = accountStore[index - i].sk === "watchOnly" ? "watchOnly" : "encrypted"
            if (accountType === nextAccountType) {
                moveArrayItemToNewIndex(index, index - i)
                if (callback) callback(true)
                return true
            } 
        }
    }

    const reorderDown = (index, callback = undefined) => {
        if (index >= (accountStore.length - 1)) {
            if (callback) callback(true)
            return true
        }

        let accountType = accountStore[index].sk === "watchOnly" ? "watchOnly" : "encrypted";

        for (let i=1; i <= accountStore.length - 1 - index; i++){
            let nextAccountType = accountStore[index + i].sk === "watchOnly" ? "watchOnly" : "encrypted"
            if (accountType === nextAccountType) {
                moveArrayItemToNewIndex(index, index + i)
                if (callback) callback(true)
                return true
            } 
        }
    }

    const moveArrayItemToNewIndex = (old_index, new_index) => {
        if (new_index >= accountStore.length) {
            var k = new_index - accountStore.length + 1;
            while (k--) {
                accountStore.push(undefined);
            }
        }
        accountStore.splice(new_index, 0, accountStore.splice(old_index, 1)[0]);
        refreshAccountStore()
    };

    const isWatchOnly = (vk) => {
        let account = getAccountByVK(vk)
        return account.sk === "watchOnly"
    }

    return {
        changePassword,
        createPassword,
        checkPassword,
        firstRun,
        createKeystore,
        encryptString,
        decryptString,
        getAccountByVK,
        addNewLamdenAccount,
        addOne,
        addMany,
        getSanatizedAccounts,
        changeAccountNickname,
        deleteOne,
        vaultCreated,
        createIntialVault,
        unlock,
        lock,
        validatePassword: (string) => validatePasswordFromVault(string),
        walletIsLocked,
        decryptKeys,
        signTx,
        reorderUp, reorderDown,
        isWatchOnly
    }
}