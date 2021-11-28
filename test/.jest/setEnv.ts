import GlobalVars from '../globalVarsTests'

var myVars = new GlobalVars()

process.env.APP_ID = myVars.appId.toString()
process.env.PRIVATE_KEY = myVars.privateKey
process.env.MARACAS_URL = myVars.maracasUrl
process.env.WEBHOOK_PROXY_URL = myVars.callbackUrl
