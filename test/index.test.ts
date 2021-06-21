import nock from "nock";

// Requiring our app implementation
import myProbotApp from "../src/index";
import { Probot, ProbotOctokit } from "probot";
import { State, defaultState } from "../src/globalState"
var global = require("../src/globalState")

// Requiring our fixtures
import payload from "./fixtures/pull_request.opened.json";
const prCreatedBody = { body: "" };
const fs = require("fs");
const path = require("path");

const privateKey = fs.readFileSync(
  path.join(__dirname, "/fixtures/mock-cert.pem"),
  "utf-8"
);

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
    global.currentState = State.test

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
    global.currentState = defaultState
  });
});