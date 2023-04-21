const nodeCryptoJs = require("node-cryptojs-aes")
const { CryptoJS, JsonFormatter } = nodeCryptoJs;

const validators = require('types-validate-assert')
const { validateTypes, assertTypes } = validators;

const Lamden = require('lamden-js').default
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
    let kwargs = {}
    kwargsList.forEach(item => {
        if (item.value !== "" && typeof item.value !== 'undefined') {
            if (item.type === "Any" && item.selectedType) {
                kwargs[item.name] = Encoder(item.selectedType, item.value);
              } else {
                kwargs[item.name] = Encoder(item.type, item.value);
            }
        }
    })
    return kwargs;
}

const encodeLocaleDateTime = (value) => {
    const isDate = () => {
        return value instanceof Date; 
    }
    value = !isDate() ? new Date(value) : value
    if (!isDate()) throw Error()
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
        for (var i = numParts[1].length - 1; numParts[1][i] === '0' && typeof numParts[1][i] !== "undefined"; i-- ){
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
    value = Encoder('bigNumber', stringToFixed(value.toString(), 8))
    return value.toFormat({  decimalSeparator: '.', groupSeparator: ',', groupSize: 3})
}

const calcValue = (amout, price, dp=2, format=true) => {
    if (!Encoder.BigNumber.isBigNumber(amout)) amout = Encoder('bigNumber', amout)
    if (!Encoder.BigNumber.isBigNumber(price)) price = Encoder('bigNumber', price)
    amout = Encoder('bigNumber', stringToFixed(amout.toString(), 8))
    price = Encoder('bigNumber', stringToFixed(price.toString(), 8))
    if (!format) {
        let value = amout.multipliedBy(price)
        return value
    }
    if (dp) {
        let value = amout.multipliedBy(price).toFormat(dp, {decimalSeparator: '.', groupSeparator: ',', groupSize: 3})
        return value
    } else {
        let value = amout.multipliedBy(price).toFormat({decimalSeparator: '.', groupSeparator: ',', groupSize: 3})
        return value
    }
}

const createCharmKey = (info, vk) => {
    let key = ''
    if (typeof info.key !== 'undefined' && typeof info.key === 'string'){
        key = info.key.replace("<wallet vk>", vk)
    }
    return key;
}

const repalceVariablesInIconPath = (iconPath, vk) => {
    if (!iconPath) return false
    const variableMapping = {
        '<wallet vk>': vk
    }
    Object.keys(variableMapping).forEach(variable => {
        iconPath = iconPath.replace(variable, variableMapping[variable])
    })
    return iconPath
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
    let response = await networkObj.getVariable(contractName, variableName, key)
    if (!response) return defaults[format];
    if (response.__fixed__) return response.__fixed__
    return response
}

const displayBalanceToFixed = (value, precision) => displayBalance(stringToFixed(value, precision))

const getTokenTotalBalance = (netKey, contractName, tokenBalanceTotals) => {
    if (!tokenBalanceTotals) return Encoder('bigNumber', 0)
    if (!tokenBalanceTotals[netKey]) return Encoder('bigNumber', 0)
    return Encoder('bigNumber', tokenBalanceTotals[netKey][contractName]) || Encoder('bigNumber', 0)
}
const getTokenBalance = (netKey, vk, contractName, tokenBalancesStore) => {
    if (!tokenBalancesStore[netKey]) return Encoder('bigNumber', 0)
    if (!tokenBalancesStore[netKey][vk]) return Encoder('bigNumber', 0)
    if (!tokenBalancesStore[netKey][vk][contractName]) return Encoder('bigNumber', 0)
    return Encoder('bigNumber', tokenBalancesStore[netKey][vk][contractName])
}

const formatAccountAddress = (account, lsize = 4, rsize = 4) => {
    return account.substring(0, lsize) + '...' + account.substring(account.length - rsize)
  }

const isLamdenKey = ( key ) => {
    if (validateTypes.isStringHex(key) && key.length === 64) return true;
    return false;
};

const dataURLToBlob = function(dataURL) {
    var parts, contentType, raw
    var BASE64_MARKER = ';base64,';
    if (dataURL.indexOf(BASE64_MARKER) == -1) {
        parts = dataURL.split(',');
        contentType = parts[0].split(':')[1];
        raw = parts[1];

        return new Blob([raw], {type: contentType});
    } else {
        parts = dataURL.split(BASE64_MARKER);
        contentType = parts[0].split(':')[1];
        raw = window.atob(parts[1]);
        var rawLength = raw.length;
    
        var uInt8Array = new Uint8Array(rawLength);
    
        for (var i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }
    
        return new Blob([uInt8Array], {type: contentType});
    }
}

const readBlobToFile = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader
    reader.onload = () => {
        resolve(reader.result)
    };
    reader.onerror = () => reject()
    reader.readAsDataURL(blob);
})

