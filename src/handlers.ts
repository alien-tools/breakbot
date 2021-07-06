import { updateCheck, createCheck } from "./checksManagement";
import { webhookDatas, reportDatas } from "./authDatas";
import { pushCheck, pushComment } from "./Maracas";
import { postComment } from "./commentsManagement";

export async function maracasHandler(req: any) {

    var myDatas = reportDatas.fromPost(`${req.params.owner}/${req.params.repo}`, req.headers.installationid, req.params.prNb)

    // not complete /!\
    await myDatas.getConfig()

    if (myDatas.comment) {
        postComment(myDatas, req.body)
    }
    else {
        updateCheck(myDatas, req.body)
    }
}

export async function webhookHandler(context: any) {

    if (context.name == 'pull_request') {
        var myDatas = webhookDatas.fromPr(context)
    }
    else if (context.name == 'check_suite' && context.payload.requested_action?.identifier == "rerun") {
        var myDatas = webhookDatas.fromCheck(context)
        await myDatas.getPrNb()
    }
    else { //in case sth went wrong
        console.log(`[webhookHandler] Something went wrong, the context came from: ${context.name}`)
        return
    }

    await myDatas.getConfig()

    if (myDatas.comment) {
        pushComment(myDatas)
    }
    else {
        myDatas = await createCheck(myDatas) // can't createCheck act on our datas ?

        await pushCheck(myDatas)
    }
}  