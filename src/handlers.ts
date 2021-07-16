import * as checksManagement from "./checksManagement";
import * as maracas from "./maracas";
import { webhookData, reportData } from "./authData";


export async function maracasHandler(req: any) {

    var myDatas = reportData.fromPost(`${req.params.owner}/${req.params.repo}`, req.headers.installationid, req.params.prNb)

    // not complete /!\
    await myDatas.connectToGit()
    await myDatas.getConfig()
    await myDatas.getCheck()

    checksManagement.finalUpdate(myDatas, req.body)
}

export async function webhookHandler(context: any) {

    if (context.name == 'pull_request') {
        console.log(`[webhookHandler] Started in pull_request context`)
        var myDatas = webhookData.fromPr(context)
    }
    else if (context.name == 'check_run' && context.payload.requested_action?.identifier == "rerun") {
        console.log(`[webhookHandler] Started in check_run context`)
        var myDatas = webhookData.fromCheck(context)
        await myDatas.getPrNb()
    }
    else { //in case sth went wrong
        console.log(`[webhookHandler] Something went wrong, the context came from: ${context.name}`)
        return
    }

    await myDatas.getConfig()

    myDatas = await checksManagement.createCheck(myDatas) // can't createCheck act on our datas ?

    await maracas.sendRequest(myDatas)
}  