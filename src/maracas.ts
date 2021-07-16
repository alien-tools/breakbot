const fetch = require('node-fetch');

import { webhookData } from './authData';
import * as checksManagement from './checksManagement';


export async function sendRequest(myDatas: webhookData) {
    const callbackUrl = `${process.env.WEBHOOK_PROXY_URL}/breakbot/pr/${myDatas.baseRepo}/${myDatas.prNb}`
    const destUrl = `${process.env.MARACAS_URL}/github/pr/${myDatas.baseRepo}/${myDatas.prNb}?callback=${callbackUrl}`

    console.log(`[sendRequest] Dest url is: ${destUrl}`)

    try {
        let result = await fetch(destUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'installationId': myDatas.installationId
            }
        });
        console.log(`[sendRequest] Status from Maracas: ${result.status}\n[sendRequest] message: ${result.message}`)
        if (result.status == 202) {
            checksManagement.inProgress(myDatas)
        }
        else {
            console.log(`[sendRequest] Status from Maracas: ${result.status}`);
        }
    }
    catch (err: any) {
        console.log(err);
    }
}