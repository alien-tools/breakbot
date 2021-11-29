import { failed, inProgress } from './checks';
import PullRequest from './pullRequest';
import { Context } from 'probot';

const fetch = require('node-fetch');

export default async function requestPRAnalysis(context: Context, pr: PullRequest, checkId: number) {
  const callbackUrl = `${process.env.WEBHOOK_PROXY_URL}/breakbot/pr/${pr.repository}/${pr.prNb}`;
  const maracasUrl = `${process.env.MARACAS_URL}/github/pr/${pr.repository}/${pr.prNb}?callback=${callbackUrl}`;

  context.log(`Invoking Maracas at URL ${maracasUrl}`);

  const result = await fetch(maracasUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      installationId: pr.installationId.toString(),
    },
  });

  context.log(`Maracas answered with ${result.status}`);

  if (result.status === 202) {
    await inProgress(context, pr, checkId);
  } else {
    const json: any = await result.json();
    context.log(`[sendRequest] message: ${json.message}`);
    await failed(context, pr, checkId, json.message);
  }
}
