import { Octokit } from '@octokit/core';
import { ProbotOctokit } from 'probot/lib/octokit/probot-octokit';
import { restEndpointMethods } from '@octokit/plugin-rest-endpoint-methods';

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
    name: BreakBotConstants.REPORT_TITLE,
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
      label: 'Retry the analysis',
      description: '',
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
  ] = writeReport(report, config.maxBCs, config.maxClients, config.maxBrokenUses);

  let conclusion = 'neutral';
  if (report.message !== 'ok') conclusion = 'failure';
  else if (report.report.reports.every((pkg: any) => pkg.delta === null || pkg.delta.breakingChanges.length === 0)) conclusion = 'success';

  await restEndpointMethods(octokit).rest.checks.update({
    owner,
    repo,
    check_run_id: checkId,
    status: 'completed',
    conclusion,
    output: {
      title,
      summary,
      text,
    },
    actions: [{
      label: 'Re-run the analysis',
      description: '',
      identifier: 'rerun',
    }],
  });
}

export async function skippedCheck(
  octokit: InstanceType<typeof ProbotOctokit>,
  owner: string,
  repo: string,
  checkId: number,
): Promise<void> {
  await octokit.checks.update({
    owner,
    repo,
    check_run_id: checkId,
    status: 'completed',
    conclusion: 'skipped',
    output: {
      title: 'Check skipped',
      summary: 'Nothing to check in this pull request.',
    },
    actions: [{
      label: 'Retry the analysis',
      description: '',
      identifier: 'rerun',
    }],
  });
}
