import { Context, ProbotOctokit } from 'probot';
import { DeprecatedLogger } from 'probot/lib/types';
import { createCheck, failedCheck, updateCheck } from './checks';
import requestPRAnalysis from './maracas';

async function analyzePR(
  octokit: InstanceType<typeof ProbotOctokit>,
  owner: string,
  repo: string,
  prNb: number,
  checkId: number,
  installationId: number,
  logger: DeprecatedLogger,
) {
  const [status, json] = await requestPRAnalysis(
    owner,
    repo,
    prNb,
    installationId,
  );

  if (status === 202) {
    logger.info(`Maracas answered with ${status}: ${json.message}; updating the check`);
    await updateCheck(octokit, owner, repo, checkId);
  } else {
    logger.error(`Maracas returned an error ${status}: ${json.message}; failing the check`);
    await failedCheck(octokit, owner, repo, checkId, json.message);
  }
}

export async function handlePullRequestWebhook(context: Context<'pull_request'>) {
  if (context.payload.installation?.id === undefined) {
    context.log.error('No installationId in webhook; aborting');
    return;
  }

  const { owner, repo } = context.repo();
  const headSHA = context.payload.pull_request.head.sha;
  const prNb = context.payload.pull_request.number;
  const installationId = context.payload.installation.id;

  const checkId = await createCheck(context.octokit, owner, repo, headSHA);

  await analyzePR(context.octokit, owner, repo, prNb, checkId, installationId, context.log);
}

export async function handleCheckWebhook(context: Context<'check_run.requested_action'>) {
  if (context.payload.installation?.id === undefined) {
    context.log.error('No installationId in webhook; aborting');
    return;
  }

  const { owner, repo } = context.repo();
  const checkId = context.payload.check_run.id;
  const checkSHA = context.payload.check_run.head_sha;
  const allPRs = await context.octokit.pulls.list({ owner, repo });
  const pr = allPRs.data.find((pull) => pull.head.sha === checkSHA);
  const installationId = context.payload.installation.id;

  if (pr === undefined) {
    context.log.error(`Couldn't find a PR for check #${checkId} [sha=${checkSHA}]`);
  } else if (installationId === undefined) {
    context.log.error(`Couldn't find an installationId for check #${checkId} [sha=${checkSHA}]`);
  } else {
    await analyzePR(context.octokit, owner, repo, pr.number, checkId, installationId, context.log);
  }
}
