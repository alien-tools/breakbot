const fetch = require('node-fetch');
import { postComment } from './post_comment'
//const http = require('http')


async function formattingMessage(baseBranch: string, user: string, repo: string, prId: number, contextPr: any) {
    var PostSent: boolean = false;

    var intervalID: any;

    //shaping the request  /!\ not clean at all /!\
    const destUrl = 'http://anatman.ddns.net:8080/github/pr/' + user + "/" + repo + "/" + prId

    // polling fct
    const poll = async () => {
        fetch(destUrl, { method: 'GET' })
            .then((res: any) => {
                console.log("Status get: " + res.status)
                if (res.status == 200) {
                    clearInterval(intervalID)
                }
                return res.json()
            })
            .then((json: any) => postComment(json, contextPr, baseBranch))
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
}

export { formattingMessage };