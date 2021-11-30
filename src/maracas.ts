const fetch = require('node-fetch');

export default async function requestPRAnalysis(
  owner: string,
  repo: string,
  prNumber: number,
  installationId: number,
) {
  const callbackUrl = `${process.env.WEBHOOK_PROXY_URL}/breakbot/pr/${owner}/${repo}/${prNumber}`;
  const maracasUrl = `${process.env.MARACAS_URL}/github/pr/${owner}/${repo}/${prNumber}?callback=${callbackUrl}`;

  const result = await fetch(maracasUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      installationId,
    },
  });

  return [result.status, result.json()];
}
