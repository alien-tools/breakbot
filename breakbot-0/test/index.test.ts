// You can import your modules
// import index from '../src/index'

import nock from "nock";

// Requiring our app implementation
import myProbotApp from "../src/index";
import { Probot, ProbotOctokit } from "probot";

// Requiring our fixtures
import payload from "./fixtures/pull_request.opened.json";
const prCreatedBody = { body: "" };
const fs = require("fs");
const path = require("path");

const privateKey = fs.readFileSync(
  path.join(__dirname, "fixtures/mock-cert.pem"),
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
  });

  test("creates a comment when a pull request is opened: poll, no errors", async (done) => {
    const mock = nock("https://api.github.com")
      // Test that we correctly return a test token
      .post("/app/installations/2/access_tokens")
      .reply(200, {
        token: "test",
        permissions: {
          pull_request: "write",
        },
      })

      // Test that a comment is posted
      .post("/repos/Metamaus/breakbotLib/issues/1/comments", (body: any) => {
        done(expect(body).not.toMatchObject(prCreatedBody));
        return true;
      })
      .reply(200);

    // Receive a webhook event
    await probot.receive({ name: "pull_request", payload });

    expect(mock.pendingMocks()).toStrictEqual([]);
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });
});

// For more information about testing with Jest see:
// https://facebook.github.io/jest/

// For more information about using TypeScript in your tests, Jest recommends:
// https://github.com/kulshekhar/ts-jest

// For more information about testing with Nock see:
// https://github.com/nock/nock

describe("API tests", () => {
  beforeEach(() => {
    nock.disableNetConnect();
  });

  test("Poll Maracas API, no errors, no delay", async (done) => {
    const mock2 = nock("https://anatman.ddns.net:8080/github/pr")
      // Test the post
      .post("/hiimbex/testing-things/2")
      .reply(202)

      // Test the get
      .get("/hiimbex/testing-things/2")
      .reply(200, {
        "message": "ok",
        "delta": {
          "breakingChanges": [
            {
              "type": "methodNoLongerStatic",
              "declaration": "main.methodNoLongerStatic.IMethodNoLongerStatic.methodNoLongerStatic()",
              "path": "/src/main/methodNoLongerStatic/IMethodNoLongerStatic.java",
              "url": "https://github.com/tdegueul/comp-changes/blob/main//src/main/methodNoLongerStatic/IMethodNoLongerStatic.java#L5-L7",
              "startLine": 5,
              "endLine": 7,
              "sourceCompatible": false,
              "binaryCompatible": false
            },
          ],
        }
      })
    
    //call the function poll
    
    expect(mock2.pendingMocks()).toStrictEqual([]);
  })

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });
})