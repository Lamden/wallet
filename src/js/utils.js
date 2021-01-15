const nodeCryptoJs = require("node-cryptojs-aes")
const { CryptoJS, JsonFormatter } = nodeCryptoJs;

const validators = require('types-validate-assert')
const { validateTypes, assertTypes } = validators;

const Lamden = require('lamden-js')
const { Encoder } = Lamden;

/*
    Creates a dummy DOM node to mount a string to and then copies to the clipboard
    Return: Nothing
*/
const copyToClipboard = ( textTOcopy='', callback=undefined ) => {
    if (validateTypes.isString(textTOcopy)){
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
};

/*
    Encrypt a string using a password string 
    Return: Encrypted String (str)
*/
const encryptStrHash = ( password, string ) => {
    assertTypes.isStringWithValue(password)
    assertTypes.isString(string)

    const encrypt = CryptoJS.AES.encrypt(string, password).toString();
    return encrypt;
};

/*
    Decrypt a string using a password string 
    Return: Decrypted String (str)
*/
const decryptStrHash = ( password, encryptedString ) => {
    assertTypes.isStringWithValue(password)
    assertTypes.isStringWithValue(encryptedString)
    
    try{
        const decrypted = CryptoJS.AES.decrypt(encryptedString, password);
        return CryptoJS.enc.Utf8.stringify(decrypted) === '' ? false : CryptoJS.enc.Utf8.stringify(decrypted);
    } catch (e) {
        console.log(e)
        return false;
    }
};

/*
    Encrypt an Object using a password string 
    Return: Encrypted Object (obj)
*/
const encryptObject = ( password, obj ) => {
    assertTypes.isStringWithValue(password)
    assertTypes.isObject(obj)

    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(obj), password, { format: JsonFormatter }).toString();
    return encrypted;
};

/*
    Decrypt an Object using a password string 
    Return: Decrypted Object (obj)
*/
const decryptObject = ( password, objString )  => {
    assertTypes.isStringWithValue(password)
    assertTypes.isStringWithValue(objString)

    try{
        const decrypt = CryptoJS.AES.decrypt(objString, password, { format: JsonFormatter })
        return JSON.parse(CryptoJS.enc.Utf8.stringify(decrypt));
    } catch (e){
        console.log(e)
        return false;
    }
};

/*
    Create a hash from a string
    Return: MD5 hash
*/
const hashStringValue = (string)  => {
    return CryptoJS.MD5(string).toString(CryptoJS.enc.Hex)
}

const longFormTypes = {
    str: 'Text',
    float: 'Decimal',
    int: 'Integer',
    bool: 'True/False',
    Any: 'Any Value',
    dict: 'Object (JSON)',
    list: 'List (JSON)',
    "datetime.timedelta": 'Time Delta', 
    "datetime.datetime": 'Date / Time',
    timedelta: 'Time Delta',  
    datetime: 'Date / Time'
}

const typeToInputTypeMAP = {
    Any: 'textarea',
    str: 'text',
    float: 'number',
    int: 'number',
    bool: ['true', 'false'],
    dict: 'textarea',
    list: 'textarea',
    "datetime.timedelta": 'text', 
    "datetime.datetime": 'text',
    timedelta: 'text', 
    datetime: 'text'
}

const defaultTypeValues = {
    str: 'text value',
    float: 0.0,
    int: 0,
    bool: [
        {name:'true', value: true, selected: true}, 
        {name: 'false', value: false, selected: false}
    ],
    dict: '{"key": "value"}',
    list: '["item1", "item2"]',
    Any: '',
    timedelta: 'text', 
    datetime: 'text',
    "datetime.timedelta": '', 
    "datetime.datetime": ''
}

const formatKwargs = (kwargsList) => {
    kwargs = {}
    kwargsList.forEach(item => {
        if (item.value !== "" && typeof item.value !== 'undefined') {
            kwargs[item.name] = Encoder(item.type, item.value)
        }
    })
    return kwargs;
}

const encodeLocaleDateTime = (value) => {
    const isDate = () => {
        return value instanceof Date; 
    }
    value = !isDate() ? new Date(value) : value
    if (!isDate()) throwError()
    return [
        value.getFullYear(), 
        value.getMonth()+1, 
        value.getDate(), 
        value.getHours(), 
        value.getMinutes(), 
        value.getSeconds(), 
        value.getMilliseconds()
    ]
}

