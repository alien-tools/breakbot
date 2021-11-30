import { Octokit } from '@octokit/core';
import { createAppAuth } from '@octokit/auth-app';
import { createCheck, failedCheck, finalizeCheck, updateCheck } from './checks';
import requestPRAnalysis from './maracas';
import PullRequest from './pullRequest';
import { readConfigFile } from './config';
import { Request } from 'express';
import { DeprecatedLogger } from 'probot/lib/types';
import { Context } from 'probot';

export async function handleMaracasPost(req: Request, logger: DeprecatedLogger) {
  const repository = `${req.params.owner}/${req.params.repo}`;
  const prNb = parseInt(req.params.prNb);

  logger.log('Attempting to authenticate with Octokit');
  const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: process.env.APP_ID,
      privateKey: process.env.PRIVATE_KEY,
      installationId: req.headers.installationId,
    },
  });

  const config = await readConfigFile(repository, octokit);

  logger.log(`Retrieving headSHA for ${repository}#${prNb}`);
  const prData = await octokit.request(`GET /repos/${repository}/pulls/${prNb}`);
  const headSHA = prData.data.head.sha;

  const checksData = await octokit.request(`GET /repos/${repository}/commits/${headSHA}/check-runs`);
  const total = checksData.data.total_count;
  const checks = checksData.data.check_runs;

  logger.log(`Checks information: total_count=${total} checks=${checks}`);

  const bbCheck = checks.find((check: any) => check.app.id.toString() === process.env.APP_ID);

  if (bbCheck) {
    logger.log(`Found check ID ${bbCheck.id}`);
    const pr = new PullRequest(
      repository,
      parseInt(req.header('installationId') ?? '-1'),
      prNb,
      headSHA,
    );

    await finalizeCheck(octokit, pr, bbCheck.id, config, req.body);
  } else {
    logger.log('No check found.');
  }
}

export async function handlePullRequestWebhook(context: Context<'pull_request'>) {
  const checkId = await createCheck(context);
  const [status, json] = await requestPRAnalysis(
    context.payload.pull_request.base.repo.owner.login,
    context.payload.pull_request.base.repo.name,
    context.payload.pull_request.number,
    context.payload.installation?.id ?? -1,
  );

  const { owner, repo } = context.repo();

  if (status === 202) {
    context.log(`Maracas answered with ${json.message} [${status}]`);
    await updateCheck(context.octokit, owner, repo, checkId);
  } else {
    context.log(`Maracas returned an error: ${json.message}`);
    await failedCheck(context.octokit, owner, repo, checkId, json.message);
  }
}

export async function handleCheckWebhook(context: Context<'check_run'>) {
  const [status, json] = await requestPRAnalysis(
    context.payload.repository.owner.login,
    context.payload.repository.name,
    -1,
    context.payload.installation?.id ?? -1,
  );

  const { owner, repo } = context.repo();
  const checkId = context.payload.check_run.id;

  if (status === 202) {
    context.log(`Maracas answered with ${json.message} [${status}]`);
    await updateCheck(context.octokit, owner, repo, checkId);
  } else {
    context.log(`Maracas returned an error: ${json.message}`);
    await failedCheck(context.octokit, owner, repo, checkId, json.message);
  }
}
