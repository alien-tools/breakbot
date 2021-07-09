import { readFileSync } from "fs";
const path = require("path");

import payloadGetChecks from "./fixtures/getChecks.json"
import payloadGetPulls from "./fixtures/getPulls.json"
import payloadGetPull from "./fixtures/getPull.json"

export const baseRepo = "ImMeta/breakbotLib"
export const prNb = 1
export const branchSHA = "headsha1"
export const checkId = 30
export const installationId = 2
export const appId = 1871
export const privateKey = readFileSync(path.join(__dirname, "/fixtures/mock-cert.pem"),"utf-8");

export const callbackUrl = "https://testapp.com"
const completeCallbackUrl = `${callbackUrl}/breakbot/pr/${baseRepo}/${prNb}`

export const maracasUrl = "http://fakeurl.com"
export const completeMaracasUrl = `${maracasUrl}/github/pr/${baseRepo}/${prNb}?callback=${completeCallbackUrl}`


export const mockRequest = jest.fn((path: string, datas: any) => {
    if (path == `GET /repos/${baseRepo}/pulls/${prNb}`) {
        return payloadGetPull
    } else if (path == `GET /repos/${baseRepo}/commits/${branchSHA}/check-runs`) {
        return payloadGetChecks
    } else if (path == `GET /repos/${baseRepo}/pulls`) {
        return payloadGetPulls
    } else {
        console.log(path)
        return undefined
    }
})