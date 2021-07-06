import * as checksManagement from "./checksManagement";
import * as Maracas from "./Maracas";
import { webhookDatas, reportDatas } from "./authDatas";


export async function maracasHandler(req: any) {

    var myDatas = reportDatas.fromPost(`${req.params.owner}/${req.params.repo}`, req.headers.installationid, req.params.prNb)

    // not complete /!\
    await myDatas.getConfig()
    await myDatas.getCheck()

    checksManagement.finalUpdate(myDatas, req.body)
}

export async function webhookHandler(context: any) {

    if (context.name == 'pull_request') {
        var myDatas = webhookDatas.fromPr(context)
    }
    else if (context.name == 'check_run' && context.payload.requested_action?.identifier == "rerun") {
        var myDatas = webhookDatas.fromCheck(context)
        await myDatas.getPrNb()
    }
    else { //in case sth went wrong
        console.log(`[webhookHandler] Something went wrong, the context came from: ${context.name}`)
        return
    }

    await myDatas.getConfig()

    myDatas = await checksManagement.createCheck(myDatas) // can't createCheck act on our datas ?

    await Maracas.sendRequest(myDatas)
}  