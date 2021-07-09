import nock from "nock"
import { webhookDatas } from "../src/authDatas"
import * as Maracas from "../src/Maracas"
import * as globalVars from "./globalVarsTests"

import payloadv1 from "./fixtures/maracas.v1.json";
import payloadv2 from "./fixtures/maracas.v2.json";
import { parseJsonMain } from "../src/formatJson";

import { readFileSync } from "fs";
const path = require("path");

export const V1title = readFileSync(path.join(__dirname, "/fixtures/reports/V1-title.md"),"utf-8");
export const V1summary = readFileSync(path.join(__dirname, "/fixtures/reports/V1-summary.md"), "utf-8");
export const V1message = readFileSync(path.join(__dirname, "/fixtures/reports/V1-message.md"), "utf-8");

export const V2title = readFileSync(path.join(__dirname, "/fixtures/reports/V2-title.md"), "utf-8");
export const V2summary = readFileSync(path.join(__dirname, "/fixtures/reports/V2-summary.md"), "utf-8");
export const V2message = readFileSync(path.join(__dirname, "/fixtures/reports/V2-message.md"), "utf-8");

const fetch = require('node-fetch');
jest.mock('node-fetch')

describe("Test interractions with Maracas", () => {

    const mockOctokit = {
        request: globalVars.mockRequest
    }

    const mockDatas = new webhookDatas(globalVars.baseRepo, globalVars.installationId, mockOctokit)
    mockDatas.prNb = globalVars.prNb

    beforeAll(() => {
        nock.disableNetConnect()
    })

    test("sendRequest sends a correct request to Maracas", async (done) => {
        Maracas.sendRequest(mockDatas)

        const fetchArguments = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'installationId': globalVars.installationId
            }
        }

        done(expect(fetch).toHaveBeenCalledWith(globalVars.completeMaracasUrl, fetchArguments )
        )
    })

    afterEach(() => {
        nock.restore()
        nock.cleanAll();
    })

    afterAll(() => {
        nock.enableNetConnect()
    })
})

describe("Checks that the Json received from Maracas is correctly parsed", () => {
    test("mainParse, no clients tested", async (done) => {
        const myReport = parseJsonMain(payloadv1, 10)
        
        const mockReportv1 = [
            V1title,
            V1summary,
            V1message
        ]

        done(expect(myReport).toStrictEqual(mockReportv1))
    })

    test("mainParse, with clients", async (done) => {
        const myReport = parseJsonMain(payloadv2, 10)

        const mockReportv2 = [
            V2title,
            V2summary,
            V2message
        ]

        done(expect(myReport).toStrictEqual(mockReportv2))
    })
})