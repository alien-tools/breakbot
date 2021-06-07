//const fetch = require('node-fetch');
const http = require('http')


async function formattingMessage(baseBranch: string, user: string, repo: string, pullId: number) {
    var n = 0; //will be updated with the api request
    var messageReturned = "";

    //shaping the request  /!\ not clean at all /!\
    const options = {
        hostname: "anatman.ddns.net",
        port: 8080,
        path: "/github/pr/" + user + "/" + repo + "/" + pullId,
        method: 'GET'
    }

    const req = http.request(options, (res: any) => {

        // Check the status code (if different from 200: do nothing)
        console.log(`statusCode: ${res.statusCode}`)

        res.on('data', (d: any) => {
            console.log("received" + d)
        })
    })

    req.on('error', (error: any) => {
        console.error(error)
    })

    req.end()

    //Greetings (optional)
    messageReturned += "### Hello, my name is BreakBot !\n"

    //Base declaration
    messageReturned += "This PR introduce " + n + " breaking changes in the branch " + baseBranch;

    //Detail on the BC

    return messageReturned;
}

export { formattingMessage };