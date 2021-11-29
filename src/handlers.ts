import { Octokit } from '@octokit/core';
import { createAppAuth } from '@octokit/auth-app';
import { createCheck, finalUpdate } from './checks';
import sendRequest from './maracas';
import PullRequest from './pullRequest';
import { readConfigFile } from './config';
import { Request } from 'express';
import { Context } from 'probot';

export async function handleMaracasPost(req: Request) {
  const repository = `${req.params.owner}/${req.params.repo}`;
  const prNb = parseInt(req.params.prNb);

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

  const bbCheck = checks.find((check: any) => check.app.id.toString() === process.env.APP_ID);

  if (bbCheck) {
    console.log(`[handlers] Found check ID ${bbCheck.id}`);
    const pr = new PullRequest(
      repository,
      parseInt(req.header('installationId') ?? '-1'),
      prNb,
      headSHA,
    );

    await finalUpdate(octokit, pr, bbCheck.id, config, req.body);
  } else {
    console.log('[handlers] No check found.');
  }
}

export async function handlePullRequestWebhook(context: Context) {
  console.log('[handlers] Invoked from "pull_request" webhook');

  const repository = context.payload.pull_request.base.repo.full_name;
  const pr = new PullRequest(
    repository,
    context.payload.installation.id,
    context.payload.number,
    context.payload.pull_request.head.sha,
  );

  const checkId = await createCheck(context, pr);
  await sendRequest(context, pr, checkId);
}

export async function handleCheckWebhook(context: Context) {
  console.log('[handlers] Invoked from "check_run" or "rerun" webhook');

  const repository = context.payload.repository.full_name;
  const headSHA = context.payload.check_run.head_sha;
  const repoPRs = await context.octokit.request(`GET /repos/${repository}/pulls`);
  const thisPR = repoPRs.data.find((p: any) => p.head.sha === headSHA);

  const pr = new PullRequest(
    repository,
    context.payload.installation.id,
    thisPR.number,
    headSHA,
  );

  const checkId = await createCheck(context, pr);
  await sendRequest(context, pr, checkId);
}
