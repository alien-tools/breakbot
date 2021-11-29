import nock from 'nock';
import express from 'express';
import { Probot, ProbotOctokit } from 'probot';
import breakBot from '../src/index';
import prOpenedPayload from './fixtures/pull_request.opened.json';

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

  test('foo', async () => {
    // Test that a comment is posted
    nock('https://api.github.com')
      .post('/repos/alien-tools/comp-changes/check-runs', (body) => {
        expect(body).toMatchObject({
          head_sha: 'sha123456789',
          name: 'BreakBot report',
          output: {
            summary: '',
            title: 'Sending request to the api...',
          },
          status: 'opened',
        });
        return true;
      })
      .reply(200);

    nock('https://api.github.com')
      .patch('/repos/alien-tools/comp-changes/check-runs/undefined', (body) => {
        expect(body).toMatchObject({});
        return true;
      })
      .reply(200);

    nock('http://fakeurl.com/')
      .post('/github/pr/alien-tools/comp-changes/2?callback=https://testapp.com/breakbot/pr/alien-tools/comp-changes/2', (body) => {
        expect(body).toMatchObject({});
        return true;
      })
      .reply(202);

    // Receive a webhook event
    await probot.receive({ id: '', name: 'pull_request.opened', payload: prOpenedPayload });
  });
});
