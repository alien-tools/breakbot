import { createCheck, failedCheck, updateCheck } from './checks';
import requestPRAnalysis from './maracas';
import { Context } from 'probot';

export async function handlePullRequestWebhook(context: Context<'pull_request'>) {
  const checkId = await createCheck(context);
  const [status, json] = await requestPRAnalysis(
    context.repo().owner,
    context.repo().repo,
    context.payload.pull_request.number,
    context.payload.installation?.id ?? -1,
  );

  const { owner, repo } = context.repo();

  if (status === 202) {
    context.log(`Maracas answered with ${status}: ${json.message}`);
    await updateCheck(context.octokit, owner, repo, checkId);
  } else {
    context.log(`Maracas returned an error ${status}: ${json.message}`);
    await failedCheck(context.octokit, owner, repo, checkId, json.message);
  }
}

export async function handleCheckWebhook(context: Context<'check_run.requested_action'>) {
  const { owner, repo } = context.repo();
  const checkId = context.payload.check_run.id;
  const checkSHA = context.payload.check_run.head_sha;
  const allPRs = await context.octokit.pulls.list({ owner, repo });
  const pr = allPRs.data.find((pr) => pr.head.sha === checkSHA);
  const installationId = context.payload.installation?.id;

  if (pr === undefined)
    context.log(`Couldn't find a PR for check #${checkId} [sha=${checkSHA}]`);
  else if (installationId === undefined)
    context.log(`Couldn't find an installationId for check #${checkId} [sha=${checkSHA}]`);
  else {
    const [status, json] = await requestPRAnalysis(
      context.repo().owner,
      context.repo().repo,
      pr.number,
      installationId,
    );

    if (status === 202) {
      context.log(`Maracas answered with ${status}: ${json.message}`);
      await updateCheck(context.octokit, owner, repo, checkId);
    } else {
      context.log(`Maracas returned an error ${status}: ${json.message}`);
      await failedCheck(context.octokit, owner, repo, checkId, json.message);
    }
  }
}
