import nock from 'nock';
import express from 'express';
import { Probot, ProbotOctokit } from 'probot';
import breakBot from '../src/index';
import { PullRequestEvent } from '@octokit/webhooks-types';

const prSyncPayload : PullRequestEvent = require('./fixtures/pull_request.synchronized.json');

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

  test('Synchronizing a PR creates and updates a new check run', async () => {
    nock('https://api.github.com')
      .post('/repos/break-bot/spoon/check-runs', (body) => {
        expect(body).toMatchObject({
          head_sha: '3e9a7ef52d7ab1704d58401819f6815cbc693032',
          name: 'BreakBot report',
          output: {
            summary: '',
            title: 'Sending analysis request to Maracas...',
          },
          status: 'queued',
        });
        return true;
      })
      .reply(200);

    nock('https://api.github.com')
      .patch('/repos/break-bot/spoon/check-runs/', (body) => {
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
      .post('/github/pr/break-bot/spoon/1?callback=http://webhook-server.org/breakbot/pr/break-bot/spoon/1')
      .reply(202, {message: 'processing'});

    await probot.receive({ id: 'synchronized', name: 'pull_request', payload: prSyncPayload });
  });
});
