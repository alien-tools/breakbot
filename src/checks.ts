import { Octokit } from '@octokit/core';
import { ProbotOctokit } from 'probot/lib/octokit/probot-octokit';

import writeReport from './report';
import BreakbotConfig from './config';
import BreakBotConstants from './settings';

export async function createCheck(
  octokit: InstanceType<typeof ProbotOctokit>,
  owner: string,
  repo: string,
  sha: string,
): Promise<number> {
  const res = await octokit.checks.create({
    owner,
    repo,
    name: BreakBotConstants.REPORT_NAME,
    head_sha: sha,
    status: 'queued',
    output: {
      title: BreakBotConstants.REPORT_QUEUED_TITLE,
      summary: BreakBotConstants.REPORT_QUEUED_SUMMARY,
    },
  });

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
      title: BreakBotConstants.REPORT_INPROGRESS_TITLE,
      summary: BreakBotConstants.REPORT_INPROGRESS_SUMMARY,
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
    actions: [{
      label: 'Re-analyze pull request',
      description: 'Re-analyze pull request',
      identifier: 'rerun',
    }],
  });
}

export async function completeCheck(
  octokit: Octokit,
  owner: string,
  repo: string,
  checkId: number,
  config: BreakbotConfig,
  report: any,
): Promise<void> {
  const [
    title,
    summary,
    text,
  ] = writeReport(report, config.maxBCs, config.maxClients, config.maxDetections);

  /* await restEndpointMethods(octokit).rest.checks.update({
    owner,
    repo,
    check_run_id: checkId,
    status: 'completed',
    conclusion: 'neutral',
    output: {
      title,
      summary,
      text,
    },
    actions: [{
      label: 'Re-analyze pull request',
      description: 'Re-analyze pull request',
      identifier: 'rerun',
    }],
  }); */

  const check = {
    status: 'completed',
    conclusion: 'neutral',
    output: {
      title,
      summary,
      text,
    },
    actions: [{
      label: 'Re-analyze pull request',
      description: 'Re-analyze pull request',
      identifier: 'rerun',
    }],
  };

  await octokit.request(`PATCH /repos/${owner}/${repo}/check-runs/${checkId}`, check);
}
