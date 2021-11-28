import { Octokit } from '@octokit/core';
import { createAppAuth } from '@octokit/auth-app';
import { createCheck, finalUpdate } from './checksManagement';
import sendRequest from './maracas';
import PullRequest from './pullRequest';
import { readConfigFile } from './breakbotConfig';

export async function handleMaracasPost(req: any) {
  const repository = `${req.params.owner}/${req.params.repo}`;
  const prNb = req.params.prNb;

  console.log('[handlers] Authenticating to Octokit');
  const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: process.env.APP_ID,
      privateKey: process.env.PRIVATE_KEY,
      installationId: req.headers.installationId,
    },
  });

  const config = await readConfigFile(repository, octokit);

  console.log(`[handlers] Retrieving headSHA for ${repository}#${prNb}`);
  const prData = await octokit.request(`GET /repos/${repository}/pulls/${prNb}`);
  const headSHA = prData.data.head.sha;

  const checksData = await octokit.request(`GET /repos/${repository}/commits/${headSHA}/check-runs`);
  const total = checksData.data.total_count;
  const checks = checksData.data.check_runs;

  console.log(`[handlers] Checks information: total_count=${total} checks=${checks}`);

  const bbCheck = checks.find((check: any) => check.app.id == process.env.APP_ID);

  if (bbCheck) {
    console.log(`[handlers] Found check ID ${bbCheck.id}`);
    let pr = new PullRequest(
      octokit,
      repository,
      req.headers.installationId,
      prNb,
      headSHA,
    );

    await finalUpdate(pr, bbCheck.id, config, req.body);
  } else {
    console.log('[handlers] No check found.');
  }
}

export async function handlePullRequestWebhook(context: any) {
  console.log('[handlers] Invoked from "pull_request" webhook');

  let repository = context.payload.pull_request.base.repo.full_name;
  let prData = new PullRequest(
    context.octokit,
    repository,
    context.payload.installation.id,
    context.payload.number,
    context.payload.pull_request.head.sha
  );

  let checkId = await createCheck(prData);
  await sendRequest(prData, checkId);
}

export async function handleCheckWebhook(context: any) {
  console.log('[handlers] Invoked from "check_run" or "rerun" webhook');

  const repository = context.payload.repository.full_name;
  const headSHA = context.payload.check_run.head_sha;
  const prs = await context.octokit.request(`GET /repos/${repository}/pulls`);
  const pr = prs.data.find((pr: any) => pr.head.sha === headSHA)

  let prData = new PullRequest(
    context.octokit,
    repository,
    context.payload.installation.id,
    pr.number,
    headSHA
  );

  let checkId = await createCheck(prData);
  await sendRequest(prData, checkId);
}
