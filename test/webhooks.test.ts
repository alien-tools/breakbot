import nock from 'nock';
import express from 'express';
import { Probot, ProbotOctokit } from 'probot';
import { CheckRunEvent, PullRequestEvent } from '@octokit/webhooks-types';
import breakBot from '../src/index';

const prSyncPayload : PullRequestEvent = require('./fixtures/github/pull_request.synchronized.json');
const prOpenedPayload : PullRequestEvent = require('./fixtures/github/pull_request.opened.json');
const prOpenedWithoutInstallationIdPayload : PullRequestEvent = require('./fixtures/github/pull_request.opened.no_installationId.json');
const checkRunPayload : CheckRunEvent = require('./fixtures/github/check_run.requested_action.json');
const checkRunWithoutInstallationIdPayload : CheckRunEvent = require('./fixtures/github/check_run.requested_action.no_installationId.json');
const checkRunWithWrongSha : CheckRunEvent = require('./fixtures/github/check_run.requested_action.wrong_sha.json');
const changedFilesJavaPayload : CheckRunEvent = require('./fixtures/github/pulls.changed_files.java.json');
const changedFilesNoJavaPayload : CheckRunEvent = require('./fixtures/github/pulls.changed_files.no_java.json');

describe('BreakBot tests', () => {
  let probot: Probot;

  beforeEach(() => {
    nock.disableNetConnect();
    probot = new Probot({
      githubToken: 'test',
      Octokit: ProbotOctokit.defaults({
        retry: { enabled: false },
        throttle: { enabled: false },
      }),
    });

    breakBot(probot, { getRouter: () => express() });
  });

  afterEach(() => {
    if (!nock.isDone()) {
      throw new Error(`Not all interceptors were used: ${nock.pendingMocks()}`);
    }
    nock.cleanAll();
    nock.enableNetConnect();
  });

  test('Synchronizing a PR creates and updates a new check run', async () => {
    // Nocking the files changed request
    nock('https://api.github.com')
      .get('/repos/break-bot/spoon/pulls/1/files')
      .reply(200, changedFilesJavaPayload);

    // Nocking the check run queueing
    nock('https://api.github.com')
      .post('/repos/break-bot/spoon/check-runs', (body) => {
        expect(body).toMatchObject({
          head_sha: '3e9a7ef52d7ab1704d58401819f6815cbc693032',
          name: 'BreakBot Report',
          output: {
            title: 'Sending analysis request to Maracas...',
          },
          status: 'queued',
        });
        return true;
      })
      .reply(201, { id: 1 });

    // Nocking the check run initial update
    nock('https://api.github.com')
      .patch('/repos/break-bot/spoon/check-runs/1', (body) => {
        expect(body).toMatchObject({
          output: {
            title: 'Analyzing the PR with Maracas...',
          },
          status: 'in_progress',
        });
        return true;
      })
      .reply(200);

    // Nocking default Maracas response
    nock('http://maracas-server.org')
      .post('/github/pr/break-bot/spoon/1')
      .query({ callback: 'http://webhook-server.org/breakbot/pr/break-bot/spoon/1' })
      .reply(202, { message: 'processing' });

    // @ts-ignore
    await probot.receive({ id: 'synchronized', name: 'pull_request', payload: prSyncPayload });
  });

  test('Opening a new PR creates and updates a new check run', async () => {
    // Nocking the files changed request
    nock('https://api.github.com')
      .get('/repos/break-bot/spoon/pulls/4/files')
      .reply(200, changedFilesJavaPayload);

    // Nocking the check run queueing
    nock('https://api.github.com')
      .post('/repos/break-bot/spoon/check-runs', (body) => {
        expect(body).toMatchObject({
          head_sha: '148174db3a9eb9cbcdf444f8b0359c54f6c0a877',
          name: 'BreakBot Report',
          output: {
            title: 'Sending analysis request to Maracas...',
          },
          status: 'queued',
        });
        return true;
      })
      .reply(201, { id: 1 });

    // Nocking the check run initial update
    nock('https://api.github.com')
      .patch('/repos/break-bot/spoon/check-runs/1', (body) => {
        expect(body).toMatchObject({
          output: {
            title: 'Analyzing the PR with Maracas...',
          },
          status: 'in_progress',
        });
        return true;
      })
      .reply(200);

    // Nocking default Maracas response
    nock('http://maracas-server.org')
      .post('/github/pr/break-bot/spoon/4')
      .query({ callback: 'http://webhook-server.org/breakbot/pr/break-bot/spoon/4' })
      .reply(202, { message: 'processing' });

    // @ts-ignore
    await probot.receive({ id: 'opened', name: 'pull_request', payload: prOpenedPayload });
  });

  test('Re-running a check updates the check run', async () => {
    nock('https://api.github.com')
      .get('/repos/break-bot/spoon/pulls')
      .reply(200, [{ number: 1, head: { sha: '272982e2c950814b6976dc144356b10cd5c8bed1' } }]);

    nock('https://api.github.com')
      .patch('/repos/break-bot/spoon/check-runs/4342888321', (body) => {
        expect(body).toMatchObject({
          output: {
            title: 'Analyzing the PR with Maracas...',
          },
          status: 'in_progress',
        });
        return true;
      })
      .reply(200);

    nock('http://maracas-server.org')
      .post('/github/pr/break-bot/spoon/1')
      .query({ callback: 'http://webhook-server.org/breakbot/pr/break-bot/spoon/1' })
      .reply(202, { message: 'processing' });

    await probot.receive({ id: 're-run', name: 'check_run', payload: checkRunPayload });
  });

  test('If Maracas fails to parse the request, an error is reported', async () => {
    // Nocking the files changed request
    nock('https://api.github.com')
      .get('/repos/break-bot/spoon/pulls/4/files')
      .reply(200, changedFilesJavaPayload);

    nock('https://api.github.com')
      .post('/repos/break-bot/spoon/check-runs')
      .reply(201, { id: 1 });

    nock('https://api.github.com')
      .patch('/repos/break-bot/spoon/check-runs/1', (body) => {
        expect(body).toMatchObject({
          output: {
            title: 'Maracas returned an error',
            summary: 'unlucky',
          },
          status: 'completed',
          conclusion: 'cancelled',
        });
        return true;
      })
      .reply(200);

    nock('http://maracas-server.org')
      .post('/github/pr/break-bot/spoon/4')
      .query({ callback: 'http://webhook-server.org/breakbot/pr/break-bot/spoon/4' })
      .reply(400, { message: 'unlucky' });

    // @ts-ignore
    await probot.receive({ id: 'opened', name: 'pull_request', payload: prOpenedPayload });
  });

  test('If the pull_request payload contains no installationId, update the check with the error', async () => {
    // Nocking the files changed request
    nock('https://api.github.com')
      .get('/repos/break-bot/spoon/pulls/4/files')
      .reply(200, changedFilesJavaPayload);

    nock('https://api.github.com')
      .post('/repos/break-bot/spoon/check-runs')
      .reply(201, { id: 1 });

    nock('https://api.github.com')
      .patch('/repos/break-bot/spoon/check-runs/1', (body) => {
        expect(body).toMatchObject({
          output: {
            title: 'Maracas returned an error',
            summary: 'No installationId in payload; aborting',
          },
          status: 'completed',
          conclusion: 'cancelled',
        });
        return true;
      })
      .reply(200);

    // @ts-ignore
    await probot.receive({ id: 'opened', name: 'pull_request', payload: prOpenedWithoutInstallationIdPayload });
  });

  test('If the check_run payload contains no installationId, update the check with the error', async () => {
    nock('https://api.github.com')
      .get('/repos/break-bot/spoon/pulls')
      .reply(200, [{ number: 1, head: { sha: '272982e2c950814b6976dc144356b10cd5c8bed1' } }]);

    nock('https://api.github.com')
      .patch('/repos/break-bot/spoon/check-runs/4342888321', (body) => {
        expect(body).toMatchObject({
          output: {
            title: 'Maracas returned an error',
            summary: 'No installationId in payload; aborting',
          },
          status: 'completed',
          conclusion: 'cancelled',
        });
        return true;
      })
      .reply(200);

    await probot.receive({ id: 'opened', name: 'check_run', payload: checkRunWithoutInstallationIdPayload });
  });

  test('If the check_run payload contains no installationId, update the check with the error', async () => {
    nock('https://api.github.com')
      .get('/repos/break-bot/spoon/pulls')
      .reply(200, [{ number: 1, head: { sha: '272982e2c950814b6976dc144356b10cd5c8bed1' } }]);

    nock('https://api.github.com')
      .patch('/repos/break-bot/spoon/check-runs/4342888321', (body) => {
        expect(body).toMatchObject({
          output: {
            title: 'Maracas returned an error',
            summary: 'Couldn\'t find a PR for check #4342888321 [sha=erroneous]',
          },
          status: 'completed',
          conclusion: 'cancelled',
        });
        return true;
      })
      .reply(200);

    await probot.receive({ id: 'opened', name: 'check_run', payload: checkRunWithWrongSha });
  });

  test('Attempting to check a PR that doesn\'t affect Java code ends in a skipped check', async () => {
    // Nocking the files changed request
    nock('https://api.github.com')
      .get('/repos/break-bot/spoon/pulls/4/files')
      .reply(200, changedFilesNoJavaPayload);

    // Nocking the check run queueing
    nock('https://api.github.com')
      .post('/repos/break-bot/spoon/check-runs', (body) => {
        expect(body).toMatchObject({
          head_sha: '148174db3a9eb9cbcdf444f8b0359c54f6c0a877',
          name: 'BreakBot Report',
          output: {
            title: 'Sending analysis request to Maracas...',
          },
          status: 'queued',
        });
        return true;
      })
      .reply(201, { id: 1 });

    // Nocking the skipped check run update
    nock('https://api.github.com')
      .patch('/repos/break-bot/spoon/check-runs/1', (body) => {
        expect(body).toMatchObject({
          output: {
            title: 'Check skipped',
          },
          status: 'completed',
          conclusion: 'skipped',
        });
        return true;
      })
      .reply(201, { id: 1 });

    // @ts-ignore
    await probot.receive({ id: 'opened', name: 'pull_request', payload: prOpenedPayload });
  });

  test('If Maracas server is down, report the error', async () => {
    // Nocking the files changed request
    nock('https://api.github.com')
      .get('/repos/break-bot/spoon/pulls/4/files')
      .reply(200, changedFilesJavaPayload);

    // Nocking the check run queueing
    nock('https://api.github.com')
      .post('/repos/break-bot/spoon/check-runs', (body) => {
        expect(body).toMatchObject({
          head_sha: '148174db3a9eb9cbcdf444f8b0359c54f6c0a877',
          name: 'BreakBot Report',
          output: {
            title: 'Sending analysis request to Maracas...',
          },
          status: 'queued',
        });
        return true;
      })
      .reply(201, { id: 1 });

    // Nocking the check run initial update
    nock('https://api.github.com')
      .patch('/repos/break-bot/spoon/check-runs/1', (body) => {
        expect(body).toMatchObject({
          output: {
            title: 'Maracas returned an error',
            summary: 'request to http://maracas-server.org/github/pr/break-bot/spoon/4?callback=http://webhook-server.org/breakbot/pr/break-bot/spoon/4 failed, reason: Server down',
          },
          status: 'completed',
          conclusion: 'cancelled',
        });
        return true;
      })
      .reply(200);

    nock('http://maracas-server.org')
      .post('/github/pr/break-bot/spoon/4')
      .query({ callback: 'http://webhook-server.org/breakbot/pr/break-bot/spoon/4' })
      .replyWithError('Server down');

    // @ts-ignore
    await probot.receive({ id: 'opened', name: 'pull_request', payload: prOpenedPayload });
  });
});
