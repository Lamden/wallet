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
        value.getMonth(), 
        value.getDate(), 
        value.getHours(), 
        value.getMinutes(), 
        value.getSeconds(), 
        value.getMilliseconds()
    ]
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

const displayBalance = (value) => {
    if (!value) return '0'
    if (!Encoder.BigNumber.isBigNumber(value)) value = Encoder('bigNumber', value)
    return value.toFormat({  decimalSeparator: '.', groupSeparator: ',', groupSize: 3})
}

module.exports = {
    copyToClipboard,
    encryptStrHash, decryptStrHash,
    encryptObject, decryptObject, hashStringValue,
    formatKwargs, longFormTypes, typeToInputTypeMAP, defaultTypeValues,
    Encoder, encodeLocaleDateTime, encodeLocaleTimeDelta, 
    displayBalance
  }