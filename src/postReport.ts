import { authDatas } from "./authClass"

function formatJsonMain(myJson: any, nMax: number){
    var messageReturned = ""

    // To complete with a summary

    // Detail on the BC
    myJson.delta.breakingChanges.slice(0, nMax).forEach((breakingChange: any) => {
        
        messageReturned += `\n### The declaration [${breakingChange.declaration}](${breakingChange.url}) is impacted by _${breakingChange.type}_`
        
        breakingChange.detections.slice(0, nMax).forEach((detection: any) => {
            messageReturned += `\n- Declaration [${detection.elem}](${detection.url}) in [this client](${detection.clientUrl})`
        });

    });

    return messageReturned
}


async function postComment(myDatas: authDatas,bcJson: any) {
    //const myOctokit = await connectAsApp(myDatas.installationId)
    await myDatas.connectToGit()

    var messageReturned = ""

    //---Format the Json---

    if (bcJson != undefined)
    {
        // Log result message
        console.log(`[postComment] Message from Maracas: ${bcJson.message}`)

        // Generic declaration
        const nMax = 10
        const n = bcJson.delta.breakingChanges.length
    
        messageReturned += `## This PR introduces **${n}** breaking changes in the base branch:`
    
        // Detail on the BC
        messageReturned += formatJsonMain(bcJson, nMax)     
    }
    else
    {
        messageReturned += "An error occured while building the report"
    }

    //---Post the main report---
    await myDatas.myOctokit.request(`post /repos/${myDatas.baseRepo}/issues/${myDatas.prNb}/comments`, {body: messageReturned});

    //---Post the details as reviews---

}

async function createCheck(myDatas: authDatas) {
    const output =
    {
        title: "Sending request to the api...",
        summary: ""
    }

    const check =
    {
        name: "Breakbot report",
        head_sha: myDatas.headSHA,
        status: "queued",
        output: output
    }

    try {
        const resNewCheck = await myDatas.myOctokit.request(`POST /repos/${myDatas.baseRepo}/check-runs`, check);
        myDatas.checkId = resNewCheck.data.id
    }
    catch (err) {
        console.error(err)
    }

    return myDatas
}



export {postComment, createCheck, formatJsonMain}
