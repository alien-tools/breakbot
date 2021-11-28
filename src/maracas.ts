import webhookData from './webhookData';
import * as checksManagement from './checksManagement';

const fetch = require('node-fetch');

export default async function sendRequest(myDatas: webhookData) {
  const callbackUrl = `${process.env.WEBHOOK_PROXY_URL}/breakbot/pr/${myDatas.baseRepo}/${myDatas.prNb}`;
  const destUrl = `${process.env.MARACAS_URL}/github/pr/${myDatas.baseRepo}/${myDatas.prNb}?callback=${callbackUrl}`;

  console.log(`[sendRequest] Dest url is: ${destUrl}`);

  try {
    const result = await fetch(destUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        installationId: myDatas.installationId.toString(),
      },
    });

    console.log(`[sendRequest] Status from Maracas: ${result.status}`);

    if (result.status === 202) {
      await checksManagement.inProgress(myDatas);
    } else {
      const json: any = await result.json();
      console.log(`[sendRequest] message: ${json.message}`);
      await checksManagement.failed(myDatas, json.message);
    }
  } catch (err: any) {
    console.log(err);
  }
}
