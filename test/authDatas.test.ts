import nock from "nock";

import payloadPull from "./fixtures/pull_request.opened.json";
import payloadCheck from "./fixtures/check_run.requested_action.json";

import { reportData, webhookData } from "../src/authData";

import { globalVars } from './globalVarsTests'

import { Octokit } from '@octokit/core'
jest.mock('@octokit/core') //if not explicitly mocked, seems to act differently

import { createAppAuth } from "@octokit/auth-app"

var myVars = new globalVars()

//import { config } from "@probot/octokit-plugin-config"
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

describe("Test webhookDatas", () => {

    var mockOctokit = {
        request: myVars.mockRequest
    }

    var mockDatas: webhookData
    var mockContext: {
        octokit: any,
        payload: any
    }

    beforeEach(() => {
        mockDatas = new webhookData("ImMeta/breakbotLib", 2, mockOctokit)
        mockDatas.headSHA = myVars.branchSHA
    })

    test("fromPr() correctly creates a data structure", async (done) => {
        mockContext = {
            octokit: mockOctokit,
            payload: payloadPull
        }

        mockDatas.prNb = myVars.prNb

        const myDatas = webhookData.fromPr(mockContext)

        done(expect(myDatas).toStrictEqual(mockDatas))
    })

    //add test after a synchronize ?

    test("fromCheck() correctly creates a data structure", async (done) => {
        mockContext = {
            octokit: mockOctokit,
            payload: payloadCheck
        }

        const myDatas = webhookData.fromCheck(mockContext)

        done(expect(myDatas).toStrictEqual(mockDatas))
    })

    test("getPrNb() correctly get the pull request number", async (done) => {
        await mockDatas.getPrNb()

        done(expect(mockDatas.prNb).toStrictEqual(myVars.prNb))
    })

    test("getCheck() correctly return a checkId when used with webhook datas", async (done) => {
        mockDatas.prNb = myVars.prNb

        await mockDatas.getCheck()

        done(expect(mockDatas.checkId).toStrictEqual(myVars.checkId))
    })

    test("getConfig returns the config", async (done) => {
        mockDatas.prNb = myVars.prNb
        mockDatas.checkId = myVars.checkId

        await mockDatas.getConfig()

        done(expect(mockDatas.config).toStrictEqual({
            verbose: true, maxDisplayedBC: 12,
        }))
    })

    //afterEach(() => { })
})

describe("Test reportDatas", () => {

    var mockOctokit = { request: myVars.mockRequest }

    var mockDatas: reportData

    beforeAll(() => {
        nock.disableNetConnect();
    })

    beforeEach(() => {
        mockDatas = new reportData(myVars.baseRepo, myVars.installationId)
        mockDatas.prNb = myVars.prNb
    })

    test("fromPost() creates a correct data structure", async (done) => {
        var myDatas = reportData.fromPost(myVars.baseRepo, myVars.installationId, myVars.prNb)

        done(expect(myDatas).toStrictEqual(mockDatas))
    })

    test("connectToGit() creates an octokit", async (done) => { //The difficult part
        const mockArguments = {
            auth: {
                appId: myVars.appId.toString(),
                installationId: myVars.installationId,
                privateKey: myVars.privateKey
            },
            authStrategy: createAppAuth
        }

        mockDatas.connectToGit()

        done(expect(Octokit).toHaveBeenCalledWith(mockArguments)) //to improve
    })

    test("getCheck() correctly return a checkId when used with reportDatas", async (done) => {
        mockDatas.myOctokit = mockOctokit

        await mockDatas.getCheck()

        done(expect(mockDatas.checkId).toStrictEqual(myVars.checkId))
    })

    test("getConfig returns the config", async (done) => {
        mockDatas.myOctokit = mockOctokit
        mockDatas.prNb = myVars.prNb
        mockDatas.checkId = myVars.checkId

        await mockDatas.getConfig()

        done(expect(mockDatas.config).toStrictEqual({
            verbose: true, maxDisplayedBC: 12,
        }))
    })

    afterAll(() => {
        nock.restore()
        nock.cleanAll();
        nock.enableNetConnect();
    })
})