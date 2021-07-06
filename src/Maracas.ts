const fetch = require('node-fetch');

import { webhookDatas } from './authDatas';
import * as checksManagement from './checksManagement';


export async function pushComment(myDatas: webhookDatas)
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

export async function sendRequest(myDatas: webhookDatas) {
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
            checksManagement.inProgress(myDatas)
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