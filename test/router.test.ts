import { Request, Response } from 'express';
import { Probot, ProbotOctokit } from 'probot';
import nock from 'nock';

import maracasRoute from '../src/routes';

import maracasReport from './fixtures/maracas.report.success.json';


describe('Maracas router', () => {
  let probot: Probot;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    nock.disableNetConnect()
    req = {};
    res = {
      status: jest.fn(),
      send: jest.fn(),
    };

    probot = new Probot({
      githubToken: 'test',
      Octokit: ProbotOctokit.defaults({
        retry: { enabled: false },
        throttle: { enabled: false },
      }),
    });
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  test('Valid report is handled properly', async () => {
    nock('https://api.github.com')
      .post('/app/installations/123456789/access_tokens')
      .reply(201);

    nock('https://api.github.com')
      .get('/repos/break-bot/spoon/contents/.breakbot.yml')
      .reply(200);

    nock('https://api.github.com')
      .get('/repos/break-bot/spoon/pulls/3')
      .reply(200, { number: 1, head: { sha: '272982e2c950814b6976dc144356b10cd5c8bed1'} });

    nock('https://api.github.com')
      .get('/repos/break-bot/spoon/commits/272982e2c950814b6976dc144356b10cd5c8bed1/check-runs')
      .query({ app_id: '119017' })
      .reply(200, {
        total_count: 1,
        check_runs: [{
          id: 1,
          app: { id: 119017 },
        }],
      });

    nock('https://api.github.com')
      .patch('/repos/break-bot/spoon/check-runs/1', (body) => {
        expect(body).toMatchObject({
          output: {
            title: 'Break-bot report',
          },
          status: 'completed',
        });
        return true;
      })
      .reply(200);

    req = {
      params: {
        owner: 'break-bot',
        repo: 'spoon',
        prNb: '3',
      },
      headers: {
        installationId: '123456789',
      },
      body: maracasReport,
    };

    await maracasRoute(req as Request, res as Response, probot.log);

    expect(res.status).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(200);
    expect(res.send).toBeCalledTimes(1);
    expect(res.send).toBeCalledWith('Received');
  });
});
