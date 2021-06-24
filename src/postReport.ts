import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app"
import { progressCheck, updateCheck} from "./checksUpdates"

async function postComment(bcJson: any, myOctokit: any, owner: string, repo: string, issueNumber: number) {
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
    const prComment =
    {
        owner: owner,
        repo: repo,
        issue_number: issueNumber,
        body: messageReturned,
    };
    await myOctokit.issues.createComment(prComment);

    //---Post the details as reviews---

}

async function createCheck(myOctokit: any, owner: string, repo: string, head_sha: string) {
    const output =
    {
        title: "Sending request to the api...",
        summary: "",
        //text: "### Text \nThis is where we give **lots of** details."
    }

    const check =
    {
        name: "Breakbot report",
        head_sha: head_sha,
        status: "queued",
        output: output
    }

    try {
        myOctokit.request("POST /repos/" + owner + "/" + repo + "/check-runs", check);
    }
    catch (err) {
        console.error(err)
    }
}

const getCheck = async (finished: boolean, owner: string, repo: string, installationId: number, branchName: string, myJson: any, prId: number) => {
    console.log("getCheck starting")
    const appOctokit = new Octokit({
        authStrategy: createAppAuth,
        auth:
        {
            appId: process.env.APP_ID,
            privateKey: process.env.PRIVATE_KEY,
            installationId: installationId
        },
    });

    if (finished) {
        var branchInfos = await appOctokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
            owner: owner,
            repo: repo,
            pull_number: prId
        })
        branchName = branchInfos.data.head.ref
    }

    var resTest = await appOctokit.request("/repos/" + owner + "/" + repo + "/commits/" + branchName + "/check-runs") // branch name is the chosen ref

    var n = resTest.data.total_count
    const checks = resTest.data.check_runs

    console.log("Response status: " + resTest.status + "\nurl of response: " + resTest.url + "\ntotal_count: " + n)

    for (let i = 0; i < n; i++) {
        if (checks[i].app.id == process.env.APP_ID) {
            console.log("The check " + checks[i].name + " with id " + checks[i].id + " is mine !")
            if (finished) {
                updateCheck(appOctokit, owner, repo, checks[i].id, myJson)
            }
            else {
                progressCheck(appOctokit, owner, repo, checks[i].id)
            }
            return
        }
    }
}

export {postComment, createCheck, getCheck}
