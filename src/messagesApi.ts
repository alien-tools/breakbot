const fetch = require('node-fetch');

import { postComment } from './postReport'
import payload from "../test/fixtures/maracas.v1.json"; //for test purpose


async function testInteraction(contextPr: any) {
    const temp = contextPr.payload.pull_request;
    await postComment(payload, contextPr.octokit, temp.user.login, temp.head.repo.name, temp.number)
}

async function pollInteraction(user: string, repo: string, prId: number, contextPr: any) {
    var postSent: boolean = false;
    const temp = contextPr.payload.pull_request;
    var intervalID: any;
    const destUrl = process.env.MARACAS_URL + "/" + user + "/" + repo + "/" + prId

    const poll = async () => {
        fetch(destUrl, { method: 'GET' })
            .then((res: any) => {
                //console.log("Status get" + res.status)
                if (res.status == 200) {
                    clearInterval(intervalID)
                }
                return res.json()
            })
            .then((json: any) => postComment(json, contextPr.octokit, temp.user.login, temp.head.repo.name, temp.number))
            .catch((err: any) => {
                console.error(err)
                clearInterval(intervalID)
            })
    }

    // sending the request to Maracas
    await fetch(destUrl, { method: 'POST' })
        .then((res: any) => {
            //console.log("Status post: " + res.status)
            if (res.status == 202) {
                postSent = true
            }
        })
        .catch((err: any) => {
            console.error(err)
        })
    
    if (postSent)
        intervalID = setInterval(poll,2*1000)
}

async function pushInteraction(user: string, repo: string, prId: number, installationId: number) {
    const callbackUrl = process.env.WEBHOOK_PROXY_URL + "/pr/" + user + "/" + repo + "/" + prId
    const destUrl = process.env.MARACAS_URL + "/github/pr/" + user + "/" + repo + "/" + prId + "?callback=" + callbackUrl
    const datas = {
        installationId: installationId
    }

    await fetch(destUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(datas)
    }).then((res: any) => {
        console.log("Status post (push mode): " + res.status)
    })
    .catch((err: any) => {
        console.error(err)
    })
 }

export { pollInteraction, testInteraction, pushInteraction };