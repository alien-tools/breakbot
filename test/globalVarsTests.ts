import { readFileSync } from "fs";
const path = require("path");

import payloadGetChecks from "./fixtures/getChecks.json"
import payloadGetPulls from "./fixtures/getPulls.json"
import payloadGetPull from "./fixtures/getPull.json"
import payloadPostCheck from "./fixtures/postCheck.json"

const privateKey = readFileSync(path.join(__dirname, "/fixtures/mock-cert.pem"), "utf-8")

export class globalVars {
    baseRepo: string; //"ImMeta/breakbotLib";
    prNb: number; //1;
    branchSHA: string; //"headsha1";
    checkId: number; //30;
    installationId: number; //2;
    appId: number; //1871;
    privateKey: string; //privateKey;

    callbackUrl: string; //"https://testapp.com"
    completeCallbackUrl: string; //`${callbackUrl}/breakbot/pr/${baseRepo}/${prNb}`

    maracasUrl: string; //"http://fakeurl.com"
    completeMaracasUrl: string; //`${maracasUrl}/github/pr/${baseRepo}/${prNb}?callback=${completeCallbackUrl}`

    defaultMax: number; //hardcoed in finalUpdate for the moment
    bcMax: number;
    clMax: number;
    dMax: number;

    constructor() {
        this.baseRepo = "ImMeta/breakbotLib"
        this.prNb = 1
        this.branchSHA = "headsha1"
        this.checkId = 30
        this.installationId = 2
        this.appId = 1871
        this.privateKey = privateKey
        
        this.callbackUrl = "https://testapp.com"
        this.completeCallbackUrl = `${this.callbackUrl}/breakbot/pr/${this.baseRepo}/${this.prNb}`

        this.maracasUrl = "http://fakeurl.com"
        this.completeMaracasUrl = `${this.maracasUrl}/github/pr/${this.baseRepo}/${this.prNb}?callback=${this.completeCallbackUrl}`
        
        this.defaultMax = 50
        this.bcMax = this.defaultMax
        this.clMax = this.defaultMax
        this.dMax = this.defaultMax
    }

    mockRequest = jest.fn((path: string, datas: any) => {
        if (path == `GET /repos/${this.baseRepo}/pulls/${this.prNb}`) {
            console.log(`[mockRequest] Path received from a Get pull: ${path}`)
            return payloadGetPull
        } else if (path == `GET /repos/${this.baseRepo}/commits/${this.branchSHA}/check-runs`) {
            return payloadGetChecks
        } else if (path == `GET /repos/${this.baseRepo}/pulls`) {
            return payloadGetPulls
        } else if (path == `POST /repos/${this.baseRepo}/check-runs`) {
            return payloadPostCheck
        } else {
            console.log(`[mockRequest] Path received: ${path}`)
            return undefined
        }
    })
}