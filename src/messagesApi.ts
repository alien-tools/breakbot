const fetch = require('node-fetch');

import { postComment } from './postReport'
import payload from "../test/fixtures/maracas.v1.json"; //for test purpose
import { authDatas } from './authClass';
import { progressCheck } from './checksUpdates';


async function testInteraction(contextPr: any)
{
    const temp = contextPr.payload.pull_request;

    var myDatas = new authDatas()
    myDatas.baseRepo = temp.base.repo.full_name
    //to complete ?

    await postComment(myDatas, payload)
}

/*
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
}*/

async function pushComment(myDatas: authDatas)
{
    const callbackUrl = `${process.env.WEBHOOK_PROXY_URL}/breakbot/pr/${myDatas.baseRepo}/${myDatas.prNb}`
    const destUrl = `${process.env.MARACAS_URL}/github/pr/${myDatas.baseRepo}/${myDatas.prNb}?callback=${callbackUrl}`

    await fetch(destUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'installationId': myDatas.installationId
        }
    }).then((res: any) => {
        console.log(`[pushComment] Request status: ${res.status}`)
    })
    .catch((err: any) => 
    {
        console.error(err)
    })
}

async function pushCheck(myDatas: authDatas) {
    const callbackUrl = `${process.env.WEBHOOK_PROXY_URL}/breakbot/pr/${myDatas.baseRepo}/${myDatas.prNb}`
    const destUrl = `${process.env.MARACAS_URL}/github/pr/${myDatas.baseRepo}/${myDatas.prNb}?callback=${callbackUrl}`

    console.log(`[pushCheck] Dest url is: ${destUrl}`)

    await fetch(destUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'installationId': myDatas.installationId
        }
    }).then((res: any) => {
        console.log(`[pushCheck] Answer from Maracas (push mode): ${res.status}\n[pushCheck] message: ${res.message}`)
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

export { testInteraction, pushComment, pushCheck };