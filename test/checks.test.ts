import nock from "nock"
import { reportDatas, webhookDatas } from "../src/authDatas"
import * as globalVars from "./globalVarsTests"
import * as checksManagement from "../src/checksManagement"
import payloadv2 from "./fixtures/maracas.v2.json";

describe("Testing check management in normal conditions", () => {

    const mockOctokit = {
        request: globalVars.mockRequest
    }

    var mockWebhookDatas = new webhookDatas(globalVars.baseRepo, globalVars.installationId, mockOctokit) // could be moved to globalVars
    mockWebhookDatas.headSHA = globalVars.branchSHA
    mockWebhookDatas.prNb = globalVars.prNb

    //ok because of the tests ?
    var mockReportDatas = new reportDatas(globalVars.baseRepo, globalVars.installationId)
    mockReportDatas.prNb = globalVars.prNb
    mockReportDatas.myOctokit = mockOctokit
    mockReportDatas.checkId = globalVars.checkId

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
            head_sha: globalVars.branchSHA,
            status: "queued",
            output: {
                title: "Sending request to the api...",
                summary: ""
            }
        }

        checksManagement.createCheck(mockWebhookDatas)

        done(expect(mockOctokit.request).toBeCalledWith(`POST /repos/${globalVars.baseRepo}/check-runs`, check))
    })

    test("progressCheck", async (done) => {
        mockWebhookDatas.checkId = globalVars.checkId

        const check =
        {
            status: "in_progress",
            output: {
                title: "Maracas is processing...",
                summary: ""
            }
        }
        
        checksManagement.inProgress(mockWebhookDatas)

        done(expect(mockOctokit.request).toBeCalledWith(`PATCH /repos/${ globalVars.baseRepo }/check-runs/${ globalVars.checkId }`, check))
    })

    test("finalUpdate", async (done) => {
        checksManagement.finalUpdate(mockReportDatas, payloadv2)

        done(expect(mockOctokit.request.mock.calls[0][0]).toStrictEqual(`PATCH /repos/${globalVars.baseRepo}/check-runs/${globalVars.checkId}`))
    })

    afterAll(() => {
        nock.restore()
        nock.cleanAll();
        nock.enableNetConnect();
    });
})