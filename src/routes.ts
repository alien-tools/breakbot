import { Request, Response } from 'express';
import { DeprecatedLogger } from 'probot/lib/types';
import { Octokit } from '@octokit/core';
import { createAppAuth } from '@octokit/auth-app';
import { readConfigFile } from './config';
import PullRequest from './pullRequest';
import { finalizeCheck } from './checks';

export default async function maracasRoute(req: Request, res: Response, logger: DeprecatedLogger) {
  logger(`Maracas sent his report back: ${req.body.message}`);

  const repository = `${req.params.owner}/${req.params.repo}`;
  const prNb = parseInt(req.params.prNb);

  logger('Attempting to authenticate with Octokit');
  const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: process.env.APP_ID,
      privateKey: process.env.PRIVATE_KEY,
      installationId: req.headers.installationId,
    },
  });

  const config = await readConfigFile(repository, octokit);

  logger(`Retrieving headSHA for ${repository}#${prNb}`);
  const prData = await octokit.request(`GET /repos/${repository}/pulls/${prNb}`);
  const headSHA = prData.data.head.sha;

  const checksData = await octokit.request(`GET /repos/${repository}/commits/${headSHA}/check-runs`);
  const total = checksData.data.total_count;
  const checks = checksData.data.check_runs;

  logger(`Checks information: total_count=${total} checks=${checks}`);

  const bbCheck = checks.find((check: any) => check.app.id.toString() === process.env.APP_ID);

  if (bbCheck !== undefined) {
    logger(`Found check ID ${bbCheck.id}`);

    const installationId = req.headers['installationId'];
    if (installationId !== undefined) {

      const pr = new PullRequest(
        repository,
        parseInt(installationId as string),
        prNb,
        headSHA,
      );

      await finalizeCheck(octokit, pr, bbCheck.id, config, req.body);
    }
  } else {
    logger('No check found.');
  }

  res.status(200);
  res.send('Received');
}