const readFileToImage = (file) => new Promise((resolve, reject) => {
    var image = new Image()
    image.onload = () => {
        resolve(image)
    };
    image.onerror = () => reject()
    image.src = file
})

const resizeImage = (image, MAX_IMAGE_SIZE) => {
    var canvas = document.createElement('canvas'),
        max_size = MAX_IMAGE_SIZE,
        width = image.width,
        height = image.height;
    if (width > height) {
        if (width > max_size) {
            height *= max_size / width;
            width = max_size;
        }
    } else {
        if (height > max_size) {
            width *= max_size / height;
            height = max_size;
        }
    }
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d').drawImage(image, 0, 0, width, height);
    var dataUrl = canvas.toDataURL('image/jpeg');
    return dataURLToBlob(dataUrl);
}

const getLogoFromURL = async (tokenInfo, MAX_IMAGE_SIZE) => {
    try{
        const acceptedImageTypes = ["image/jpeg", "image/png", "image/svg"]
        let blob = await fetch(tokenInfo.logo_url).then(res => res.blob())
        if (acceptedImageTypes.includes(blob.type)){
            let file = await readBlobToFile(blob)
            let image = await readFileToImage(file)
            if (image.width >= MAX_IMAGE_SIZE || image.height >= MAX_IMAGE_SIZE) {
                file = await readBlobToFile(resizeImage(image, MAX_IMAGE_SIZE))
            }
            tokenInfo.logo_base64_url = file
            delete tokenInfo.logo_url
            return tokenInfo
        }
    } catch {
        // set default logo
        const genericIcon_base64_svg = "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiPjxjaXJjbGUgc3Ryb2tlPSJub25lIiBmaWxsPSIjOGU3Yjk4IiByPSI0OCUiIGN4PSI1MCUiIGN5PSI1MCUiPjwvY2lyY2xlPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDUwIDUwKSBzY2FsZSgwLjY5IDAuNjkpIHJvdGF0ZSgwKSB0cmFuc2xhdGUoLTUwIC01MCkiIHN0eWxlPSJmaWxsOiNmZmZmZmYiPjxzdmcgZmlsbD0iI2ZmZmZmZiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgdmVyc2lvbj0iMS4xIiBzdHlsZT0ic2hhcGUtcmVuZGVyaW5nOmdlb21ldHJpY1ByZWNpc2lvbjt0ZXh0LXJlbmRlcmluZzpnZW9tZXRyaWNQcmVjaXNpb247aW1hZ2UtcmVuZGVyaW5nOm9wdGltaXplUXVhbGl0eTsiIHZpZXdCb3g9IjAgMCA1OCA4OCIgeD0iMHB4IiB5PSIwcHgiIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIj48ZGVmcz48c3R5bGUgdHlwZT0idGV4dC9jc3MiPgogICAKICAgIC5maWwwIHtmaWxsOiNmZmZmZmZ9CiAgIAogIDwvc3R5bGU+PC9kZWZzPjxnPjxwYXRoIGNsYXNzPSJmaWwwIiBkPSJNMCAyNGMwLC0zMSA1OCwtMzMgNTgsLTEgMCwxOSAtMTksMTggLTIzLDM2IC0yLDkgLTE0LDggLTE0LC0yIDAsLTE3IDE0LC0xOCAyMCwtMjkgNCwtOCAtMywtMTYgLTExLC0xNiAtMTcsMCAtMTEsMTkgLTIyLDE5IC00LDAgLTgsLTMgLTgsLTd6bTI4IDY0Yy0xMiwwIC0xMSwtMTggMCwtMTggMTIsMCAxMiwxOCAwLDE4eiI+PC9wYXRoPjwvZz48L3N2Zz48L2c+PC9zdmc+"
        tokenInfo.logo_base64_svg = genericIcon_base64_svg
        delete tokenInfo.logo_url
        return tokenInfo
    }
}

const toBigNumber = (value) => Encoder('bigNumber', value)

