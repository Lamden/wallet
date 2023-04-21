import '../img/icon-128.png'
import '../img/icon-34.png'

import { messagesHandler  } from './backgroundControllers/messagesHandler.js'
import runPriceService from './services/priceService'

runPriceService()
const handle = messagesHandler()

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    handle(message, sender, sendResponse)
    return true
})