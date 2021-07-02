import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app"
import { authDatas } from "./authClass"


const connectAsApp = async function (installationId: number) {

  const appOctokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: process.env.APP_ID,
      privateKey: process.env.PRIVATE_KEY,
      installationId: installationId
    },
  });

  return appOctokit
}


async function postComment(myDatas: authDatas,bcJson: any) {
    //const myOctokit = await connectAsApp(myDatas.installationId)
    await myDatas.connectToGit()

    var messageReturned = ""

    //---Format the Json---
    
    // Greetings (optional)
    messageReturned += "### Hello, my name is BreakBot !\n"

    if (bcJson != undefined)
    {
        // Log result message
        console.log("Received message: " + bcJson.message)

        // Generic declaration
        const nMax = 10
        const n = bcJson.delta.breakingChanges.length
    
        messageReturned += "This PR introduces **" + n + "** breaking changes in the base branch:\n" //+ "\nThe request was computed in " + time + " seconds";
    
        // Detail on the BC
        for (let i = 0; i < n; i++) {
            if (i < nMax) {
                messageReturned += "\n-  The declaration [" + bcJson.delta.breakingChanges[i].declaration + "]"
                messageReturned += "(" + bcJson.delta.breakingChanges[i].url + ")"
                messageReturned += " is impacted by **" + bcJson.delta.breakingChanges[i].type + "**"
            }
        }        
    }
    else
    {
        messageReturned += "An error occured while building the report"
    }

    //---Post the main report---
    await myDatas.myOctokit.request("post /repos/{repo}/issues/{issue_number}/comments",
        {
            repo: myDatas.baseRepo,
            issue_number: myDatas.prNb,
            body: messageReturned,
        });

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
        const resNewCheck = await myDatas.myOctokit.request("POST /repos/" + myDatas.baseRepo + "/check-runs", check);
        myDatas.checkId = resNewCheck.data.id
    }
    catch (err) {
        console.error(err)
    }

    return myDatas
}



export {postComment, createCheck, connectAsApp}
