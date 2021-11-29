import nock from 'nock';
import { Octokit } from '@octokit/core';
import { mocked } from 'ts-jest/utils';

import {
  handleCheckWebhook,
  handlePullRequestWebhook,
  handleMaracasPost,
} from '../src/handlers';
import sendRequest from '../src/maracas';
import GlobalVars from './globalVarsTests';

import payloadNewPr from './fixtures/pull_request.opened.json';
import payloadNewCheck from './fixtures/check_run.requested_action.json';
import payloadReport from './fixtures/maracas.v3.json';
import payloadGetChecks from './fixtures/getChecks.json';
import payloadGetPulls from './fixtures/getPulls.json';
import payloadGetPull from './fixtures/getPull.json';
import payloadPostCheck from './fixtures/postCheck.json';

const myVars = new GlobalVars();

jest.mock('../src/maracas');

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

jest.mock('@probot/octokit-plugin-config', () => ({
  config: ((octokit: any) => ({
    config: {
      get: ((args: any) => {
        const addressSplit = myVars.baseRepo.split('/');

        if ((args.owner === addressSplit[0]) && (args.repo === addressSplit[1])) {
          return {
            config: {
              verbose: true,
              maxDisplayedBC: 12,
            },
          };
        }

        return undefined;
      }),
    },
  })),
}));

describe('Testing webhookhandler', () => {
  const OctokitMock = mocked(Octokit, true);

  beforeEach(() => {
    nock.disableNetConnect();
    jest.clearAllMocks();
  });

  test('Opened pull request, no error', async (done) => {
    const mockContext = {
      name: 'pull_request',
      octokit: new Octokit(),
      payload: payloadNewPr,
    };

    await handlePullRequestWebhook(mockContext);

    done(expect(sendRequest).toHaveBeenCalledWith(undefined, undefined));
  });

  test('Rerequested test, no error', async (done) => {
    const mockContext = {
      name: 'check_run',
      octokit: new Octokit(),
      payload: payloadNewCheck,
    };

    await handleCheckWebhook(mockContext);

    done(expect(sendRequest).toHaveBeenCalledWith(undefined));
  });

  afterEach(() => {
    OctokitMock.mockClear();
    nock.enableNetConnect();
  });
});

describe.skip('Testing reportHandler', () => {
  test('Maracas reply 200', async (done: any) => {
    const addressSplit = myVars.baseRepo.split('/');

    const mockReq = {
      status: 200,
      headers: {
        installationid: myVars.installationId, // Json => lowercase
      },
      params: {
        owner: addressSplit[0],
        repo: addressSplit[1],
      },
      body: payloadReport,
    };

    await handleMaracasPost(mockReq);
  });
});
