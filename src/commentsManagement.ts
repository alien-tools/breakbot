import { reportDatas } from "./authDatas"
import { parseJsonMain } from "./formatJson"

export async function postComment(myDatas: reportDatas, bcJson: any) {
    //const myOctokit = await connectAsApp(myDatas.installationId)

    var messageReturned = ""

    //---Format the Json---

    if (bcJson != undefined) {
        // Log result message
        console.log(`[postComment] Message from Maracas: ${bcJson.message}`)

        // Generic declaration
        const nMax = 10
        const n = bcJson.delta.breakingChanges.length

        messageReturned += `## This PR introduces **${n}** breaking changes in the base branch:`

        // Detail on the BC
        messageReturned += parseJsonMain(bcJson, nMax)
    }
    else {
        messageReturned += "An error occured while building the report"
    }

    //---Post the main report---
    await myDatas.myOctokit.request(`post /repos/${myDatas.baseRepo}/issues/${myDatas.prNb}/comments`, { body: messageReturned });

    //---Post the details as reviews---

}