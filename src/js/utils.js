const nodeCryptoJs = require("node-cryptojs-aes")
const { CryptoJS, JsonFormatter } = nodeCryptoJs;

const validators = require('types-validate-assert')
const { validateTypes, assertTypes } = validators;

/*
    Creates a dummy DOM node to mount a string to and then copies to the clipboard
    Return: Nothing
*/
function copyToClipboard ( textTOcopy='', callback=undefined ){
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
function encryptStrHash ( password, string ){
    assertTypes.isStringWithValue(password)
    assertTypes.isString(string)

    const encrypt = CryptoJS.AES.encrypt(string, password).toString();
    return encrypt;
};

/*
    Decrypt a string using a password string 
    Return: Decrypted String (str)
*/
function decryptStrHash ( password, encryptedString ){
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
function encryptObject ( password, obj ){
    assertTypes.isStringWithValue(password)
    assertTypes.isObject(obj)

    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(obj), password, { format: JsonFormatter }).toString();
    return encrypted;
};

/*
    Decrypt an Object using a password string 
    Return: Decrypted Object (obj)
*/
function decryptObject ( password, objString ){
    assertTypes.isStringWithValue(password)
    assertTypes.isStringWithValue(objString)
    console.log(password, objString)
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
function hashStringValue(string){
    return CryptoJS.MD5(string).toString(CryptoJS.enc.Hex)
}

module.exports = {
    copyToClipboard,
    encryptStrHash, decryptStrHash,
    encryptObject, decryptObject, hashStringValue
  }