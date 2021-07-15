import nock from "nock"
import { webhookData } from "../src/authData"
import * as maracas from "../src/maracas"
import * as checks from "../src/checksManagement"
import { globalVars } from "./globalVarsTests"

jest.mock('../src/checksManagement')

describe("Test interractions with Maracas", () => {

    var myVars = new globalVars()

    const mockOctokit = {
        request: myVars.mockRequest
    }

    const mockDatas = new webhookData(myVars.baseRepo, myVars.installationId, mockOctokit)
    mockDatas.prNb = myVars.prNb

    beforeEach(() => {
        nock.disableNetConnect()
    })

    test("sendRequest updates the checks if Maracas answers 202", async (done) => {
        const scope = nock(myVars.maracasUrl, {
                reqheaders: {
                    'Content-Type': 'application/json',
                    'installationId': myVars.installationId.toString()
                }
            })
            .post(myVars.completeMaracasUrl.slice(myVars.maracasUrl.length))
            .reply(202)
        
        await maracas.sendRequest(mockDatas)

        expect(scope.isDone()).toBe(true)
        done(expect(checks.inProgress).toHaveBeenCalled())
    })

    test("sendRequest doesn't update the test if Maracas sends an error", async (done) => {
        const scope = nock(myVars.maracasUrl, {
                reqheaders: {
                    'Content-Type': 'application/json',
                    'installationId': myVars.installationId.toString()
                }
            })
            .post(myVars.completeMaracasUrl.slice(myVars.maracasUrl.length))
            .reply(404)

        await maracas.sendRequest(mockDatas)

        expect(scope.isDone()).toBe(true)
        done(expect(checks.inProgress).not.toHaveBeenCalled())
    })

    afterEach(() => {
        jest.clearAllMocks()
        nock.cleanAll()
        nock.enableNetConnect()
    })
})