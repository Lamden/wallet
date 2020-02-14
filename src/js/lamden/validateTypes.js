export class ValidateTypes {
    constructor(){}
    //Validation functions
    hasKeys(object, keys){
        if(keys.map(key => key in object).includes(false)) return false;
        return true;
    }

    isObject(value){
        if(Object.prototype.toString.call(value) === "[object Object]") return true;
        return false;
    }

    isFunction(value){
        if(Object.prototype.toString.call(value) === "[object Function]") return true;
        return false;
    }

    isString(value){
        if(Object.prototype.toString.call(value) === "[object String]") return true;
        return false;
    }

    isBoolean(value){
        if(Object.prototype.toString.call(value) === "[object Boolean]") return true;
        return false;
    }

    isArray(value){
        if(Object.prototype.toString.call(value) === "[object Array]") return true;
        return false;  
    }

    isNumber(value){
        if(Object.prototype.toString.call(value) === "[object Number]") return true;
        return false;  
    }

    isInteger(value){
        if(Object.prototype.toString.call(value) === "[object Number]" && Number.isInteger(value)) return true;
        return false;  
    }

    isStringHex(string) {
        if (!this.isStringWithValue(string)) return false;
        let hexRegEx = /([0-9]|[a-f])/gim;
        return (string.match(hexRegEx) || []).length === string.length;
    }

    isStringWithValue(value){
        if (this.isString(value) && value !== '') return true;
        return false;
    }

    isObjectWithKeys(value){
        if (this.isObject(value) && Object.keys(value).length > 0) return true;
        return false;
    }

    isArrayWithValues(value){
        if (this.isArray(value) && value.length > 0) return true;
        return false;
    }

    isSpecificClass(object, className){
        if (!this.isObject(object)) return false;
        if (object.constructor.name !== className) return false;
        return true
    }

    isPageInfoObj(pageInfoObj){
        //Reject undefined or missing info.
        if (!this.isObjectWithKeys(pageInfoObj)) return false;
        if(!this.hasKeys(pageInfoObj, ['name'])) return false;
        if (!this.isStringWithValue(pageInfoObj.name)) return false;
        return true;
    }

    isStorageObj(storageObj){
        //Reject undefined or missing info.
        if (!this.isObjectWithKeys(storageObj)) return false;
        if(!this.hasKeys(storageObj, ['used', 'remaining', 'max'])) return false;
        if (isNaN(storageObj.used) || isNaN(storageObj.remaining) || isNaN(storageObj.max)) return false;
        return true;
    }

    isFileObj(name, code, methods, networkObj){
        if (!this.isStringWithValue(name)) return false;
        if (!this.isString(code)) return false;
        if (!this.isArray(methods)) return false;
        if(!this.isNetworkObject(networkObj)) return false;
        return true
    }

    isTxDataObj(txDataObj){
        if (!this.isObjectWithKeys(txDataObj)) return false;
        if (!this.hasKeys(txDataObj, ['network', 'sender'])) return false;
        if (!this.isStringWithValue(txDataObj.network.ip)) return false;
        if (!this.isStringWithValue(txDataObj.network.port)) return false;
        if (!this.isStringWithValue(txDataObj.sender.vk)) return false;
        return true;
    }
    isCoinInfoObj(coinInfoObj){
        if (!this.isObjectWithKeys(coinInfoObj)) return false;
        if (!this.hasKeys(coinInfoObj, ['network', 'name', 'nickname', 'symbol', 'vk'])) return false;
        if (!this.isStringWithValue(coinInfoObj.network)) return false;
        if (!this.isStringWithValue(coinInfoObj.name)) return false;
        if (!this.isString(coinInfoObj.nickname)) return false;
        if (!this.isStringWithValue(coinInfoObj.symbol)) return false;
        if (!this.isStringWithValue(coinInfoObj.vk)) return false;
        return true;
    }

    isNetworkObject(networkObj){
        if (!this.isObject(networkObj)) return false;
        if (!isSpecificClass(networkObj, "Network")) return false;
        return true
    }

    isSettingsStoreObj(obj){
        if (!this.isObjectWithKeys(obj)) return false;
        if (!this.hasKeys(obj, ['currentPage', 'firstRun', 'themeStyle', 'version', 'storage'])) return false;
        if (!this.isPageInfoObj(obj.currentPage)) return false;
        if (!this.isStorageObj(obj.storage)) return false;
        if (!this.isStringWithValue(obj.version)) return false;
        if (!this.isStringWithValue(obj.themeStyle)) return false;
        if (!this.isBoolean(obj.firstRun)) return false;
        return true;
    }

    isNetworkStoreObj(obj){
        if (!this.isObjectWithKeys(obj)) return false;
        if (!this.hasKeys(obj, ['user', 'lamden', 'current'])) return false;
        if (!this.isArray(obj.user) || !this.isArrayWithValues(obj.lamden)) return false;
        if (!this.isStringWithValue(obj.current)) return false;
        return true;
    }
}