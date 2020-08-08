
const validators = require('types-validate-assert')
const { validateTypes } = validators
import { encryptObject, decryptObject, encryptStrHash, decryptStrHash, hashStringValue } from '..//utils.js';
import Lamden from 'lamden-js'
import Ethereum from '../crypto/ethereum'

export const controllerUtils = (() => {

    const isJSON = (json) => {
        if (Object.prototype.toString.call(json) !== "[object String]") return false
        try{
            return JSON.parse(json)
        }catch (e){ return false}
    }
    
    const stripRef = (value) => {
        return JSON.parse(JSON.stringify(value))
    }
    
    const addCharAtEnd = (string, char) => {
        if (string.charAt(string.length-1) === char) return string
        return string + char
    }
    
    const addCharAtStart = (string, char) => {
        if (string.charAt(0) === char) return string
        return char + string
    }
    const networkKey = (networkObj) => {
        return `${networkObj.name}|${networkObj.type}|${networkObj.lamden ? 'lamden': 'user'}`
    }

    const createUID = () => hashStringValue(new Date().toISOString())

    //Send a message to the tab that the App currently open in
    const sendMessageToApp = (type, data) => {
        const appTab = `${window.location.origin}/app.html`
        chrome.windows.getAll({populate:true},function(windows){
            windows.forEach((window) => {
                window.tabs.forEach((tab) => {
                    var urlObj = new URL(tab.url)
                    if (appTab === urlObj.href){
                        chrome.tabs.sendMessage(tab.id, {type, data});  
                    }
                });
            });
        });
    }
    //send a message to our content script that exists in any tab
    const sendMessageToTab = (url, type, data) => {
        chrome.windows.getAll({populate:true},function(windows){
            windows.forEach((window) => {
                window.tabs.forEach((tab) => {
                    var urlObj = new URL(tab.url)
                    if (url === urlObj.origin){
                        chrome.tabs.sendMessage(tab.id, {type, data});  
                    }
                });
            });
        });
    }

    return {
        isJSON, 
        stripRef, 
        createUID,
        addCharAtEnd, 
        addCharAtStart, 
        validateTypes,
        encryptObject, 
        decryptObject, 
        encryptStrHash,
        decryptStrHash, 
        hashStringValue,
        networkKey,
        Lamden,
        Ethereum,
        sendMessageToApp,
        sendMessageToTab
    }
})()
