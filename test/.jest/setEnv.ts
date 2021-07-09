import * as globalVars from '../globalVarsTests'

process.env.APP_ID = globalVars.appId.toString()
process.env.PRIVATE_KEY = globalVars.privateKey
process.env.MARACAS_URL = globalVars.maracasUrl
process.env.WEBHOOK_PROXY_URL = globalVars.callbackUrl