const stringToFixed = (value, precision) => {
	if (Encoder.BigNumber.isBigNumber(value) && precision ) {
        value = value.toFixed(precision)
    }
	if (!value || isNaN(value)) return "0.0"
        var values
		try {
			values = value.split('.')
		} catch {
			values = value.toString().split('.')
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

/**
 * Fetch tokeninfo from rocketswap by contract name.
 * @param {string} contractName Token contract name.
 */
const getTokenFromRocketswap = async (contractName) => {
    const api = `https://rocketswap.exchange:2053/api/token/${contractName}`;
    const result = await fetch(api).then(res => res.json());
    const meta = {
        contractName: result.token.contract_name,
        tokenName: result.token.token_name,
        tokenSymbol: result.token.token_symbol,
        logo_base64_svg: result.token.token_base64_svg,
        logo_base64_png: result.token.token_base64_png,
        logo_url: result.token.token_logo_url
    }
    return meta;
}

const getFiatPrice = async () => {
    try {
        const api = `https://api.exchangerate.host/latest?base=USD`;
        const result = await fetch(api).then(res => res.json());
        if (result.success) {
            return {
                base: result.base,
                date: result.date,
                rates: result.rates,
                success: true
            }
        } else {
            return {
                success: false
            }
        }
    } catch {
        return {
            success: false
        }
    }
}

 const getLastestTauPrice = async () => {
    try {
        const api = `https://rocketswap.exchange:2053/api/tau_last_price`;
        const result = await fetch(api).then(res => res.json());
        return result
    } catch {
        return {
            value: 0
        }
    }
}

const getTokenPrice = async (tokenContractNameList = []) => {
    try {
        const prices = {}
        const api = `https://rocketswap.exchange:2053/api/get_market_summaries_w_token`;
        const result = await fetch(api).then(res => res.json());
        if (Array.isArray(result)) {
            tokenContractNameList.forEach(name => {
                let index = result.findIndex(token => {
                    return name === token.contract_name
                })
                if (index !== -1) {
                    let token = result[index]
                    prices[token.contract_name] = {
                        value: token.Last
                    }
                } else {
                    prices[name] = {
                        value: 0
                    }
                }
            })
        }
        return prices
    } catch {
        return {}
    }
}

function randomString(length) {
    var str = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = length; i > 0; --i) 
        result += str[Math.floor(Math.random() * str.length)];
    return result;
}


function decodePythonTime(value, format) {
    if (!value) return 0
    if (format === 'time') {
        let arr = value.__time__
        arr[1] = arr[1] - 1
        return new Date(...arr).getTime() + new Date().getTimezoneOffset() * 60 * 1000
    } else if (format === 'delta') {
        let arr = value.__delta__
        let timestamp = 0
        for (let i = 0; i<arr.length; i++) {
            switch(i){
                case 0:
                    // days
                    timestamp = timestamp + arr[0] * 24 * 60 * 60 * 1000
                    break
                case 1:
                    // seconds
                    timestamp = timestamp + arr[1] * 1000
                    break
                case 2:
                    // microseconds
                    timestamp = timestamp + arr[2] / 1000
                    break
                case 3: 
                    // milliseconds
                    timestamp = timestamp + arr[3]
                    break
                case 4:
                    // minutes
                    timestamp = timestamp + arr[4] * 60 * 1000
                    break
                case 5:
                    // hours
                    timestamp = timestamp + arr[5] * 60 * 60 * 1000
                    break
                case 6:
                    // weeks
                    timestamp = timestamp + arr[6] * 24 * 60 * 60 * 1000
                    break
                default:
                    break
            }
        }
        return timestamp
    }
}

module.exports = {
    copyToClipboard,
    encryptStrHash, decryptStrHash,
    encryptObject, decryptObject, hashStringValue,
    formatKwargs, longFormTypes, typeToInputTypeMAP, defaultTypeValues,
    Encoder, encodeLocaleDateTime, encodeUTCDateTime, encodeLocaleTimeDelta, 
    displayBalance, displayBalanceToFixed,
    getKeyValue, isLamdenKey,
    createCharmKey, repalceVariablesInIconPath,
    formatValue,
    stringToFixed, 
    toBigNumber,
    getTokenTotalBalance,
    getTokenBalance, formatAccountAddress,
    dataURLToBlob, resizeImage, readFileToImage, readBlobToFile, getLogoFromURL,
    getTokenFromRocketswap,
    getLastestTauPrice,
    getTokenPrice,
    calcValue,
    getFiatPrice,
    randomString,
    decodePythonTime
  }