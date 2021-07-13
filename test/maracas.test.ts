import nock from "nock"
import { webhookData } from "../src/authData"
import * as maracas from "../src/maracas"
import { globalVars } from "./globalVarsTests"

describe("Test interractions with Maracas", () => {

    var myVars = new globalVars()

    const mockOctokit = {
        request: myVars.mockRequest
    }

    const mockDatas = new webhookData(myVars.baseRepo, myVars.installationId, mockOctokit)
    mockDatas.prNb = myVars.prNb

    beforeAll(() => {
        nock.disableNetConnect()
    })

    test("sendRequest sends a correct request to Maracas", async (done) => {
        const scope = nock(myVars.maracasUrl, {
                reqheaders: {
                    'Content-Type': 'application/json',
                'installationId': myVars.installationId.toString()
                }
            })
            .post(myVars.completeMaracasUrl.slice(myVars.maracasUrl.length))
            .reply(202)
        await maracas.sendRequest(mockDatas)
        done(expect(scope.isDone()).toBe(true))
        done(expect(mockDatas.myOctokit.request).toHaveBeenCalled())
    })

    afterEach(() => {
        nock.restore()
        nock.cleanAll()
    })

    afterAll(() => {
        nock.enableNetConnect()
    })
})