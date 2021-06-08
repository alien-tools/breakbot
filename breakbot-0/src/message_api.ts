const fetch = require('node-fetch');
//const http = require('http')


async function formattingMessage(baseBranch: string, user: string, repo: string, prId: number, contextPr: any) {
    var n = 0; //will be updated with the api request
    var messageReturned = "";
    var PostSent: boolean = false;
    var DatasReceived: boolean = false;
    var time = 0;

    var intervalID: any;

    const createComment = (resJson: any) => {
        if (DatasReceived) {
            n = resJson.delta.breakingChanges.length

            //Greetings (optional)
            messageReturned += "### Hello, my name is BreakBot !\n"

            //Base declaration
            messageReturned += "This PR introduce " + n + " breaking changes in the branch " + baseBranch //+ "\nThe request was computed in " + time + " seconds";

            //Detail on the BC
        }
        else
            messageReturned = "An error occured"
        
        const prComment = contextPr.issue({
            body: messageReturned,
        });
        contextPr.octokit.issues.createComment(prComment);
    }

    //shaping the request  /!\ not clean at all /!\
    const destUrl = 'http://anatman.ddns.net:8080/github/pr/' + user + "/" + repo + "/" + prId

    // polling fct
    const poll = async () => {
        fetch(destUrl, { method: 'GET' })
            .then((res: any) => {
                console.log("Status get: " + res.status)
                if (res.status == 200) {
                    clearInterval(intervalID)
                    DatasReceived = true
                }
                return res.json()
            })
            .then((json: any) => createComment(json))
            .catch((err: any) => {
                console.error(err)
                clearInterval(intervalID)
            })
    }

    // first contact with Maracas
    await fetch(destUrl, { method: 'POST' })
        .then((res: any) => {
            console.log("Status post: " + res.status)
            if (res.status == 202) {
                PostSent = true
            }
        })
        .catch((err: any) => {
            console.error(err)
        })
    
    if (PostSent)
        intervalID = setInterval(poll,2*1000)

    return messageReturned;
}

export { formattingMessage };