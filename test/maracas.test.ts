import nock from 'nock';

import { Octokit } from '@octokit/core';
import {
  inProgress,
  failed,
} from '../src/checks';
import sendRequest from '../src/maracas';
import GlobalVars from './globalVarsTests';

import PullRequest from '../src/pullRequest';

jest.mock('../src/checks');

describe('Test interractions with Maracas', () => {
  const myVars = new GlobalVars();

  beforeEach(() => {
    nock.disableNetConnect();
  });

  test('sendRequest updates the check if Maracas answers 202', async (done) => {
    const scope = nock(myVars.maracasUrl, {
      reqheaders: {
        'Content-Type': 'application/json',
        installationId: myVars.installationId.toString(),
      },
    })
      .post(myVars.completeMaracasUrl.slice(myVars.maracasUrl.length))
      .reply(202, { message: 'ok' });

    const pr = new PullRequest(
      new Octokit(),
      'alien-tools/comp-changes',
      123456789,
      2,
      'sha123456789',
    );
    const checkId = 30;

    await sendRequest(pr, checkId);

    expect(scope.isDone()).toBe(true);
    done(expect(inProgress).toHaveBeenCalledTimes(1));
    done(expect(inProgress).toHaveBeenCalledWith(pr, checkId));
  });

  test('sendRequest update the check with the error if Maracas answers != 202', async (done) => {
    const scope = nock(myVars.maracasUrl, {
      reqheaders: {
        'Content-Type': 'application/json',
        installationId: myVars.installationId.toString(),
      },
    })
      .post(myVars.completeMaracasUrl.slice(myVars.maracasUrl.length))
      .reply(400, {
        message: 'unlucky',
        report: null,
      });

    const pr = new PullRequest(
      new Octokit(),
      'alien-tools/comp-changes',
      123456789,
      2,
      'sha123456789',
    );
    const checkId = 30;

    await sendRequest(pr, checkId);

    expect(scope.isDone()).toBe(true);
    done(expect(failed).toHaveBeenCalledTimes(1));
    done(expect(failed).toHaveBeenCalledWith(pr, checkId, 'unlucky'));
  });

  afterEach(() => {
    jest.clearAllMocks();
    nock.cleanAll();
    nock.enableNetConnect();
  });
});
