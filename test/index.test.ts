/*import nock from "nock";

// Requiring our app implementation
import myProbotApp from "../src/index";
import { Probot, ProbotOctokit } from "probot";

// Requiring our fixtures
const prCreatedBody = { body: "" };
const fs = require("fs");
const path = require("path");

const privateKey = fs.readFileSync(
  path.join(__dirname, "/fixtures/mock-cert.pem"),
  "utf-8"
);*/

import payloadPull from "./fixtures/pull_request.opened.json";
import payloadCheck from "./fixtures/check_run.requested_action.json"
import { webhookDatas } from "../src/authDatas";

/*
describe("Bot tests", () => {
  let probot: any;

  beforeEach(() => {
    nock.disableNetConnect();
    probot = new Probot({
      appId: 123,
      privateKey,
      // disable request throttling and retries for testing
      Octokit: ProbotOctokit.defaults({
        retry: { enabled: false },
        throttle: { enabled: false },
      }),
    });
    // Load our app into probot
    probot.load(myProbotApp);
    nock.recorder.rec()
  });

  test("creates a comment when a pull request is opened: no maracas API", async (done) => {
    const mock = nock("https://api.github.com")
      // Test that we correctly return a test token
      .post("/app/installations/2/access_tokens")
      .reply(200, {
        type: "token",
        tokenType: "installation",
        token: "test",
        installationId: 2,
        repositories: ["breakbotLib"],
        repository_ids: [374690513],
        permissions: {
          checks: "write",
          issues: "write",
          metadata: "read",
          pull_request: "write"
        },
      })

      // Test that a comment is posted
      .post("/repos/Metamaus/breakbotLib/issues/1/comments", (body: any) => {
        done(expect(body).not.toMatchObject(prCreatedBody));
        return true;
      })
      .reply(200)

    // Receive a webhook event
    await probot.receive({ name: "pull_request", payload });

    expect(mock.pendingMocks()).toStrictEqual([]);
  });

  afterEach(() => {
    nock.restore()
    nock.cleanAll();
    nock.enableNetConnect();
  });
});
*/

const baseRepo = "ImMeta/breakbotLib"
const prNb = 1
const branchSHA = "headsha1"

describe("Test data classes", () => {

  const mockRequest = jest.fn((path: string, datas: any) => {
    if (path == `GET /repos/${baseRepo}/pulls/${prNb}`) {
      
    } else if (path == `GET /repos/${baseRepo}/commits/${branchSHA}/check-runs`) {

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
    mockDatas.headSHA = "headsha1"
  })

  test("webhookDatas.fromPr() correctly creates a data structure", async (done) => {
    mockContext = {
      octokit: mockOctokit,
      payload: payloadPull
    }

    mockDatas.prNb = 1

    const myDatas = webhookDatas.fromPr(mockContext)

    done(expect(myDatas).toStrictEqual(mockDatas))
  })

  //add test after a synchronize ?

  test("webhookDatas.fromCheck() correctly creates a data structure", async (done) => {
    mockContext = {
      octokit: mockOctokit,
      payload: payloadCheck
    }

    const myDatas = webhookDatas.fromCheck(mockContext)

    done(expect(myDatas).toStrictEqual(mockDatas))
  })

  //test getPrNb

  //test("connectToGit creates a functionnal octokit") //The difficult part

  test("getCheck correctly return a checkId", async (done) => {
    
  })

  afterEach(() => { })
})