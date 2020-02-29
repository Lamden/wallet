
import * as validators from 'types-validate-assert'
const { validateTypes } = validators; 

export const isPageInfoObj = (pageInfoObj) => {
    //Reject undefined or missing info.
    if (!validateTypes.isObjectWithKeys(pageInfoObj)) return false;
    if(!validateTypes.hasKeys(pageInfoObj, ['name'])) return false;
    if (!validateTypes.isStringWithValue(pageInfoObj.name)) return false;
    return true;
}

export const isStorageObj = (storageObj) => {
    //Reject undefined or missing info.
    if (!validateTypes.isObjectWithKeys(storageObj)) return false;
    if(!validateTypes.hasKeys(storageObj, ['used', 'remaining', 'max'])) return false;
    if (isNaN(storageObj.used) || isNaN(storageObj.remaining) || isNaN(storageObj.max)) return false;
    return true;
}

export const isFileObj = (name, code, methods, networkObj) => {
    if (!validateTypes.isStringWithValue(name)) return false;
    if (!validateTypes.isString(code)) return false;
    if (!validateTypes.isArray(methods)) return false;
    if (!isNetworkObj(networkObj)) return false;
    return true
}

export const isNetworkObj = (networkInfo) => {
    //Reject undefined or missing info
    if (!validateTypes.isObjectWithKeys(networkInfo)) return false;
    if (!validateTypes.isStringWithValue(networkInfo.name)) return false;
    if (!validateTypes.isStringWithValue(networkInfo.host)) return false;
    if (!validateTypes.isStringWithValue(networkInfo.port)) return false;
    return true;
}

export const isTxDataObj = (txDataObj) => {
    if (!validateTypes.isObjectWithKeys(txDataObj)) return false;
    if (!validateTypes.hasKeys(txDataObj, ['network', 'sender'])) return false;
    if (!validateTypes.isStringWithValue(txDataObj.network.ip)) return false;
    if (!validateTypes.isStringWithValue(txDataObj.network.port)) return false;
    if (!validateTypes.isStringWithValue(txDataObj.sender.vk)) return false;
    return true;
}
export const isCoinInfoObj = (coinInfoObj) => {
    if (!validateTypes.isObjectWithKeys(coinInfoObj)) return false;
    if (!validateTypes.hasKeys(coinInfoObj, ['network', 'name', 'nickname', 'symbol', 'vk'])) return false;
    if (!validateTypes.isStringWithValue(coinInfoObj.network)) return false;
    if (!validateTypes.isStringWithValue(coinInfoObj.name)) return false;
    if (!validateTypes.isString(coinInfoObj.nickname)) return false;
    if (!validateTypes.isStringWithValue(coinInfoObj.symbol)) return false;
    if (!validateTypes.isStringWithValue(coinInfoObj.vk)) return false;
    return true;
}

export const isSettingsStoreObj = (obj) => {
    if (!validateTypes.isObjectWithKeys(obj)) return false;
    if (!validateTypes.hasKeys(obj, ['currentPage', 'themeStyle', 'version'])) return false;
    if (!isPageInfoObj(obj.currentPage)) return false;
    if (!validateTypes.isStringWithValue(obj.version)) return false;
    return true;
}

export const isNetworkStoreObj = (obj) => {
    if (!validateTypes.isObjectWithKeys(obj)) return false;
    if (!validateTypes.hasKeys(obj, ['user', 'lamden', 'current'])) return false;
    if (!validateTypes.isArray(obj.user) || !validateTypes.isArrayWithValues(obj.lamden)) return false;
    if (!validateTypes.isStringWithValue(obj.current)) return false;
    return true;
}
