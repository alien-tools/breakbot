import { globalVars } from '../globalVarsTests'

var myVars = new globalVars

process.env.APP_ID = myVars.appId.toString()
process.env.PRIVATE_KEY = myVars.privateKey
process.env.MARACAS_URL = myVars.maracasUrl
process.env.WEBHOOK_PROXY_URL = myVars.callbackUrl