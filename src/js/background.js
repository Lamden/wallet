import '../img/icon-128.png'
import '../img/icon-34.png'

import { messagesHandler  } from './backgroundControllers/messagesHandler.js'
import { masterController  } from './backgroundControllers/masterController.js'

const controller = masterController()
const messages = messagesHandler(controller)