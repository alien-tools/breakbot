

async function postComment(bcJson: any, context: any, baseBranch: string) {
    var messageReturned = ""

    //---Format the Json---
    
    // Greetings (optional)
    messageReturned += "### Hello, my name is BreakBot-0 !\n"

    if (bcJson != undefined)
    {
        console.log(bcJson)

        // Base declaration
        const nMax = 10
        const n = bcJson.delta.breakingChanges.length
    
        messageReturned += "This PR introduces **" + n + "** breaking changes in the branch **" + baseBranch + "**, here are a few of them:\n" //+ "\nThe request was computed in " + time + " seconds";
    
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
    const prComment = context.issue(
        {
            body: messageReturned,
        }
    );
    await context.octokit.issues.createComment(prComment);

    //---Post the details as reviews---

}

async function postCheck(bcJson: any, context: any) { //return a 404 error, how to add a body ?
    const owner = context.payload.pull_request.head.repo.owner.login
    const repo = context.payload.pull_request.head.repo.full_name
    console.log(owner + repo)
    await context.octokit.checks.create({
        owner,
        repo
    })
    console.log(bcJson)
}

export {postComment, postCheck}