import { resource } from "selenium-webdriver/http"

//For security only messages in JSON string messages will be passed to the application
const isJSON = (json) => {
	if (Object.prototype.toString.call(json) !== "[object String]") return false
    try{
        return JSON.parse(json)
    }catch (e){ return false}
}

const getWalletInfo = () => {  
    chrome.runtime.sendMessage({type: 'getWalletInfo'}, (response) => {
        if(!chrome.runtime.lastError || response !== 'ok'){
            document.dispatchEvent(new CustomEvent('lamdenWalletInfo', {detail: response}));
        }
    });
}
document.addEventListener('lamdenWalletGetInfo', () => getWalletInfo());

const lamdenWalletConnect = (detail) => {  
    chrome.runtime.sendMessage({type: 'lamdenWalletConnect', data: detail}, (response) => {
        console.log(response)
        if(!chrome.runtime.lastError && response !== 'ok'){
            document.dispatchEvent(new CustomEvent('lamdenWalletInfo', {detail: response}));
        }
    });
}
document.addEventListener('lamdenWalletConnect', (event) => {
    const detail = event.detail
    //If a detail value was passed validate it is a JSON string.  If not then pass back an error to the webpage
    if (isJSON(detail)) lamdenWalletConnect(detail)
    else{
        const errors = ['Expected event detail to be JSON string']
        document.dispatchEvent(new CustomEvent('lamdenWalletInfo', {detail: {errors}}));
        return
    }
});

document.addEventListener('lamdenWalletSendTx', (event) => {
    const detail = event.detail
    //If a detail value was passed validate it is a JSON string.  If not then pass back an error to the webpage
    if (isJSON(detail)) lamdenWalletSendTx(detail)
    else{
        const errors = ['Expected event detail to be JSON string']
        document.dispatchEvent(new CustomEvent('txStatus', {detail: {errors, rejected: detail}}));
        return
    }
});
const lamdenWalletSendTx = (detail) => {  
    chrome.runtime.sendMessage({type: 'dAppSendLamdenTransaction', data: detail}, (response) => {
        if(!chrome.runtime.lastError){
            document.dispatchEvent(new CustomEvent('lamdenWalletTxStatus', {detail: response}));
        }
    });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "txStatus"){
        let detail = {
            status: message.status,
            data: message.data
        }
        if (typeof detail.status === 'undefined' && typeof detail.data.resultInfo !== 'undefined'){
            detail.status = detail.data.resultInfo.type
        }
        document.dispatchEvent(new CustomEvent('lamdenWalletTxStatus', {detail}));
    }

    if (message.type === "sendWalletInfo"){
        getWalletInfo();
    }

    if (message.type === 'sendErrorsToTab'){
        document.dispatchEvent(new CustomEvent('lamdenWalletInfo', {detail: message.data}));
        sendResponse('ok')
    }
});