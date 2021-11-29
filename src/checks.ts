import { Octokit } from '@octokit/core';

import writeReport from './report';
import PullRequest from './pullRequest';
import BreakbotConfig from './config';

export async function createCheck(octokit: Octokit, pr: PullRequest) {
  console.log('[createCheck] Starting...');

  const output = {
    title: 'Sending request to the api...',
    summary: '',
  };

  const check = {
    name: 'Breakbot report',
    head_sha: pr.headSHA,
    status: 'queued',
    output,
  };

  try {
    const resNewCheck = await octokit.request(`POST /repos/${pr.repository}/check-runs`, check);
    const checkId = resNewCheck.data.id;
    console.log(`[createCheck] Check ID = ${checkId}`);
    return checkId;
  } catch (err) {
    console.error(err);
    return -1;
  }
}

export async function inProgress(octokit: Octokit, pr: PullRequest, checkId: number) {
  const check = {
    status: 'in_progress',
    output: {
      title: 'Maracas is processing...',
      summary: '',
    },
  };
  try {
    await octokit.request(`PATCH /repos/${pr.repository}/check-runs/${checkId}`, check);
  } catch (err) {
    console.error(err);
  }
}

export async function finalUpdate(
  octokit: Octokit,
  pr: PullRequest,
  checkId: number,
  config: BreakbotConfig,
  report: any,
) {
  console.log(`[finalUpdate] Report received from Maracas: ${report.message}`);

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

  try {
    await octokit.request(`PATCH /repos/${pr.repository}/check-runs/${checkId}`, newCheck);
  } catch (err) {
    console.error(err);
  }
}

export async function failed(octokit: Octokit, pr: PullRequest, checkId: number, message: string) {
  const check = {
    status: 'completed',
    conclusion: 'cancelled',
    output: {
      title: 'Something went wrong',
      summary: message,
    },
  };

  try {
    await octokit.request(`PATCH /repos/${pr.repository}/check-runs/${checkId}`, check);
  } catch (err) {
    console.error(err);
  }
}
