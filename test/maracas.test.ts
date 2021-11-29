import nock from 'nock';
import { Octokit } from '@octokit/core';
import { mocked } from 'ts-jest/utils';

import {
  inProgress,
  failed,
} from '../src/checks';
import sendRequest from '../src/maracas';
import GlobalVars from './globalVarsTests';

import payloadv1 from './fixtures/maracas.v1.json';
import payloadGetChecks from './fixtures/getChecks.json';
import payloadGetPulls from './fixtures/getPulls.json';
import payloadGetPull from './fixtures/getPull.json';
import payloadPostCheck from './fixtures/postCheck.json';

jest.mock('../src/checks');

jest.mock('@octokit/core', () => ({
  Octokit: jest.fn(() => ({
    request: (req: string, data: any) => {
      console.log(`[mockRequest] Req received: ${req} ${data}`);
      if (req === 'GET /repos/alien-tools/comp-changes/pulls/2') {
        console.log(`[mockRequest] Req received from a Get pull: ${req}`);
        return payloadGetPull;
      } if (req === 'GET /repos/alien-tools/comp-changes/commits/sha123456789/check-runs') {
        return payloadGetChecks;
      } if (req === 'GET /repos/alien-tools/comp-changes/pulls') {
        return payloadGetPulls;
      } if (req === 'POST /repos/alien-tools/comp-changes/check-runs') {
        return payloadPostCheck;
      }
      return undefined;
    },
  })),
}));

describe('Test interractions with Maracas', () => {
  const OctokitMock = mocked(Octokit, true);
  const myVars = new GlobalVars();

  beforeEach(() => {
    nock.disableNetConnect();
  });

  test('sendRequest updates the checks if Maracas answers 202', async (done) => {
    const scope = nock(myVars.maracasUrl, {
      reqheaders: {
        'Content-Type': 'application/json',
        installationId: myVars.installationId.toString(),
      },
    })
      .post(myVars.completeMaracasUrl.slice(myVars.maracasUrl.length))
      .reply(202, { message: 'ok' });

    await sendRequest(undefined, undefined);

    expect(scope.isDone()).toBe(true);
    done(expect(inProgress).toHaveBeenCalled());
  });

  test('sendRequest update the test with a different message if Maracas sends an error', async (done) => {
    const scope = nock(myVars.maracasUrl, {
      reqheaders: {
        'Content-Type': 'application/json',
        installationId: myVars.installationId.toString(),
      },
    })
      .post(myVars.completeMaracasUrl.slice(myVars.maracasUrl.length))
      .reply(404, payloadv1);

    await sendRequest(undefined, undefined);

    expect(scope.isDone()).toBe(true);
    done(expect(failed).toHaveBeenCalledWith(undefined, 'unlucky'));
  });

  afterEach(() => {
    jest.clearAllMocks();
    nock.cleanAll();
    nock.enableNetConnect();
  });
});
