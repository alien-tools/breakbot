import { Octokit } from '@octokit/core';

import { inProgress, failed } from './checks';
import PullRequest from './pullRequest';

const fetch = require('node-fetch');

export default async function sendRequest(octokit: Octokit, pr: PullRequest, checkId: number) {
  const callbackUrl = `${process.env.WEBHOOK_PROXY_URL}/breakbot/pr/${pr.repository}/${pr.prNb}`;
  const maracasUrl = `${process.env.MARACAS_URL}/github/pr/${pr.repository}/${pr.prNb}?callback=${callbackUrl}`;

  console.log(`[sendRequest] Maracas url is: ${maracasUrl}`);

  try {
    const result = await fetch(maracasUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        installationId: pr.installationId.toString(),
      },
    });

    console.log(`[sendRequest] Status from Maracas: ${result.status}`);

    if (result.status === 202) {
      await inProgress(octokit, pr, checkId);
    } else {
      const json: any = await result.json();
      console.log(`[sendRequest] message: ${json.message}`);
      await failed(octokit, pr, checkId, json.message);
    }
  } catch (err: any) {
    console.log(err);
  }
}
