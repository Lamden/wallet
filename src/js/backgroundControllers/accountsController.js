export const accountsController = (utils) => {

    const getSessionData  = async () => {
        return await chrome.storage.session.get({current: "", mnemonic: "", derivationIndex: 0});
    }

    const getAccountsData = async () => {
        let { vault, hash, coins } = await chrome.storage.local.get({
            "hash": "", //depreciated and replaced with vault storage
            "coins":[],
            "vault": "",
        })
    
        let accountStore = coins
        return {
            vault,
            hash,
            accountStore
        }
    }

    const createPassword = async (string) => {
        try{
            await setCurrent(string)
            await setAccountStorage([])
            await setVaultStorage()
            return true;
        } catch (e){
            return false
        }
    }
    const changePassword = async (oldpd, newpd) => {
        let { accountStore } = await getAccountsData()
        let { current } = await getSessionData()

        if (oldpd != current) return false
        try{
            if (utils.validateTypes.isStringWithValue(oldpd) && utils.validateTypes.isStringWithValue(newpd)){
                let accounts = utils.stripRef(accountStore).map( account => {
                    let decryptedKey;
                    if (account.sk === "watchOnly") return account
                    decryptedKey = decryptString(account.sk, oldpd);
                    if (decryptedKey) account.sk = decryptedKey
                    else throw("Old password error")
                    return account
                })
                await setCurrent(newpd)
                accounts.forEach(account => {
                    if (account.sk !== 'watchOnly') account.sk = encryptString(account.sk, newpd)
                })
                accountStore = accounts
                await refreshAccountStore(accountStore)
                return true;
            }
            return false
        } catch (e){
            return false
        }
    }
    const checkPassword = async (string) => {
        let { current } = await getSessionData()
        return string === current
    }

    const createKeystore = async (info) => {
        let { accountStore } = await getAccountsData()
        return JSON.stringify({
            data: utils.encryptObject(info.pwd, {'version' : info.version, keyList: await decryptedKeys(accountStore).filter(f =>f.type !== "vault" && !f.sk.includes("watchOnly"))}),
            w: info.hint === "" ? "" : utils.encryptStrHash(info.obscure, info.hint),
        });
    }

    const decryptKeys = async (string) => {
        let { accountStore } = await getAccountsData()
        let isKeyOK = await checkPassword(string)
        if (isKeyOK) return await decryptedKeys(accountStore)
        return false
    }

    const decryptedKeys = async (accountStore) => {
        let { current } = await getSessionData()
        return utils.stripRef(accountStore).map( account => {
            let decryptedKey;
            if (account.sk === "watchOnly") return account
            try{
                decryptedKey = decryptString(account.sk, current);
            } catch (e) {return {}}
            if (decryptedKey) account.sk = decryptedKey
            else {
                account.sk = `Cannot decrypt Secret Key: wrong password or bad data. Encrypted Data: ${account.sk}`
            }
            return account
        })
    }

    const encryptString = (string, pwd) => {
        try{
            return utils.encryptStrHash(pwd, string);
        }catch(e){console.log(e)}
        return false;
    }
    
    const decryptString = (string, pwd) => {
        try{
            return utils.decryptStrHash(pwd, string);
        }catch(e){console.log(e)} 
        return false;
    }

    const getAccountByVK = async (vk) => {
        let { accountStore } = await getAccountsData()
        return accountStore.find(account => account.vk === vk)
    }
    
    const addNewLamdenAccount = async (data) => {
        let { mnemonic } = await getSessionData()
        if (mnemonic === data.mnemonic) return {
            added:true
        };
        const accountInfo = {
            'network': 'lamden',
            'name': "Lamden",
            'nickname': data.nickname,
            'symbol': "TAU",
            'vk': data.vk,
            'sk': data.sk
        }
        if (data.type) accountInfo['type'] = data.type;
        let result = await addAccount(accountInfo)
        result.vk = accountInfo.vk
        await setMnemonic(data.mnemonic) 
        return result
    }

    const addOne = async (account) => {
        let result = await addAccount(account)
        return result
    }

    const addMany = async (accounts, callback = undefined) => {
        if (!utils.validateTypes.isArray(accounts)) return {error: `Error processing keyStore. Expected Array of accounts but got <${typeof accounts}> instead.`}
        let resAccounts = []
        for (var i=0;i<accounts.length;i++) {
            let account = accounts[i]
            let res = await addAccount(account)
            account.result = res
            resAccounts.push(account)
        }

        if (callback) callback(resAccounts)
        return resAccounts
    }
    
    const addVaultAccount = async (nickname) => {
        let { mnemonic, derivationIndex } = await getSessionData()
        derivationIndex = derivationIndex + 1
        const seed = utils.bip39.mnemonicToSeedSync(mnemonic).toString('hex');
        let lamdenWallet = utils.Lamden.wallet.new_wallet_bip39(seed, derivationIndex)
        const accountInfo = {
            'network': 'lamden',
            'name': "Lamden",
            'nickname': nickname,
            'symbol': "TAU",
            'vk': lamdenWallet.vk,
            'sk': lamdenWallet.sk,
            'type': 'vault'
        }
        let res = await addOne(accountInfo);
        if (res.added) {
            await setMnemonic(mnemonic, derivationIndex)
            res.vk = lamdenWallet.vk;
        }
        return res;
    }

    const updateWatchedAccount = (foundAccount, accountInfo, pwd) => {
        if (accountInfo.sk === 'watchOnly') return false
        if (foundAccount.sk === 'watchOnly'){
            foundAccount.sk = encryptString(accountInfo.sk, pwd)
            return true
        }
        return false
    }   
    
    const addAccount = async (account) => {
        let { accountStore } = await getAccountsData()
        let { current } = await getSessionData()
        let foundAccount = await getAccountByVK(account.vk)
        if (foundAccount){
            if(updateWatchedAccount(foundAccount, account, current)) return {added: true, reason: `Updated the private key for '${foundAccount.nickname}'`}
            else return {added: false, reason: `Keypair already exists as '${foundAccount.nickname}'`}
        }else{
            try{
                if (account.sk !== 'watchOnly') account.sk = encryptString(account.sk, current)
                accountStore.push(utils.stripRef(account))
                await refreshAccountStore(accountStore)
                return {added: true, reason: `Added ${account.nickname} to your Lamden Vault`}
            }catch (e){
                return {added: false, reason: e.message}
            }
        }
    }

    const changeAccountNickname = async (data) => {
        let { accountInfo, newNickname } = data;
        let { accountStore } = await getAccountsData()
        let changed = false
        accountStore.forEach((account) => {
            if (account.vk === accountInfo.vk) {
                if (account.nickname !== newNickname){
                    account.nickname = newNickname
                    changed = true
                }
            }
        })
        if (changed) refreshAccountStore(accountStore);
        return true
    }
    
    const deleteOne = async (accountInfo) => {
        let { accountStore } = await getAccountsData()
        const before = accountStore.length
        accountStore.forEach((account, index) => {
            if (account.vk === accountInfo.vk) accountStore.splice(index, 1);
        })
        if (accountStore.length < before){  
            await refreshAccountStore(accountStore);
            return true
        }else{
            return false
        }
    }
    const vaultCreated = async () => {
        let { vault } = await getAccountsData()
        return utils.validateTypes.isStringWithValue(vault)
    }
    
    const createIntialVault = async () => {
        await setVaultStorage();
        await chrome.storage.local.remove("hash") 
    }
    
    const setVaultStorage = async () => {
        let { accountStore } = await getAccountsData()
        let { current, mnemonic, derivationIndex }  = await getSessionData()
        //account object cleanup - TBD fix these attachments
        accountStore.forEach(account => {
            delete account.result
            delete account.checked
        })
        //Only save the vault if there is a current password
        if (utils.validateTypes.isStringWithValue(current)){
            await chrome.storage.local.set({"vault": utils.encryptObject(current, {data: accountStore, mnemonic, derivationIndex})})  
        }
    }
    
    const decryptVaultStorage = async () => {
        try {
            let { vault } = await getAccountsData()
            let { current }  = await getSessionData()
            let decryptedStore = utils.decryptObject(current, vault)
            if (typeof decryptedStore.data === "undefined") throw new Error('Could not get vault data')
            await setAccountStorage(decryptedStore.data)
            await setMnemonic(decryptedStore.mnemonic, decryptedStore.derivationIndex || 0)
        }catch (e){
            console.log(e.message)
        }
    }
    
    const setAccountStorage = async (data) => {
        await chrome.storage.local.set({"coins": data});
    }
    
    const refreshAccountStore = async (data) => {
        await setAccountStorage(data);
        await setVaultStorage();
    }

    const getSanatizedAccounts = async (accounts = undefined) => {
        let { accountStore } = await getAccountsData()
        if (!accounts) accounts = accountStore;
        return utils.stripRef(accounts).map(account => {
            if (account.sk !== "watchOnly") account.sk = "encrypted"
            return account
        })
    }

    const unlock = async (string) => {
        //Validate the password is correct first
        if (vaultCreated()){
            if (await validatePasswordFromVault(string)){
                await setCurrent(string)
            } else {
                return false
            }
        }else{
            if(await validatePasswordFromHash(string)){
                await setCurrent(string)
                await createIntialVault()
            } else {
                return false
            }
        }
        await decryptVaultStorage()
        await setAccountStorage()
        return true;
    }
    const lock = async () => {
        await setCurrent("")
    }

    const walletIsLocked = async () => {
        let { current }  = await getSessionData()
        return !utils.validateTypes.isStringWithValue(current)
    }

    const validatePasswordFromHash = async (string) => {
        let { hash } = await getAccountsData()
        try{
            return utils.decryptObject(string, hash).valid
        } catch (e) {return false }
    }
    
    const validatePasswordFromVault = async (string) => {
        let { vault } = await getAccountsData()
        try{
            return  utils.validateTypes.isObject(utils.decryptObject(string, vault))
        } catch (e) {console.log(e)}
        return false
    }

    const signTx = async (txBuilder) => {
        let { current } = await getSessionData()
        let account = await getAccountByVK(txBuilder.sender)
        if (!account) throw new Error(`Error: Account address ${txBuilder.sender} not in Lamden Vault.`)
        txBuilder.sign(decryptString(account.sk, current))
    }

    const signString = async (vk, challenge) => {
        let { current } = await getSessionData()
        const account = await getAccountByVK(vk)
        if (!account) throw new Error(`Error: Account address '${vk}' not in Lamden Vault.`)

        const wallet = utils.Lamden.wallet.create_wallet({sk: decryptString(account.sk, current)})

        const stringBuffer = Buffer.from(challenge);
        const stringArray = new Uint8Array(stringBuffer);

        return wallet.sign(stringArray)
    }

    const firstRun = async () => {
        let { hash, vault } = await getAccountsData()
        return hash === "" && vault === "" ? true : false
    }

    const reorderUp = async (index, callback = undefined) => {
        let { accountStore } = await getAccountsData()
        if (index <= 0) {
            if (callback) callback(true)
            return true
        }

        let accountType = accountStore[index].type === "vault"? "vault" : accountStore[index].sk === "watchOnly" ? "watchOnly" : "legacy";

        for (let i=1; i < accountStore.length; i++){
            let nextAccountType = accountStore[index].type === "vault"? "vault" : accountStore[index].sk === "watchOnly" ? "watchOnly" : "legacy";
            if (accountType === nextAccountType) {
                await moveArrayItemToNewIndex(index, index - i)
                if (callback) callback(true)
                return true
            } 
        }
    }

    const reorderDown = async (index, callback = undefined) => {
        let { accountStore } = await getAccountsData()
        if (index >= (accountStore.length - 1)) {
            if (callback) callback(true)
            return true
        }

        let accountType = accountStore[index].type === "vault"? "vault" : accountStore[index].sk === "watchOnly" ? "watchOnly" : "legacy";

        for (let i=1; i <= accountStore.length - 1 - index; i++){
            let nextAccountType = accountStore[index].type === "vault"? "vault" : accountStore[index].sk === "watchOnly" ? "watchOnly" : "legacy";
            if (accountType === nextAccountType) {
                await moveArrayItemToNewIndex(index, index + i)
                if (callback) callback(true)
                return true
            } 
        }
    }

    const moveArrayItemToNewIndex = async (old_index, new_index) => {
        let { accountStore } = await getAccountsData()
        if (new_index >= accountStore.length) {
            var k = new_index - accountStore.length + 1;
            while (k--) {
                accountStore.push(undefined);
            }
        }
        accountStore.splice(new_index, 0, accountStore.splice(old_index, 1)[0]);
        await refreshAccountStore(accountStore)
    };

    const isWatchOnly = async (vk) => {
        let account = await getAccountByVK(vk)
        return account.sk === "watchOnly"
    }

    const setMnemonic = async (s, index=0) => {
        await chrome.storage.session.set({mnemonic: s, derivationIndex: index});
        await setVaultStorage();
        return true
    }

    const isVaultCreated = async () => {
        let { mnemonic }  = await getSessionData()
        if (mnemonic && mnemonic !== "") {
            return true
        } 
        return false
    }

    const getMnemonic = async () => {
        let { mnemonic }  = await getSessionData()
        return mnemonic
    }

    const auth = async (data, dappInfo, callback = undefined) => {
        if (!callback) return
    
        let { dapp_challenge } = data
        let { vk } = dappInfo

        const errors = []

        if (dapp_challenge && utils.validateTypes.isString(dapp_challenge) && dapp_challenge.length <= 64){
            try{
                JSON.parse(dapp_challenge)
                errors.push(`Error: Malformed 'dapp_challenge': Cannot sign JSON string.`)
                callback({errors, dapp_challenge})
                return
            }catch(e){console.log(e)}

            try{
                const vault_challenge = utils.hashStringValue(new Date().toISOString())
                const challenge_message = `[VAULT_AUTH]__DAPP__${dapp_challenge}__VAULT__${vault_challenge}`
                const signature = await signString(vk, challenge_message)

                callback({signature, vault_challenge})
                return
            }catch(e){
                errors.push(`Unable to complete auth: ${e.message}`)
            }
        }else{
            errors.push("Error: Malformed 'dapp_challenge': Must be a string with a max length of 64.")
        }

        callback({errors, dapp_challenge})
    }

    const setCurrent = async (string) => {
        await chrome.storage.session.set({current: string});
    }

    // for version 2.5.0
    const repairVault = async (oldpd) => {
        let { accountStore } = await getAccountsData()
        let { current } = await getSessionData()

        try{
            if (utils.validateTypes.isStringWithValue(oldpd) && utils.validateTypes.isStringWithValue(current)){
                let accounts = utils.stripRef(accountStore).map( account => {
                    let decryptedKey;
                    if (account.sk === "watchOnly") return account
                    decryptedKey = decryptString(account.sk, oldpd);
                    if (decryptedKey) account.sk = decryptedKey
                    else throw("Old password error")
                    return account
                })
                accounts.forEach(account => {
                    if (account.sk !== 'watchOnly') account.sk = encryptString(account.sk, current)
                })
                accountStore = accounts
                await refreshAccountStore(accountStore)
                return true;
            }
            return false
        } catch (e){
            return false
        }
    }

    return {
        repairVault,
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
        validatePassword: validatePasswordFromVault,
        walletIsLocked,
        decryptKeys,
        signTx,
        signString,
        reorderUp, reorderDown,
        isWatchOnly,
        setMnemonic,
        getMnemonic,
        isVaultCreated,
        addVaultAccount,
        auth
    }
}