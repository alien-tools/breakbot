import { Request, Response } from 'express';
import { Probot, ProbotOctokit } from 'probot';
import nock from 'nock';

import maracasRoute from '../src/routes';

import reportWithBCs from './fixtures/maracas/maracas.success.json';
import reportWithoutBCs from './fixtures/maracas/maracas.no-bc.json';
import reportWithError from './fixtures/maracas/maracas.error.json';

describe('Maracas router', () => {
  let probot: Probot;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    nock.disableNetConnect();
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

  test('Receiving a Maracas report with BCs creates a neutral check', async () => {
    nock('https://api.github.com')
      .post('/app/installations/123456789/access_tokens')
      .reply(201);

    nock('https://api.github.com')
      .get('/repos/break-bot/spoon/contents/.github%2Fbreakbot.yml')
      .reply(200);

    nock('https://api.github.com')
      .get('/repos/break-bot/spoon/pulls/3')
      .reply(200, { number: 1, head: { sha: '272982e2c950814b6976dc144356b10cd5c8bed1' } });

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
            title: 'BreakBot Report',
          },
          status: 'completed',
          conclusion: 'neutral',
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
        installationid: '123456789',
      },
      body: reportWithBCs,
    };

    await maracasRoute(req as Request, res as Response, probot.log);

    expect(res.status).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(200);
    expect(res.send).toBeCalledTimes(1);
    expect(res.send).toBeCalledWith('Received');
  });

  test('Receiving a Maracas report without BCs creates a success check', async () => {
    nock('https://api.github.com')
      .post('/app/installations/123456789/access_tokens')
      .reply(201);

    nock('https://api.github.com')
      .get('/repos/break-bot/spoon/contents/.github%2Fbreakbot.yml')
      .reply(200);

    nock('https://api.github.com')
      .get('/repos/break-bot/spoon/pulls/3')
      .reply(200, { number: 1, head: { sha: '272982e2c950814b6976dc144356b10cd5c8bed1' } });

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
            title: 'BreakBot Report',
          },
          status: 'completed',
          conclusion: 'success',
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
        installationid: '123456789',
      },
      body: reportWithoutBCs,
    };

    await maracasRoute(req as Request, res as Response, probot.log);

    expect(res.status).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(200);
    expect(res.send).toBeCalledTimes(1);
    expect(res.send).toBeCalledWith('Received');
  });

  test('Receiving a Maracas report with errors creates a failure check', async () => {
    nock('https://api.github.com')
      .post('/app/installations/123456789/access_tokens')
      .reply(201);

    nock('https://api.github.com')
      .get('/repos/break-bot/spoon/contents/.github%2Fbreakbot.yml')
      .reply(200);

    nock('https://api.github.com')
      .get('/repos/break-bot/spoon/pulls/3')
      .reply(200, { number: 1, head: { sha: '272982e2c950814b6976dc144356b10cd5c8bed1' } });

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
            title: 'BreakBot Report',
            summary: 'An error occurred: unlucky\n',
          },
          status: 'completed',
          conclusion: 'failure',
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
        installationid: '123456789',
      },
      body: reportWithError,
    };

    await maracasRoute(req as Request, res as Response, probot.log);

    expect(res.status).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(200);
    expect(res.send).toBeCalledTimes(1);
    expect(res.send).toBeCalledWith('Received');
  });

  test('.breakbot.yml file is properly read', async () => {
    nock('https://api.github.com')
      .post('/app/installations/123456789/access_tokens')
      .reply(201);

    nock('https://api.github.com')
      .get('/repos/break-bot/spoon/contents/.github%2Fbreakbot.yml')
      .reply(200, {
        content: 'bWF4QkNzOiAxCm1heENsaWVudHM6IDEKbWF4RGV0ZWN0aW9uczogMQ==', // maxBCs: 1 maxClients: 1 maxDetections: 1
        encoding: 'base64',
      });

    nock('https://api.github.com')
      .get('/repos/break-bot/spoon/pulls/3')
      .reply(200, { number: 1, head: { sha: '272982e2c950814b6976dc144356b10cd5c8bed1' } });

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
            title: 'BreakBot Report',
          },
          status: 'completed',
        });
        expect(body.output.text).toContain('not shown');
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
        installationid: '123456789',
      },
      body: reportWithBCs,
    };

    await maracasRoute(req as Request, res as Response, probot.log);

    expect(res.status).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(200);
    expect(res.send).toBeCalledTimes(1);
    expect(res.send).toBeCalledWith('Received');
  });
});
