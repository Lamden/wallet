import '../img/icon-128.png'
import '../img/icon-34.png'

import { messagesHandler  } from './backgroundControllers/messagesHandler.js'
import { masterController  } from './backgroundControllers/masterController.js'
import runPriceService from './services/priceService'

runPriceService()
const messages = messagesHandler(Object.freeze(masterController()))