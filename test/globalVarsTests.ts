import { readFileSync } from 'fs';

import payloadGetChecks from './fixtures/getChecks.json';
import payloadGetPulls from './fixtures/getPulls.json';
import payloadGetPull from './fixtures/getPull.json';
import payloadPostCheck from './fixtures/postCheck.json';

const path = require('path');

const privateKey = readFileSync(path.join(__dirname, '/fixtures/mock-cert.pem'), 'utf-8');

export default class GlobalVars {
  baseRepo: string; // "ImMeta/breakbotLib";

  prNb: number; // 1;

  branchSHA: string; // "headsha1";

  checkId: number; // 30;

  installationId: number; // 2;

  appId: number; // 1871;

  privateKey: string; // privateKey;

  callbackUrl: string; // "https://testapp.com"

  completeCallbackUrl: string; // `${callbackUrl}/breakbot/pr/${baseRepo}/${prNb}`

  maracasUrl: string; // "http://fakeurl.com"

  completeMaracasUrl: string; // `${maracasUrl}/github/pr/${baseRepo}/${prNb}?callback=${completeCallbackUrl}`

  defaultMax: number; // hardcoed in finalUpdate for the moment

  bcMax: number;

  clMax: number;

  dMax: number;

  constructor() {
    this.baseRepo = 'alien-tools/comp-changes';
    this.prNb = 2;
    this.branchSHA = 'sha123456789';
    this.checkId = 30;
    this.installationId = 123456789;
    this.appId = 1871;
    this.privateKey = privateKey;

    this.callbackUrl = 'https://testapp.com';
    this.completeCallbackUrl = `${this.callbackUrl}/breakbot/pr/${this.baseRepo}/${this.prNb}`;

    this.maracasUrl = 'http://fakeurl.com';
    this.completeMaracasUrl = `${this.maracasUrl}/github/pr/${this.baseRepo}/${this.prNb}?callback=${this.completeCallbackUrl}`;

    this.defaultMax = 50;
    this.bcMax = this.defaultMax;
    this.clMax = this.defaultMax;
    this.dMax = this.defaultMax;
  }

  mockRequest = jest.fn((req: string) => {
    if (req === `GET /repos/${this.baseRepo}/pulls/${this.prNb}`) {
      console.log(`[mockRequest] Req received from a Get pull: ${req}`);
      return payloadGetPull;
    } if (req === `GET /repos/${this.baseRepo}/commits/${this.branchSHA}/check-runs`) {
      return payloadGetChecks;
    } if (req === `GET /repos/${this.baseRepo}/pulls`) {
      return payloadGetPulls;
    } if (req === `POST /repos/${this.baseRepo}/check-runs`) {
      return payloadPostCheck;
    }
    console.log(`[mockRequest] Req received: ${req}`);
    return undefined;
  });
}
