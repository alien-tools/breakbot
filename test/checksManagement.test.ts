import nock from 'nock';
import WebhookData from '../src/webhookData';
import ReportData from '../src/reportData';
import GlobalVars from './globalVarsTests';
import { failed, finalUpdate, inProgress, createCheck } from '../src/checksManagement';
import payloadv3 from './fixtures/maracas.v3.json';
import writeReport from '../src/writeReport';

jest.mock('../src/writeReport.ts', () =>
  jest.fn((Json: any, bcMax: number, clientMax: number) => (['Title', 'Summary', 'Text']))
);

describe('Testing check management in normal conditions', () => {
  const myVars = new GlobalVars();

  const mockOctokit = {
    request: myVars.mockRequest,
  };

  const mockWebhookDatas = new WebhookData(myVars.baseRepo, myVars.installationId, mockOctokit); // could be moved to globalVars
  mockWebhookDatas.headSHA = myVars.branchSHA;
  mockWebhookDatas.prNb = myVars.prNb;

  // ok because of the tests ?
  const mockReportDatas = new ReportData(myVars.baseRepo, myVars.installationId);
  mockReportDatas.prNb = myVars.prNb;
  mockReportDatas.myOctokit = mockOctokit;
  mockReportDatas.checkId = myVars.checkId;

  beforeAll(() => {
    nock.disableNetConnect();
  });

  beforeEach(() => {
    mockOctokit.request.mockClear();
  });

  test('createCheck', async (done) => {
    const check = {
      name: 'Breakbot report',
      head_sha: myVars.branchSHA,
      status: 'queued',
      output: {
        title: 'Sending request to the api...',
        summary: '',
      },
    };

    await createCheck(mockWebhookDatas);

    done(expect(mockOctokit.request).toBeCalledWith(`POST /repos/${myVars.baseRepo}/check-runs`, check));
  });

  test('progressCheck', async (done) => {
    mockWebhookDatas.checkId = myVars.checkId;

    const check = {
      status: 'in_progress',
      output: {
        title: 'Maracas is processing...',
        summary: '',
      },
    };

    await inProgress(mockWebhookDatas);

    done(expect(mockOctokit.request).toBeCalledWith(`PATCH /repos/${myVars.baseRepo}/check-runs/${myVars.checkId}`, check));
  });

  test('failed', async (done) => {
    mockWebhookDatas.checkId = myVars.checkId;

    const check = {
      status: 'completed',
      conclusion: 'cancelled',
      output: {
        title: 'Something went wrong',
        summary: 'Not found',
      },
    };

    await failed(mockWebhookDatas, 'Not found');

    done(expect(mockOctokit.request).toBeCalledWith(`PATCH /repos/${myVars.baseRepo}/check-runs/${myVars.checkId}`, check));
  });

  test('finalUpdate, no config', async (done) => {
    await finalUpdate(mockReportDatas, payloadv3);

    expect(writeReport).toBeCalledWith(payloadv3, myVars.defaultMax, myVars.defaultMax, myVars.defaultMax);
    done(expect(mockOctokit.request.mock.calls[0][0]).toStrictEqual(`PATCH /repos/${myVars.baseRepo}/check-runs/${myVars.checkId}`));
  });

  test('finalUpdate, simple config', async (done) => { // to complete
    mockReportDatas.config = {};
    mockReportDatas.config.maxDisplayedBC = myVars.bcMax;
    mockReportDatas.config.maxDisplayedClients = myVars.clMax;
    mockReportDatas.config.maxDisplayedDetections = myVars.dMax;

    await finalUpdate(mockReportDatas, payloadv3);

    expect(writeReport).toBeCalledWith(payloadv3, myVars.bcMax, myVars.clMax, myVars.dMax);
    done(expect(mockOctokit.request.mock.calls[0][0]).toStrictEqual(`PATCH /repos/${myVars.baseRepo}/check-runs/${myVars.checkId}`));
  });

  afterAll(() => {
    nock.restore();
    nock.cleanAll();
    nock.enableNetConnect();
  });
});
