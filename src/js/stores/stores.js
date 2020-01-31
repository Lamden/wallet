import { readable, writable} from 'svelte/store';
import { coin, pubkey } from './defaults.js';

export { obscure, supportedCoins } from './defaults.js';
export { coinMeta } from './coinMeta.js';
export { CoinStore, lockedStorage, password, balanceTotal } from './coinStore.js';
export { SettingsStore, firstRun, themeStyle, currentPage, storageInfo  } from './settingsStore.js';
export { NetworksStore, allNetworks, networksDropDownList, currentNetwork  } from './networksStore.js';
export { TxStore }  from './txStore.js';
export { FilesStore, activeTab }  from './filesStore.js';
export { CacheStore }  from './cacheStore.js';

//MISC Stores
export const CURRENT_KS_VERSION = writable("1.0");
export const defaultOjects = readable({coin, pubkey });
export const breadcrumbs = writable([]);
export const steps = writable({current:0, stepList:[]});
export const pageLoaded = writable(false);

//Store Utils
export function networkKey(networkObj){
    return `${networkObj.ip}:${networkObj.port}`
}

export function copyItem(item){
    return JSON.parse(JSON.stringify(item))
}

//Validation functions
export function hasKeys(object, keys){
    if(keys.map(key => key in object).includes(false)) return false;
    return true;
}

export function isObject(value){
    if(Object.prototype.toString.call(value) === "[object Object]") return true;
    return false;
}

export function isString(value){
    if(Object.prototype.toString.call(value) === "[object String]") return true;
    return false;
}

export function isBoolean(value){
    if(Object.prototype.toString.call(value) === "[object Boolean]") return true;
    return false;
}

export function isArray(value){
    if(Object.prototype.toString.call(value) === "[object Array]") return true;
    return false;  
}

export function isNumber(value){
    if(Object.prototype.toString.call(value) === "[object Number]") return true;
    return false;  
}

export function isInteger(value){
    if(Object.prototype.toString.call(value) === "[object Number]" && Number.isInteger(value)) return true;
    return false;  
}

export function isStringWithValue(value){
    if (isString(value) && value !== '') return true;
    return false;
}

export function isObjectWithKeys(value){
    if (isObject(value) && Object.keys(value).length > 0) return true;
    return false;
}

export function isArrayWithValues(value){
    if (isArray(value) && value.length > 0) return true;
    return false;
}

export function isPageInfoObj(pageInfoObj){
    //Reject undefined or missing info.
    if (!isObjectWithKeys(pageInfoObj)) return false;
    if(!hasKeys(pageInfoObj, ['name'])) return false;
    if (!isStringWithValue(pageInfoObj.name)) return false;
    return true;
}

export function isStorageObj(storageObj){
    //Reject undefined or missing info.
    if (!isObjectWithKeys(storageObj)) return false;
    if(!hasKeys(storageObj, ['used', 'remaining', 'max'])) return false;
    if (isNaN(storageObj.used) || isNaN(storageObj.remaining) || isNaN(storageObj.max)) return false;
    return true;
}

export function isFileObj(name, code, methods, networkObj){
    if (!isStringWithValue(name)) return false;
    if (!isString(code)) return false;
    if (!isArray(methods)) return false;
    if (!isNetworkObj(networkObj)) return false;
    return true
}

export function isNetworkObj(networkInfo){
    //Reject undefined or missing info
    if (!isObjectWithKeys(networkInfo)) return false;
    if (!isStringWithValue(networkInfo.name)) return false;
    if (!isStringWithValue(networkInfo.ip)) return false;
    if (!isStringWithValue(networkInfo.port)) return false;
    return true;
}

export function isTxDataObj(txDataObj){
    if (!isObjectWithKeys(txDataObj)) return false;
    if (!hasKeys(txDataObj, ['network', 'sender'])) return false;
    if (!isStringWithValue(txDataObj.network.ip)) return false;
    if (!isStringWithValue(txDataObj.network.port)) return false;
    if (!isStringWithValue(txDataObj.sender.vk)) return false;
    return true;
}
export function isCoinInfoObj(coinInfoObj){
    if (!isObjectWithKeys(coinInfoObj)) return false;
    if (!hasKeys(coinInfoObj, ['network', 'name', 'nickname', 'symbol', 'vk'])) return false;
    if (!isStringWithValue(coinInfoObj.network)) return false;
    if (!isStringWithValue(coinInfoObj.name)) return false;
    if (!isString(coinInfoObj.nickname)) return false;
    if (!isStringWithValue(coinInfoObj.symbol)) return false;
    if (!isStringWithValue(coinInfoObj.vk)) return false;
    return true;
}

export function isSettingsStoreObj(obj){
    if (!isObjectWithKeys(obj)) return false;
    if (!hasKeys(obj, ['currentPage', 'firstRun', 'themeStyle', 'version', 'storage'])) return false;
    if (!isPageInfoObj(obj.currentPage)) return false;
    if (!isStorageObj(obj.storage)) return false;
    if (!isStringWithValue(obj.version)) return false;
    if (!isStringWithValue(obj.themeStyle)) return false;
    if (!isBoolean(obj.firstRun)) return false;
    return true;
}

export function isNetworkStoreObj(obj){
    if (!isObjectWithKeys(obj)) return false;
    if (!hasKeys(obj, ['user', 'lamden', 'current'])) return false;
    if (!isArray(obj.user) || !isArrayWithValues(obj.lamden)) return false;
    if (!isStringWithValue(obj.current)) return false;
    return true;
}
