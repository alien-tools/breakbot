import nock from "nock";

import payloadPull from "./fixtures/pull_request.opened.json";
import payloadCheck from "./fixtures/check_run.requested_action.json";

import { reportDatas, webhookDatas } from "../src/authDatas";

import * as globalVars from './globalVarsTests'

import { Octokit } from '@octokit/core'
jest.mock('@octokit/core') //if not explicitly mocked, seems to act differently
//import { Octokit } from "@octokit/core";

import { createAppAuth } from "@octokit/auth-app"


describe("Test webhookDatas", () => {

    var mockOctokit = {
        request: globalVars.mockRequest
    }

    var mockDatas: webhookDatas
    var mockContext: {
        octokit: any,
        payload: any
    }

    beforeEach(() => {
        mockDatas = new webhookDatas("ImMeta/breakbotLib", 2, mockOctokit)
        mockDatas.headSHA = globalVars.branchSHA
    })

    test("fromPr() correctly creates a data structure", async (done) => {
        mockContext = {
            octokit: mockOctokit,
            payload: payloadPull
        }

        mockDatas.prNb = globalVars.prNb

        const myDatas = webhookDatas.fromPr(mockContext)

        done(expect(myDatas).toStrictEqual(mockDatas))
    })

    //add test after a synchronize ?

    test("fromCheck() correctly creates a data structure", async (done) => {
        mockContext = {
            octokit: mockOctokit,
            payload: payloadCheck
        }

        const myDatas = webhookDatas.fromCheck(mockContext)

        done(expect(myDatas).toStrictEqual(mockDatas))
    })

    test("getPrNb() correctly get the pull request number", async (done) => {
        await mockDatas.getPrNb()

        done(expect(mockDatas.prNb).toStrictEqual(globalVars.prNb))
    })

    test("getCheck() correctly return a checkId when used with webhook datas", async (done) => {
        mockDatas.prNb = globalVars.prNb

        await mockDatas.getCheck()

        done(expect(mockDatas.checkId).toStrictEqual(globalVars.checkId))
    })

    //test("getConfig returns the config")

    //afterEach(() => { })
})

describe("Test reportDatas", () => {

    var mockOctokit = { request: globalVars.mockRequest }

    var mockDatas: reportDatas

    beforeAll(() => {
        nock.disableNetConnect();
    })

    beforeEach(() => {
        mockDatas = new reportDatas(globalVars.baseRepo, globalVars.installationId)
        mockDatas.prNb = globalVars.prNb
    })

    test("fromPost() creates a correct data structure", async (done) => {
        var myDatas = reportDatas.fromPost(globalVars.baseRepo, globalVars.installationId, globalVars.prNb)

        done(expect(myDatas).toStrictEqual(mockDatas))
    })

    test("connectToGit() creates an octokit", async (done) => { //The difficult part
        const mockArguments = {
            auth: {
                appId: globalVars.appId.toString(),
                installationId: globalVars.installationId,
                privateKey: globalVars.privateKey
            },
            authStrategy: createAppAuth
        }

        mockDatas.connectToGit()

        //console.log(`[test] My octokit:`)
        //console.log(mockDatas.myOctokit) // why is the octokit complete if octokit is not explicitly mocked ?

        done(expect(Octokit).toHaveBeenCalledWith(mockArguments)) //to improve
    })

    test("getCheck() correctly return a checkId when used with reportDatas", async (done) => {
        mockDatas.myOctokit = mockOctokit

        await mockDatas.getCheck()

        done(expect(mockDatas.checkId).toStrictEqual(globalVars.checkId))
    })

    //test("getConfig returns the config")

    afterAll(() => {
        nock.restore()
        nock.cleanAll();
        nock.enableNetConnect();
    })
})