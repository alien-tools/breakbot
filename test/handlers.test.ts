import * as handlers from "../src/handlers"
import {globalVars} from "./globalVarsTests"

import payloadNewPr from "./fixtures/pull_request.opened.json"
import payloadNewCheck from "./fixtures/check_run.requested_action.json"
import payloadReport from "./fixtures/maracas.v2.json"

import nock from "nock"
import { webhookData } from "../src/authData"

const myVars = new globalVars()

import { sendRequest } from "../src/maracas"
jest.mock("../src/maracas")

//import { Octokit } from '@octokit/core'
jest.mock('@octokit/core', () => ({
    constructor: (args: any) => {
        const myOctokit = {
            request: myVars.mockRequest
        }
        return myOctokit
    }
}))

jest.mock("@probot/octokit-plugin-config", () => ({
    config: ((myOctokit: any) => {
        return {
            config: {
                get: ((args: any) => {
                    var addressSplit = myVars.baseRepo.split("/")

                    if ((args.owner == addressSplit[0]) && (args.repo = addressSplit[1]))
                        return {
                            config: {
                                verbose: true,
                                maxDisplayedBC: 12,
                            }
                        }
                    else {
                        return undefined
                    }
                })
            }
        }
    })
}))

describe("Testing webhookhandler", () => {

    const mockOctokit = {
        request: myVars.mockRequest
    }

    const mockDatas = new webhookData("ImMeta/breakbotLib", 2, mockOctokit)
    mockDatas.headSHA = myVars.branchSHA
    mockDatas.prNb = myVars.prNb
    mockDatas.checkId = myVars.checkId
    mockDatas.config = {
        maxDisplayedBC: 12,
        verbose: true,
    }

    beforeEach(() => {
        nock.disableNetConnect();
        jest.clearAllMocks()
    })

    test("Opened pull request, no error", async (done) => {

        var mockContext = {
            name: 'pull_request',
            octokit: mockOctokit,
            payload: payloadNewPr
        }

        await handlers.webhookHandler(mockContext)

        done(expect(sendRequest).toHaveBeenCalledWith(mockDatas))
    })

    test("Rerequested test, no error", async (done) => {

        var mockContext = {
            name: 'check_run',
            octokit: mockOctokit,
            payload: payloadNewCheck
        }

        await handlers.webhookHandler(mockContext)

        done(expect(sendRequest).toHaveBeenCalledWith(mockDatas))
    })

    afterEach(() => {
        nock.enableNetConnect()
    })
})

describe.skip("Testing reportHandler", () => {
    test("Maracas reply 200", async (done) => {
        const addressSplit = myVars.baseRepo.split("/")

        const mockReq = {
            status: 200,
            headers: {
                installationid: myVars.installationId //Json => lowercase
            },
            params: {
                owner: addressSplit[0],
                repo: addressSplit[1]
            },
            body: payloadReport
        }

        await handlers.maracasHandler(mockReq)
    })
})