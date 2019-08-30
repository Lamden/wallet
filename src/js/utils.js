import nodeCryptoJs from 'node-cryptojs-aes';
const { CryptoJS, JsonFormatter } = nodeCryptoJs;

export function copyToClipboard(textTOcopy='', callback=undefined){
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
            new Error('unable to copy')
        }
        if (callback){callback()}
    }
}

export function checkPassword(password, Hash){
    const decrypted = CryptoJS.AES.decrypt(Hash.encode, password, { format: JsonFormatter });
    return JSON.parse(CryptoJS.enc.Utf8.stringify(decrypted));
};

export function createPassword(password, Hash){
    if (!password || !Hash ){
        !password ? new TypeError('password is undefined') : new TypeError('Hash is undefined');
    }else{
        Hash.set({'encode' : CryptoJS.AES.encrypt(JSON.stringify({'date':new Date()}), password, { format: JsonFormatter }).toString() });
    }
};

export function encryptStrHash(password, string){
    const encrypt = CryptoJS.AES.encrypt(string, password).toString();
    return encrypt;
};

export function decryptStrHash(password, hash){
    const decrypted = CryptoJS.AES.decrypt(hash, password);
    return CryptoJS.enc.Utf8.stringify(decrypted);
};