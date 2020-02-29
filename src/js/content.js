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
document.addEventListener('getLamdenWalletInfo', () => getWalletInfo());

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

document.addEventListener('signTx', (event) => {
    signData = {type: 'signTx', data: event.detail};
    chrome.runtime.sendMessage(signData, (response) => {
        document.dispatchEvent(new CustomEvent('txStatus', {detail: response}));
    });
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "txStatus"){
        let detail = {
            status: message.status,
            data: message.data
        }
        document.dispatchEvent(new CustomEvent('txStatus', {detail}));
    }

    if (message.type === "sendWalletInfo"){
        getWalletInfo();
    }

    if (message.type === 'sendErrorsToTab'){
        document.dispatchEvent(new CustomEvent('lamdenWalletInfo', {detail: message.data}));
        sendResponse('ok')
    }
});