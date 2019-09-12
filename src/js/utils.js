import { API } from './api.js';

import nodeCryptoJs from 'node-cryptojs-aes';
const { CryptoJS, JsonFormatter } = nodeCryptoJs;

export function copyToClipboard(textTOcopy='', callback=undefined){
    if (typeof textTOcopy === "string"){
        try{
            var dummy = document.createElement("input");
            document.body.appendChild(dummy);
            dummy.setAttribute("id", "copyhelper");
            document.getElementById("copyhelper").value=textTOcopy;
            dummy.select();
            document.execCommand("copy");
            document.body.removeChild(dummy);
            
        } catch (e) {
            throw new Error('unable to copy')
        }
        if (callback){callback()}
    }
}

export function checkPassword(password, HashStore){
    try{
        const decrypted = CryptoJS.AES.decrypt(HashStore.encode, password, { format: JsonFormatter });
        JSON.parse(CryptoJS.enc.Utf8.stringify(decrypted));
        return true;
    } catch {
        return false;
    }
};

export function createPassword(password, HashObj){
    if (!password || !HashObj ){
        !password ? new TypeError('password is undefined') : new TypeError('Hash is undefined');
    }else{
        HashObj.set({'encode' : CryptoJS.AES.encrypt(JSON.stringify({'date':new Date()}), password, { format: JsonFormatter }).toString() });
    }
};

export function encryptStrHash(password, string){
    const encrypt = CryptoJS.AES.encrypt(string, password).toString();
    return encrypt;
};

export function decryptStrHash(password, hash){
    const decrypted = CryptoJS.AES.decrypt(hash, password);
    return CryptoJS.enc.Utf8.stringify(decrypted);
};

export function encryptObject(password, obj){
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(obj), password, { format: JsonFormatter }).toString();
    return encrypted;
};

export function decryptObject(password, obj){
    const decrypted = CryptoJS.AES.decrypt(obj, password, { format: JsonFormatter });
    return JSON.parse(CryptoJS.enc.Utf8.stringify(decrypted));
};

export function decryptFile(password, file){
    const decrypted = CryptoJS.AES.decrypt(file, password, { format: JsonFormatter });
    return JSON.parse(CryptoJS.enc.Utf8.stringify(decrypted));
};

export function makeBalancesPost(CoinStore) {
    let postObj = {"address_list":[]};
    for (const [netKey, network] of Object.entries(CoinStore) ){
        if (Object.entries(network).length > 0){
            for (const [coinKey, coin] of Object.entries(network)){
                for (const [publicKey, pubInfo] of Object.entries(coin.pubkeys)){
                    postObj.address_list.push({
                        "network_symbol" : coin.symbol,
                        "wallet_address" : publicKey,
                        "network" : netKey,
                    })
                }
            }
        }
    }
    return postObj.address_list.length > 0 ? postObj : false;
}

export function toCurrencyFormat(value, currency, local){
    value = value || '0'
    currency = currency || 'USD'
    local = local || undefined
    return value.toLocaleString(local, {
        style: 'currency',
        currency,
    });
}