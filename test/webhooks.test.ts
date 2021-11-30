import nock from 'nock';
import express from 'express';
import { Probot, ProbotOctokit } from 'probot';
import { CheckRunEvent, PullRequestEvent } from '@octokit/webhooks-types';
import breakBot from '../src/index';

const prSyncPayload : PullRequestEvent = require('./fixtures/pull_request.synchronized.json');
const prOpenedPayload : PullRequestEvent = require('./fixtures/pull_request.opened.json');
const checkReRunPayload : CheckRunEvent = require('./fixtures/check_run.requested_action.json');

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
    nock('https://api.github.com')
      .post('/repos/break-bot/spoon/check-runs', (body) => {
        expect(body).toMatchObject({
          head_sha: '3e9a7ef52d7ab1704d58401819f6815cbc693032',
          name: 'BreakBot Report',
          output: {
            summary: '',
            title: 'Sending analysis request to Maracas...',
          },
          status: 'queued',
        });
        return true;
      })
      .reply(201, { id: 1 });

    nock('https://api.github.com')
      .patch('/repos/break-bot/spoon/check-runs/1', (body) => {
        expect(body).toMatchObject({
          output: {
            summary: '',
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

    await probot.receive({ id: 'synchronized', name: 'pull_request', payload: prSyncPayload });
  });

  test('Opening a new PR creates and updates a new check run', async () => {
    nock('https://api.github.com')
      .post('/repos/break-bot/spoon/check-runs', (body) => {
        expect(body).toMatchObject({
          head_sha: '148174db3a9eb9cbcdf444f8b0359c54f6c0a877',
          name: 'BreakBot Report',
          output: {
            summary: '',
            title: 'Sending analysis request to Maracas...',
          },
          status: 'queued',
        });
        return true;
      })
      .reply(201, { id: 1 });

    nock('https://api.github.com')
      .patch('/repos/break-bot/spoon/check-runs/1', (body) => {
        expect(body).toMatchObject({
          output: {
            summary: '',
            title: 'Analyzing the PR with Maracas...',
          },
          status: 'in_progress',
        });
        return true;
      })
      .reply(200);

    nock('http://maracas-server.org')
      .post('/github/pr/break-bot/spoon/4')
      .query({ callback: 'http://webhook-server.org/breakbot/pr/break-bot/spoon/4' })
      .reply(202, { message: 'processing' });

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
            summary: '',
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

    await probot.receive({ id: 're-run', name: 'check_run', payload: checkReRunPayload });
  });
});
