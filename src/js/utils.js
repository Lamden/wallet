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
    password = vailidateString(password, 'password', false)
    string = vailidateString(string, 'string', false)
    const encrypt = CryptoJS.AES.encrypt(string, password).toString();
    return encrypt;
});

/*
    Decrypt a string using a password string 
    Return: Decrypted String (str)
*/
const decryptStrHash = typedFunction( [ String, String ],  ( password, encryptedString )=>{
    password = vailidateString(password, 'password', false)
    encryptedString = vailidateString(encryptedString, 'encryptedString', false)
    
    try{
        const decrypted = CryptoJS.AES.decrypt(encryptedString, password);
        return CryptoJS.enc.Utf8.stringify(decrypted) === '' ? false : CryptoJS.enc.Utf8.stringify(decrypted);
    } catch (e) {
        console.log(e)
        return false;
    }
});

/*
    Encrypt an Object using a password string 
    Return: Encrypted Object (obj)
*/
const encryptObject = typedFunction( [ String, Object ],  ( password, obj )=>{
    password = vailidateString(password, 'password', false)
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(obj), password, { format: JsonFormatter }).toString();
    return encrypted;
});

/*
    Decrypt an Object using a password string 
    Return: Decrypted Object (obj)
*/
const decryptObject = typedFunction( [ String, String ],  ( password, objString )=>{
    password = vailidateString(password, 'password', false)
    objString = vailidateString(objString, 'objString', false)
    try{
        const decrypt = CryptoJS.AES.decrypt(objString, password, { format: JsonFormatter })
        return JSON.parse(CryptoJS.enc.Utf8.stringify(decrypt));
    } catch (e){
        return false;
    }
});

/*
    Validates a string proprty isn't empty, and also trims leading and trailing whitespace
    Return: Trimmed String (str)
*/
const vailidateString = typedFunction( [ String, String, Boolean ],  (  string, propertyName, trim )=>{
    if (trim) string = string.trim()
    if (string.length === 0) {
      throw new Error(`${propertyName} field cannot be empty`)
    }
    return string;
});

module.exports = {
    copyToClipboard,
    encryptStrHash, decryptStrHash,
    encryptObject, decryptObject,
    vailidateString
  }