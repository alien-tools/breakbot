import nock from 'nock';

import { Octokit } from '@octokit/core';
import { failed, inProgress, } from '../src/checks';
import sendRequest from '../src/maracas';
import GlobalVars from './globalVarsTests';

import PullRequest from '../src/pullRequest';

jest.mock('../src/checks');

describe('Test interractions with Maracas', () => {
  const myVars = new GlobalVars();

  beforeEach(() => {
    nock.disableNetConnect();
  });

  test('sendRequest updates the check if Maracas answers 202', async () => {
    const scope = nock(myVars.maracasUrl, {
      reqheaders: {
        'Content-Type': 'application/json',
        installationId: myVars.installationId.toString(),
      },
    })
      .post(myVars.completeMaracasUrl.slice(myVars.maracasUrl.length))
      .reply(202, { message: 'ok' });

    const pr = new PullRequest(
      'alien-tools/comp-changes',
      123456789,
      2,
      'sha123456789',
    );
    const checkId = 30;
    const octokit = new Octokit();

    await sendRequest(octokit, pr, checkId);

    expect(scope.isDone())
      .toBe(true);
    expect(inProgress)
      .toHaveBeenCalledTimes(1);
    expect(inProgress)
      .toHaveBeenCalledWith(octokit, pr, checkId);
  });

  test('sendRequest updates the check with the error if Maracas answers != 202', async () => {
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
      'alien-tools/comp-changes',
      123456789,
      2,
      'sha123456789',
    );
    const checkId = 30;
    const octokit = new Octokit();

    await sendRequest(octokit, pr, checkId);

    expect(scope.isDone())
      .toBe(true);
    expect(failed)
      .toHaveBeenCalledTimes(1);
    expect(failed)
      .toHaveBeenCalledWith(octokit, pr, checkId, 'unlucky');
  });

  afterEach(() => {
    jest.clearAllMocks();
    nock.cleanAll();
    nock.enableNetConnect();
  });
});
