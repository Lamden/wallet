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
    if (isJSON(detail)) {
        lamdenWalletSendTx(detail)}
    else{
        const errors = ['Expected event detail to be JSON string']
        document.dispatchEvent(new CustomEvent('lamdenWalletTxStatus', {detail: {errors, rejected: detail}}));
        return
    }
});

const lamdenWalletSendTx = (detail) => {  
    chrome.runtime.sendMessage({type: 'dAppSendLamdenTransaction', data: detail}, (response) => {
        if (chrome.runtime.lastError) return
        if(response !== 'ok'){
            returnTxStatusToPage(response)
        }
    });
}

const returnTxStatusToPage = (txResult) => {
    if (typeof txResult.data === 'undefined' && typeof txResult.errors !== 'undefined'){
        txResult = { status: "error", errors: txResult.errors}
    }else{
        try{
            txResult.status = txResult.data.resultInfo.type
        }catch (e) {
            txResult.status = txResult.data.status
        }
    }

    document.dispatchEvent(new CustomEvent('lamdenWalletTxStatus', {detail: txResult}));
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    //Accept only messages from extention background script
    if(sender.id === chrome.runtime.id && sender.origin === "null"){
        if (message.type === "txStatus"){
            delete message.type
            returnTxStatusToPage(message)
        }

        if (message.type === "sendWalletInfo"){
            getWalletInfo();
        }

        if (message.type === 'sendErrorsToTab'){
            document.dispatchEvent(new CustomEvent('lamdenWalletInfo', {detail: message.data}));
            sendResponse('ok')
        }
    }
});