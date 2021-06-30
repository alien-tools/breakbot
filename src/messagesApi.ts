const fetch = require('node-fetch');

import { postComment } from './postReport'
import payload from "../test/fixtures/maracas.v1.json"; //for test purpose
import { authDatas } from './authClass';
import { progressCheck } from './checksUpdates';


async function testInteraction(contextPr: any)
{
    const temp = contextPr.payload.pull_request;
    await postComment(payload, contextPr.octokit, temp.owner.login, temp.head.repo.name, temp.number)
}

async function pollInteraction(owner: string, repo: string, prId: number, contextPr: any)
{
    var postSent: boolean = false;
    const temp = contextPr.payload.pull_request;
    var intervalID: any;
    const destUrl = process.env.MARACAS_URL + "/" + owner + "/" + repo + "/" + prId

    const poll = async () =>
    {
        fetch(destUrl, { method: 'GET' })
            .then((res: any) => {
                //console.log("Status get" + res.status)
                if (res.status == 200) {
                    clearInterval(intervalID)
                }
                return res.json()
            })
            .then((json: any) => postComment(json, contextPr.octokit, temp.owner.login, temp.head.repo.name, temp.number))
            .catch((err: any) => {
                console.error(err)
                clearInterval(intervalID)
            })
    }

    // sending the request to Maracas
    await fetch(destUrl, { method: 'POST' })
        .then((res: any) =>
        {
            //console.log("Status post: " + res.status)
            if (res.status == 202) {
                postSent = true
            }
        })
        .catch((err: any) =>
        {
            console.error(err)
        })
    
    if (postSent)
        intervalID = setInterval(poll,2*1000)
}

async function pushInteractionComment(owner: string, repo: string, prId: number, installationId: number)
{
    const callbackUrl = process.env.WEBHOOK_PROXY_URL + "/breakbot/pr/" + owner + "/" + repo + "/" + prId
    const destUrl = process.env.MARACAS_URL + "/github/pr/" + owner + "/" + repo + "/" + prId + "?callback=" + callbackUrl

    await fetch(destUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'installationId': installationId
        }
    }).then((res: any) => {
        console.log("Status post (push mode): " + res.status)
    })
    .catch((err: any) => 
    {
        console.error(err)
    })
}

async function pushInteractionCheck(myDatas: authDatas) {
    // !!! urls not definitive !!!
    const callbackUrl = process.env.WEBHOOK_PROXY_URL + "/breakbot/pr/" + myDatas.baseRepo + "/" + myDatas.prId 
    const destUrl = process.env.MARACAS_URL + "/github/pr/" + myDatas.baseRepo + "/" + myDatas.prId + "?callback=" + callbackUrl // we should send myDatas.headRepo too

    await fetch(destUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'installationId': myDatas.installationId
        }
    }).then((res: any) => {
        console.log("Answer from Maracas (push mode): " + res.status)
        if (res.status == 202)
        {
            progressCheck(myDatas)
        }
        else {
            // update the check with the message received from maracas
        }
    })
    .catch((err: any) => 
    {
        console.error(err)
    })
}

export { pollInteraction, testInteraction, pushInteractionComment, pushInteractionCheck };