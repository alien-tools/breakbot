const nock = require("nock");
// Requiring our app implementation
const myProbotApp = require("..");
const { Probot, ProbotOctokit } = require("probot");
// Requiring our fixtures
const payloadissues = require("./fixtures/issues.opened");
const payloadpr = require("./fixtures/pull_request.opened");
const payloadassigned = require("./fixtures/pull_request.assigned");
const payloadmeteo = require("./fixtures/meteo.api");
const issueCreatedBody = { body: "Thanks for opening this issue!" };
const prCreatedBody = { body: "Thanks for opening this pull request!",};
const fs = require("fs");
const path = require("path");

const privateKey = fs.readFileSync(
  path.join(__dirname, "fixtures/mock-cert.pem"),
  "utf-8"
);

describe("My Probot app", () => {
  let probot;

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

  test("creates a comment when an issue is opened", async () => {
    const mock = nock("https://api.github.com")
      // Test that we correctly return a test token
      .post("/app/installations/2/access_tokens")
      .reply(200, {
        token: "test",
        permissions: {
          issues: "write",
        },
      })

      // Test that a comment is posted
      .post("/repos/hiimbex/testing-things/issues/1/comments", (body) => {
        expect(body).toMatchObject(issueCreatedBody);
        return true;
      })
      .reply(200);
    
    // Receive a webhook event
    payload = payloadissues;
    await probot.receive({ name: "issues", payload });

    expect(mock.pendingMocks()).toStrictEqual([]);
  });

  test("creates a comment when a pull request is opened", async () => {
    const mock = nock("https://api.github.com")
      // Test that we correctly return a test token
      .post("/app/installations/2/access_tokens")
      .reply(200, {
        token: "test",
        permissions: {
          pull_request: "write", //or pulls maybe
        },
      })
      // Test that a comment is posted
      .post("/repos/hiimbex/testing-things/issues/2/comments", (body) => {
        expect(body).toMatchObject(prCreatedBody);
        return true;
      })
      .reply(200);

    // Receive a webhook event
    payload = payloadpr;
    await probot.receive({ name: "pull_request", payload });

    expect(mock.pendingMocks()).toStrictEqual([]);
  })
  
  test("Welcomes a new user", async () => {
    nock.enableNetConnect('https://www.prevision-meteo.ch/services/json/Bordeaux')

    const mock = nock("https://api.github.com")      
      
      // Test that a comment is posted
      .post("/repos/hiimbex/testing-things/issues/2/comments", (body) => {
        expect(body).not.toMatch("");
        return true;
      })
      .reply(200);

    // Receive a webhook event
    payload = payloadassigned;
    await probot.receive({ name: "pull_request", payload });

    // Receive an answer from the API
    payload = payloadmeteo;
    await probot.receive({ name: "Meteo", payload });

    expect(mock.pendingMocks()).toStrictEqual([]);

    //const mock2 = nock('https://www.prevision-meteo.ch').
  })

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });
});

// For more information about testing with Jest see:
// https://facebook.github.io/jest/

// For more information about testing with Nock see:
// https://github.com/nock/nock
