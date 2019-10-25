const typedFunction = require("./typechecker");
const nodeCryptoJs = require("node-cryptojs-aes")
const { CryptoJS, JsonFormatter } = nodeCryptoJs;

/*
    Creates a dummy DOM node to mount a string to and then copies to the clipboard
    Return: Nothing
*/
function copyToClipboard ( textTOcopy='', callback=undefined ){
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
};

/*
    Encrypt a string using a password string 
    Return: Encrypted String (str)
*/
const encryptStrHash = typedFunction( [ String, String ],  ( password, string )=>{
    const encrypt = CryptoJS.AES.encrypt(string, password).toString();
    return encrypt;
});

/*
    Decrypt a string using a password string 
    Return: Decrypted String (str)
*/
const decryptStrHash = typedFunction( [ String, String ],  ( password, hash )=>{
    const decrypted = CryptoJS.AES.decrypt(hash, password);
    return CryptoJS.enc.Utf8.stringify(decrypted);
});

/*
    Encrypt an Object using a password string 
    Return: Encrypted Object (obj)
*/
const encryptObject = typedFunction( [ String, Object ],  ( password, obj )=>{
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(obj), password, { format: JsonFormatter }).toString();
    return encrypted;
});

/*
    Decrypt an Object using a password string 
    Return: Decrypted Object (obj)
*/
const decryptObject = typedFunction( [ String, String ],  ( password, obj )=>{
    try{
        const decrypt = CryptoJS.AES.decrypt(obj, password, { format: JsonFormatter })
        return JSON.parse(CryptoJS.enc.Utf8.stringify(decrypt));
    } catch (e){
        return false;
    }
});

/*
    Decrypt a File using a password string 
    Return: Decrypted File (obj)
*/
const decryptFile = typedFunction( [ String, Object ],  ( password, file )=>{
    const decrypted = CryptoJS.AES.decrypt(file, password, { format: JsonFormatter });
    return JSON.parse(CryptoJS.enc.Utf8.stringify(decrypted));
});

/*
    Creates a Currency String loacl to the user 
    Return: Currency String (str)
*/
function toCurrencyFormat( value, currency, local ){
    value = value || '0'
    currency = currency || 'USD'
    local = local || undefined
    return value.toLocaleString(local, {
        style: 'currency',
        currency,
    });
};

/*
    Creates a copy of a Coin Object that strips all references.
    Return: Coin Object (ojb)
*/
const stripCoinRef = typedFunction( [ Object ],  (coin )=>{
    let newCoin = JSON.parse(JSON.stringify(coin));
    if (newCoin.swapList) delete newCoin.swapList;
    if (newCoin.txList) delete newCoin.txList;
    if (newCoin.balance) delete newCoin.balance;
    return newCoin;
});

/*
    Validates a string proprty isn't empty, and also trims leading and trailing whitespace
    Return: Trimmed String (str)
*/
const vailidateString = typedFunction( [ String, String ],  (  string, propertyName )=>{
    string = string.trim()
    if (string.length === 0) {
      throw new Error(`${propertyName} field cannot be empty`)
    }
    return string;
});

module.exports = {
    copyToClipboard,
    encryptStrHash, decryptStrHash,
    encryptObject, decryptObject,
    decryptFile,
    toCurrencyFormat,
    stripCoinRef,
    vailidateString
  }