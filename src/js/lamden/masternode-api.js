export function isString(value){
    if(Object.prototype.toString.call(value) === "[object String]") return true;
    return false;
}

export function isNumber(value){
    if(Object.prototype.toString.call(value) === "[object Number]") return true;
    return false;  
}

export function isStringWithValue(value){
    if (isString(value) && value !== '') return true;
    return false;
}

export function masternodeAPI(networkObj, method, path, data, callback){
    let parms = '';
    if (Object.keys(data).includes('parms')) {
        parms = createParms(data.parms)
    }

    let options = {}
    if (method === 'POST'){
        let headers = {'Content-Type': 'application/json'}
        options.method = method
        options.headers = headers;
        options.body = JSON.stringify(data);
    }

    return fetch(`${networkObj.ip}:${networkObj.port}${path}${parms}`, options)
           .then(res => res.json())
           .then(json => {
                return callback(json, undefined)
           })
           .catch(err => {
                console.log(err)
                return callback(undefined, err)
            })
}

function createParms(parms){
    let parmString = '?'
    Object.keys(parms).forEach(key => {
        parmString = `${parmString}${key}=${parms[key]}&`
    });
    return parmString.slice(0, -1);
}

export async function getContractInfo(networkObj, contractName){
    let path = `/contracts/${contractName}`
    return masternodeAPI(networkObj, 'GET', path, {}, (res, err) => {
        if (err) return;
        return res
    })
}

export function getVariable(networkObj, contract, variable, parms){
    let path = `/contracts/${contract}/${variable}/`
    return masternodeAPI(networkObj, 'GET', path, parms, (res, err) => {
        try{
            if (res.value) return res.value
        } catch (e){}
        return;
    })
}

export function getContractMethods(networkObj, contract){
    let path = `/contracts/${contract}/methods`
    return masternodeAPI(networkObj, 'GET', path, {}, (res, err) => {
        try{
            if (res.methods) return res.methods
        } catch (e){}
        return [];
    })
    
}

export function lintCode(networkObj, name, code){
    let data = {name, code}
    return masternodeAPI(networkObj, 'POST', '/lint/', data, (res, err) => {
        if (err) return err.toString();
        return res;
    })
}

export function pingServer(networkObj){
    return masternodeAPI(networkObj, 'GET', '/ping', {}, (res, err) => {
        try { 
            if (res.status === 'online') return true;
        } 
        catch (e) {
            return false;
        }
    })
}

export async function getTauBalance(networkObj, vk){
    let parms = {};
    parms.key = vk;
    let balanceRes = await getVariable(networkObj, 'currency', 'balances', {parms})
    if (isNaN(parseFloat(balanceRes))){
        return 0;
    }
    return parseFloat(balanceRes)
}

export async function contractExists(networkObj, contractName){
    let path = `/contracts/${contractName}`
    return masternodeAPI(networkObj, 'GET', path, {}, (res, err) => {
        try{
            if (res.name) return true;
        } catch (e){}
        return false;
    })
}

export async function mintTestNetCoins(networkObj, vk, amount){
    if (!isStringWithValue(vk) || !isNumber(amount)) return false;
    let data = {vk, amount}
    let path = `/mint/`
    return masternodeAPI(networkObj, 'POST', path, data, (res, err) => {
        try{
            if (res.success) return true;
        } catch (e){}
        return false;
    })    
}