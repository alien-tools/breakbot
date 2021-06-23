async function postComment(bcJson: any, myOctokit: any, owner: string, repo: string, issueNumber: number) {
    var messageReturned = ""

    //---Format the Json---
    
    // Greetings (optional)
    messageReturned += "### Hello, my name is BreakBot-0 !\n"

    if (bcJson != undefined)
    {
        // Generic declaration
        const nMax = 10
        const n = bcJson.breakingChanges.length
    
        messageReturned += "This PR introduces **" + n + "** breaking changes in the base branch, here are a few of them:\n" //+ "\nThe request was computed in " + time + " seconds";
    
        // Detail on the BC
        for (let i = 0; i < n; i++) {
            if (i < nMax) {
                messageReturned += "\n-  The declaration [" + bcJson.breakingChanges[i].declaration + "]"
                messageReturned += "(" + bcJson.breakingChanges[i].url + ")"
                messageReturned += " is impacted by **" + bcJson.breakingChanges[i].type + "**"
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

async function postCheck(bcJson: any, context: any) {
    // generates reports as checks instead of comments, not tested
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
