
import * as validators from 'types-validate-assert'
const { validateTypes } = validators; 

export const isPageInfoObj = (pageInfoObj) => {
    //Reject undefined or missing info.
    if (!validateTypes.isObjectWithKeys(pageInfoObj)) return false;
    if(!validateTypes.hasKeys(pageInfoObj, ['name'])) return false;
    if (!validateTypes.isStringWithValue(pageInfoObj.name)) return false;
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
    if (networkInfo.name.includes("|")) return false;
    if (!validateTypes.isArrayWithValues(networkInfo.hosts)) return false;
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
    if (!validateTypes.hasKeys(obj, ['currentPage', 'themeStyle'])) return false;
    if (!isPageInfoObj(obj.currentPage)) return false;
    return true;
}

export const isNetworkStoreObj = (obj) => {
    if (!validateTypes.isObjectWithKeys(obj)) return false;
    if (!validateTypes.hasKeys(obj, ['user', 'lamden', 'current'])) return false;
    if (!validateTypes.isArray(obj.user) || !validateTypes.isArrayWithValues(obj.lamden)) return false;
    if (!validateTypes.isStringWithValue(obj.current)) return false;
    return true;
}
