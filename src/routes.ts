import { Request, Response } from 'express';
import { DeprecatedLogger } from 'probot/lib/types';
import { Octokit } from '@octokit/core';
import { createAppAuth } from '@octokit/auth-app';
import { readConfigFile } from './config';
import { completeCheck } from './checks';
import { restEndpointMethods } from '@octokit/plugin-rest-endpoint-methods';

export default async function maracasRoute(req: Request, res: Response, logger: DeprecatedLogger) {
  if (process.env.APP_ID === undefined) {
    logger.error('Couldn\'t proceed: APP_ID is undefined');
    return;
  }

  const owner = req.params.owner;
  const repo = req.params.repo;
  const prNb = parseInt(req.params.prNb);
  const appId = parseInt(process.env.APP_ID);

  logger.info(`Maracas sent his report back for ${owner}/${repo}: ${req.body.message}`);
  logger.info('Attempting to authenticate with Octokit');
  const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: process.env.APP_ID,
      privateKey: process.env.PRIVATE_KEY,
      installationId: req.headers.installationId,
    },
  });
  const rest = restEndpointMethods(octokit).rest;

  logger.info(`Retrieving headSHA for ${owner}/${repo}#${prNb}`);
  const prData = await rest.pulls.get({ owner, repo, pull_number: prNb });
  const headSHA = prData.data.head.sha;

  logger.info(`Retrieving checks for ${headSHA}`);
  const check = await rest.checks.listForRef({
    owner,
    repo,
    ref: headSHA,
    app_id: appId,
  });
  const checkId = check.data.check_runs[0].id;
  logger.info(`Found check#${checkId}`);

  logger.info(`Reading .breakbot.yml file`);
  const config = await readConfigFile(octokit, owner, repo, '.breakbot.yml');

  logger.info(`Updating check#${checkId} with the final Maracas report`);
  await completeCheck(octokit, owner, repo, checkId, config, req.body);

  res.status(200);
  res.send('Received');
}