const encodeUTCDateTime = (value) => {
    let dateValues = Encoder('datetime', value)
    dateValues[1] = dateValues[1] + 1
    return dateValues
}

const encodeLocaleTimeDelta = (value) => {
    const isDate = () => {
        return value instanceof Date; 
    }
    const time = isDate() ? value.getTime() : new Date(value).getTime()
    const days = parseInt(time  / 1000 / 60 / 60 / 24)
    const seconds = (time - (days * 24 * 60 * 60 * 1000)) / 1000
    return [days, seconds]
}

const stripTrailingZero = (value) => {
    const removeZeros = (v) => {
        const numParts = v.split(".")
        let formatted = numParts[1]
        for (i = numParts[1].length - 1; numParts[1][i] === '0' && typeof numParts[1][i] !== "undefined"; i-- ){
            formatted = formatted.slice(0, -1)
        }
        if (formatted === '') return numParts[0]
        return numParts[0] + '.' + formatted
    }
    const isDecmailString = (v) => {
        if (v.includes(".")) return true
        return false
    }
    if (isDecmailString(value)) {
        return removeZeros(value)
    }else{
        return value
    }
}

const displayBalance = (value) => {
    if (!value) return '0'
    if (!Encoder.BigNumber.isBigNumber(value)) value = Encoder('bigNumber', value)
    return value.toFormat({  decimalSeparator: '.', groupSeparator: ',', groupSize: 3})
}

const createCharmKey = (info, vk) => {
    let key = ''
    if (typeof info.key !== 'undefined' && typeof info.key === 'string'){
        key = info.key.replace("<wallet vk>", vk)
    }
    return key;
}

const formatValue = (value, format = undefined) => {
    if (!format) return value
    if (format === 'number' && typeof value === 'string') return stripTrailingZero(value)
    else return value
}

const getKeyValue = async (networkObj, contractName, variableName, key, format = 'string') => {
    const defaults = {
        'number': 0,
        'string': 'None'
    }
    let response = await networkObj.API.getVariable(contractName, variableName, key)
    if (!response) return defaults[format];
    if (response.__fixed__) return response.__fixed__
    return response
}

const stringToFixed = (value, precision) => {
    if (!value) return "0.0"
    try {
      var values = value.split('.')
    } catch {
      var values = value.toString().split('.')
    }
    if (!values[1]) return value
    else {
      if (values[1].length < precision) precision = values[1].length
      let decValue = parseInt(values[1].substring(0, precision))
      if (decValue === 0) return `${values[0]}`
      else {
        let decimals = values[1].substring(0, precision)
        for (let i = precision - 1; i >= 0; i--) {
          if (decimals[i] === '0') precision -= 1
          else i = -1
        }
        return `${values[0]}.${values[1].substring(0, precision)}`
      }
    }
}
const displayBalanceToFixed = (value, precision) => displayBalance(stringToFixed(value, precision))

const getTokenTotalBalance = (netKey, contractName, tokenBalanceTotals) => {
    if (!tokenBalanceTotals) return "0"
    if (!tokenBalanceTotals[netKey]) return "0"
    return tokenBalanceTotals[netKey][contractName] || "0"
}
const getTokenBalance = (netKey, vk, contractName, tokenBalancesStore) => {
    if (!tokenBalancesStore[netKey]) return "0"
    if (!tokenBalancesStore[netKey][vk]) return "0"
    if (!tokenBalancesStore[netKey][vk][contractName]) return "0"
    return tokenBalancesStore[netKey][vk][contractName]
}

const formatAccountAddress = (account, lsize = 4, rsize = 4) => {
    return account.substring(0, lsize) + '...' + account.substring(account.length - rsize)
  }

module.exports = {
    copyToClipboard,
    encryptStrHash, decryptStrHash,
    encryptObject, decryptObject, hashStringValue,
    formatKwargs, longFormTypes, typeToInputTypeMAP, defaultTypeValues,
    Encoder, encodeLocaleDateTime, encodeUTCDateTime, encodeLocaleTimeDelta, 
    displayBalance, displayBalanceToFixed,
    getKeyValue, 
    createCharmKey,
    formatValue,
    stringToFixed,
    getTokenTotalBalance,
    getTokenBalance, formatAccountAddress
  }