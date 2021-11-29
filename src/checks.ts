import { Octokit } from '@octokit/core';

import writeReport from './report';
import PullRequest from './pullRequest';
import BreakbotConfig from './config';
import { Context } from 'probot';

export async function createCheck(context: Context, pr: PullRequest): Promise<number> {
  context.log('Creating a new check');

  const output = {
    title: 'Sending request to the api...',
    summary: '',
  };

  const resNewCheck = await context.octokit.checks.create({
    owner: context.repo().owner,
    repo: context.repo().repo,
    name: 'BreakBot report',
    head_sha: pr.headSHA,
    status: 'queued',
    output,
  });
  const checkId = resNewCheck.data.id;
  context.log(`New check created; ID: ${checkId}`);
  return checkId;
}

export async function inProgress(context: Context, pr: PullRequest, checkId: number) {
  const check = {
    status: 'in_progress',
    output: {
      title: 'Maracas is processing...',
      summary: '',
    },
  };

  await context.octokit.request(`PATCH /repos/${pr.repository}/check-runs/${checkId}`, check);
}

export async function finalUpdate(
  octokit: Octokit,
  pr: PullRequest,
  checkId: number,
  config: BreakbotConfig,
  report: any,
) {
  octokit.log.info('Generating a nice Markdown report');

  const myActions = [{
    label: 'Re-analyze pull request',
    description: 'Re-analyze pull request',
    identifier: 'rerun',
  }];

  const [title, summary, text] = writeReport(report, config.maxBCs, config.maxClients, config.maxDetections);

  const newOutput = {
    title,
    summary,
    text,
  };

  const newCheck = {
    status: 'completed',
    conclusion: 'neutral',
    output: newOutput,
    actions: myActions,
  };

  octokit.log.info(`Updating check #${checkId} for ${pr.repository}/${pr.prNb}`);
  await octokit.request(`PATCH /repos/${pr.repository}/check-runs/${checkId}`, newCheck);
}

export async function failed(context: Context, pr: PullRequest, checkId: number, message: string) {
  const check = {
    status: 'completed',
    conclusion: 'cancelled',
    output: {
      title: 'Something went wrong',
      summary: message,
    },
  };

  await context.octokit.request(`PATCH /repos/${pr.repository}/check-runs/${checkId}`, check);
}
