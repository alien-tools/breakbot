import nock from 'nock';
import { Octokit } from '@octokit/core';
import { mocked } from 'ts-jest/utils';
import { createCheck } from '../src/checks';
import PullRequest from '../src/pullRequest';

import payloadGetChecks from './fixtures/getChecks.json';
import payloadGetPulls from './fixtures/getPulls.json';
import payloadGetPull from './fixtures/getPull.json';
import payloadPostCheck from './fixtures/postCheck.json';

jest.mock('@octokit/core', () => ({
  Octokit: jest.fn(() => ({
    request: (req: string, data: any) => {
      console.log(`[mockRequest] Req received: ${req} ${data}`);
      if (req === 'GET /repos/alien-tools/comp-changes/pulls/2') {
        console.log(`[mockRequest] Req received from a Get pull: ${req}`);
        return payloadGetPull;
      }
      if (req === 'GET /repos/alien-tools/comp-changes/commits/sha123456789/check-runs') {
        return payloadGetChecks;
      }
      if (req === 'GET /repos/alien-tools/comp-changes/pulls') {
        return payloadGetPulls;
      }
      if (req === 'POST /repos/alien-tools/comp-changes/check-runs') {
        return payloadPostCheck;
      }
      return undefined;
    },
  })),
}));

jest.mock('../src/report.ts', () => jest.fn((report: any, maxBCs: number, maxClients: number, maxDetections: number) => (['Title', 'Summary', 'Text'])));

describe('Testing check management in normal conditions', () => {
  const OctokitMock = mocked(Octokit, true);
  const testPR = new PullRequest(
    'alien-tools/comp-changes',
    123456789,
    2,
    'sha123456789',
  );

  beforeAll(() => {
    nock.disableNetConnect();
  });

  test('createCheck', async () => {
    const checkId = await createCheck(new Octokit(), testPR);

    expect(checkId)
      .toBe(30);
  });

  test('createCheck2', async () => {
    const checkId = await createCheck(new Octokit(), testPR);

    expect(checkId)
      .toBe(30);
  });

  afterEach(() => {
    OctokitMock.mockClear();
  });

  afterAll(() => {
    nock.restore();
    nock.cleanAll();
    nock.enableNetConnect();
  });
});
