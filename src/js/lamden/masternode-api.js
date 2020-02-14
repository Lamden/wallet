import { ValidateTypes } from './validateTypes'
const validate = new ValidateTypes();

export class LamdenMasterNode_API{
    constructor(networkInfoObj){
        if (!validate.isObjectWithKeys(networkInfoObj)) throw new Error(`Expected Object and got Type: ${typeof networkInfoObj}`)
        if (!validate.isStringWithValue(networkInfoObj.host)) throw new Error(`HOST Required (Type: String)`)
        if (!validate.isStringWithValue(networkInfoObj.port)) throw new Error(`PORT Required (Type: String)`)
        if (!validate.isStringWithValue(networkInfoObj.type)) throw new Error(`Network Type Required (Type: String)`)

        const lamdenNetworkTypes = ['mockchain', 'testnet', 'mainnet']

        this.host = this.vaidateProtocol(networkInfoObj.host);
        this.port = networkInfoObj.port;
        this.url = `${this.host}:${this.port}`
        this.networkType = networkInfoObj.type.toLowerCase();
        if (!lamdenNetworkTypes.includes(this.networkType)) {
            throw new Error(`${this.networkType} not in Lamden Network Types: ${JSON.stringify(lamdenNetworkTypes)}`)
        }
        
    }
    //This will throw an error if the protocol wasn't included in the host string
    vaidateProtocol(host){
        let protocols = ['https://', 'http://']
        if (protocols.map(protocol => host.includes(protocol)).includes(true)) return host
        throw new Error('Host String must include http:// or https://')
    }

    send(method, path, data, callback){
        let parms = '';
        if (Object.keys(data).includes('parms')) {
            parms = this.createParms(data.parms)
        }

        let options = {}
        if (method === 'POST'){
            let headers = {'Content-Type': 'application/json'}
            options.method = method
            options.headers = headers;
            options.body = data;
        }

        return fetch(`${this.url}${path}${parms}`, options)
            .then(res => res.json())
            .then(json => {
                    return callback(json, undefined)
            })
            .catch(err => {
                    console.log(err)
                    return callback(undefined, err.toString())
                })
    }

    createParms(parms){
        let parmString = '?'
        Object.keys(parms).forEach(key => {
            parmString = `${parmString}${key}=${parms[key]}&`
        });
        return parmString.slice(0, -1);
    }

    async getContractInfo(contractName){
        let path = `/contracts/${contractName}`
        return this.send('GET', path, {}, (res, err) => {
            if (err) return;
            return res
        })
    }

    async getVariable(contract, variable, parms){
        let path = `/contracts/${contract}/${variable}/`
        return this.send('GET', path, parms, (res, err) => {
            try{
                if (res.value) return res.value
            } catch (e){}
            return;
        })
    }

    async getContractMethods(contract){
        let path = `/contracts/${contract}/methods`
        return this.send('GET', path, {}, (res, err) => {
            try{
                if (res.methods) return res.methods
            } catch (e){}
            return [];
        })
        
    }

    async lintCode(name, code){
        let data = JSON.stringify({name, code})
        return this.send('POST', '/lint/', data, (res, err) => {
            if (err) return err;
            return res;
        })
    }

    async pingServer(){
        return this.send('GET', '/ping', {}, (res, err) => {
            try { 
                if (res.status === 'online') return true;
            } 
            catch (e) {
                return false;
            }
        })
    }

    async getTauBalance(vk){
        let parms = {};
        parms.key = vk;
        let balanceRes = await this.getVariable('currency', 'balances', {parms})
        if (isNaN(parseFloat(balanceRes))){
            return 0;
        }
        return parseFloat(balanceRes)
    }

    async contractExists(contractName){
        let path = `/contracts/${contractName}`
        return this.send('GET', path, {}, (res, err) => {
            try{
                if (res.name) return true;
            } catch (e){}
            return false;
        })
    }

    async mintTestNetCoins(vk, amount){
        if (this.networkType !== 'mockchain') throw Error (`${this.networkType} does not allow minting of coins`)
        if (!validate.isStringWithValue(vk) || !validate.isNumber(amount)) return false;
        let data = JSON.stringify({vk, amount})
        let path = `/mint/`
        return this.send('POST', path, data, (res, err) => {
            try{
                if (res.success) return true;
            } catch (e){}
            return false;
        })    
    }

    async sendTransaction(data, callback){
        return this.send('POST', '/', data, (res, err) => {
            if (err){
                if (callback) {
                    callback(undefined, err);
                    return;
                } 
                else return err
            }
            if (callback) {
                callback(res, undefined);
                return
            }
            return res;
        })   
    }

    async getNonce(sender, callback){
        if (!validate.isStringHex(sender)) return `${sender} is not a hex string.`
        let path = `/nonce/${sender}` 
        return this.send('GET', path, {}, (res, err) => {
            if (err){
                if (callback) {
                    callback(undefined, `Unable to get nonce for "${sender}". ${err}`)
                    return
                } 
                return `Unable to get nonce for "${sender}". ${err}`
            }
            if (callback) {
                callback(res, undefined)
                return
            }
            else return res;
        })
    }
}