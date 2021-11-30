import { Octokit } from '@octokit/core';
import { Context } from 'probot';
import { ProbotOctokit } from 'probot/lib/octokit/probot-octokit';

import writeReport from './report';
import PullRequest from './pullRequest';
import BreakbotConfig from './config';

export async function createCheck(
  context: Context<'pull_request'>,
): Promise<number> {
  context.log('Creating a new check');

  const res = await context.octokit.checks.create({
    owner: context.payload.pull_request.base.repo.owner.login,
    repo: context.payload.pull_request.base.repo.name,
    name: 'BreakBot report',
    head_sha: context.payload.pull_request.head.sha,
    status: 'queued',
    output: {
      title: 'Sending analysis request to Maracas...',
      summary: '',
    },
  });

  context.log(`New check created; ID: ${res.data.id}`);
  return res.data.id;
}

export async function updateCheck(
  octokit: InstanceType<typeof ProbotOctokit>,
  owner: string,
  repo: string,
  checkId: number,
): Promise<void> {
  await octokit.checks.update({
    owner,
    repo,
    check_run_id: checkId,
    status: 'in_progress',
    output: {
      title: 'Analyzing the PR with Maracas...',
      summary: '',
    },
  });
}

export async function failedCheck(
  octokit: InstanceType<typeof ProbotOctokit>,
  owner: string,
  repo: string,
  checkId: number,
  message: string,
): Promise<void> {
  await octokit.checks.update({
    owner,
    repo,
    check_run_id: checkId,
    status: 'completed',
    conclusion: 'cancelled',
    output: {
      title: 'Maracas returned an error',
      summary: message,
    },
  });
}

export async function finalizeCheck(
  octokit: Octokit,
  pr: PullRequest,
  checkId: number,
  config: BreakbotConfig,
  report: any,
): Promise<void> {
  octokit.log.info(`Finalizing report for check #${checkId}`);

  const actions = [{
    label: 'Re-analyze pull request',
    description: 'Re-analyze pull request',
    identifier: 'rerun',
  }];

  const [
    title,
    summary,
    text,
  ] = writeReport(report, config.maxBCs, config.maxClients, config.maxDetections);

  const newCheck = {
    status: 'completed',
    conclusion: 'neutral',
    output: {
      title,
      summary,
      text,
    },
    actions,
  };

  await octokit.request(`PATCH /repos/${pr.repository}/check-runs/${checkId}`, newCheck);

  octokit.log.info(`Check #${checkId} was successfully completed`);
}
