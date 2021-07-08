import nock from "nock";

import payloadPull from "./fixtures/pull_request.opened.json";
import payloadCheck from "./fixtures/check_run.requested_action.json";

import payloadGetChecks from "./fixtures/getChecks.json"
import payloadGetPulls from "./fixtures/getPulls.json"
import payloadGetPull from "./fixtures/getPull.json"

import { reportDatas, webhookDatas } from "../src/authDatas";

import {Octokit} from '@octokit/core'
import { readFileSync } from "fs";
const path = require("path");
jest.mock('@octokit/core') //if not explicitly mocked, seems to act differently
//import { Octokit } from "@octokit/core";

import { createAppAuth } from "@octokit/auth-app"


const baseRepo = "ImMeta/breakbotLib"
const prNb = 1
const branchSHA = "headsha1"
const checkId = 30
const installationId = 2
//const appId = 1871
const privateKey = readFileSync(
  path.join(__dirname, "/fixtures/mock-cert.pem"),
  "utf-8"
);

describe("Test webhookDatas", () => {

  const mockRequest = jest.fn((path: string, datas: any) => {
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

  var mockOctokit = {
    request: mockRequest
  }

  var mockDatas: webhookDatas
  var mockContext: {
    octokit: any,
    payload: any
  }

  beforeEach(() => {
    mockDatas = new webhookDatas("ImMeta/breakbotLib", 2, mockOctokit)
    mockDatas.headSHA = branchSHA
  })

  test("fromPr() correctly creates a data structure", async (done) => {
    mockContext = {
      octokit: mockOctokit,
      payload: payloadPull
    }

    mockDatas.prNb = prNb

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

    done(expect(mockDatas.prNb).toStrictEqual(prNb))
  })

  test("getCheck() correctly return a checkId when used with webhook datas", async (done) => {
    mockDatas.prNb = prNb

    await mockDatas.getCheck()

    done(expect(mockDatas.checkId).toStrictEqual(checkId))
  })

  //test("getConfig returns the config")

  afterEach(() => { })
})

describe("Test reportDatas", () => {
  const mockRequest = jest.fn((path: string, datas: any) => {
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

  var mockOctokit = { request: mockRequest }

  var mockDatas: reportDatas

  beforeEach(() => {
    nock.disableNetConnect();
    mockDatas = new reportDatas(baseRepo, installationId)
    mockDatas.prNb = prNb
  })

  test("fromPost() creates a correct data structure", async (done) => {
    var myDatas = reportDatas.fromPost(baseRepo, installationId, prNb)
    
    done(expect(myDatas).toStrictEqual(mockDatas))
  })

  test("connectToGit() creates an octokit", async (done) => { //The difficult part
    const mockArguments = {
      auth: {
        appId: process.env.APP_ID,
        installationId: installationId,
        privateKey: privateKey
      },
      authStrategy: createAppAuth
    }
    
    mockDatas.connectToGit()

    //console.log(`[test] My octokit:`)
    //console.log(mockDatas.myOctokit) // why is the octokit complete if mock is not explicit ?

    done(expect(Octokit).toHaveBeenCalledWith(mockArguments)) //could be more precise
  }) 

  test("getCheck() correctly return a checkId when used with reportDatas", async (done) => {
    mockDatas.myOctokit = mockOctokit

    await mockDatas.getCheck()

    done(expect(mockDatas.checkId).toStrictEqual(checkId))
  })

  //test("getConfig returns the config")

  afterEach(() => {
    nock.restore()
    nock.cleanAll();
    nock.enableNetConnect();
  })
})