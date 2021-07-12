const fetch = require('node-fetch');

import { webhookDatas } from './authDatas';
import * as checksManagement from './checksManagement';


export async function sendRequest(myDatas: webhookDatas) {
    const callbackUrl = `${process.env.WEBHOOK_PROXY_URL}/breakbot/pr/${myDatas.baseRepo}/${myDatas.prNb}`
    const destUrl = `${process.env.MARACAS_URL}/github/pr/${myDatas.baseRepo}/${myDatas.prNb}?callback=${callbackUrl}`

    console.log(`[pushCheck] Dest url is: ${destUrl}`)

    try {
        let result = await fetch(destUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'installationId': myDatas.installationId
            }
        });
        console.log(`[pushCheck] Answer from Maracas (push mode): ${result.status}\n[pushCheck] message: ${result.message}`)
        if (result.status == 202) {
            checksManagement.inProgress(myDatas)
        }
        else {
            console.log(result);
        }
    }
    catch (err: any) {
        console.log(err);
    }
}