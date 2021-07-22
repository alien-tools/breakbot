import nock from "nock"
import { reportData, webhookData } from "../src/authData"
import { globalVars } from "./globalVarsTests"
import * as checksManagement from "../src/checksManagement"
import payloadv2 from "./fixtures/maracas.v2.json";
import { parseJsonMain } from "../src/formatJson";

jest.mock('../src/formatJson.ts', () => ({
    parseJsonMain: jest.fn((Json: any, bcMax: number, clientMax: number) => {
        return (["Title", "Summary", "Text"])
    })
}))

describe("Testing check management in normal conditions", () => {

    var myVars = new globalVars()

    const mockOctokit = {
        request: myVars.mockRequest
    }

    var mockWebhookDatas = new webhookData(myVars.baseRepo, myVars.installationId, mockOctokit) // could be moved to globalVars
    mockWebhookDatas.headSHA = myVars.branchSHA
    mockWebhookDatas.prNb = myVars.prNb

    //ok because of the tests ?
    var mockReportDatas = new reportData(myVars.baseRepo, myVars.installationId)
    mockReportDatas.prNb = myVars.prNb
    mockReportDatas.myOctokit = mockOctokit
    mockReportDatas.checkId = myVars.checkId

    beforeAll(() => {
        nock.disableNetConnect();
    })

    beforeEach(() => {
        mockOctokit.request.mockClear()
    })

    test("createCheck", async (done) => {
        var check =
        {
            name: "Breakbot report",
            head_sha: myVars.branchSHA,
            status: "queued",
            output: {
                title: "Sending request to the api...",
                summary: ""
            }
        }

        checksManagement.createCheck(mockWebhookDatas)

        done(expect(mockOctokit.request).toBeCalledWith(`POST /repos/${myVars.baseRepo}/check-runs`, check))
    })

    test("progressCheck", async (done) => {
        mockWebhookDatas.checkId = myVars.checkId

        const check =
        {
            status: "in_progress",
            output: {
                title: "Maracas is processing...",
                summary: ""
            }
        }
        
        checksManagement.inProgress(mockWebhookDatas)

        done(expect(mockOctokit.request).toBeCalledWith(`PATCH /repos/${myVars.baseRepo}/check-runs/${myVars.checkId }`, check))
    })

    test("failed", async (done) => {
        mockWebhookDatas.checkId = myVars.checkId

        const check =
        {
            status: "completed",
            conclusion: "cancelled",
            output: {
                title: "Something went wrong",
                summary: "Not found"
            }
        }

        checksManagement.failed(mockWebhookDatas, "Not found")

        done(expect(mockOctokit.request).toBeCalledWith(`PATCH /repos/${myVars.baseRepo}/check-runs/${myVars.checkId}`, check))
    })

    test("finalUpdate, no config", async (done) => {
        checksManagement.finalUpdate(mockReportDatas, payloadv2)

        expect(parseJsonMain).toBeCalledWith(payloadv2, myVars.defaultMax, myVars.defaultMax)
        done(expect(mockOctokit.request.mock.calls[0][0]).toStrictEqual(`PATCH /repos/${myVars.baseRepo}/check-runs/${myVars.checkId}`))
    })

    test("finalUpdate, simple config", async (done) => { // to complete
        mockReportDatas.config = {}
        mockReportDatas.config.maxDisplayedBC = myVars.bcMax
        mockReportDatas.config.maxDisplayedClients = myVars.clMax

        checksManagement.finalUpdate(mockReportDatas, payloadv2)

        expect(parseJsonMain).toBeCalledWith(payloadv2, myVars.bcMax, myVars.clMax)
        done(expect(mockOctokit.request.mock.calls[0][0]).toStrictEqual(`PATCH /repos/${myVars.baseRepo}/check-runs/${myVars.checkId}`))
    })

    afterAll(() => {
        nock.restore()
        nock.cleanAll();
        nock.enableNetConnect();
    });
})