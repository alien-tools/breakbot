# Break-Bot: code details

## Code sructure

Initialised from the "basic-ts => Comment on new issues - written in TypeScript" probot
[general tuto](https://probot.github.io/docs/)

Composed of different aspects: 
1. The [reception](./src/index.ts) initializes the routes available to communicate with the bot. An http route for Maracas to send the report to the bot and a [webhook](https://docs.github.com/en/developers/webhooks-and-events/webhooks/about-webhooks) endpoint for interracting with the repository.
2. The [handlers](./src/handlers.ts) organizes the reactions of the bot to the events listed above.
3. The [interaction with Maracas](./src/maracas.ts) notify Maracas about the new pull request.
4. The [checks management](./src/checksManagement.ts) contains ll the functions used to create and update checks.
5. The [parsing](./src/formatJson) reads the json received from maracas and format it into an array of three fields: a title, a summary and a complete list of the breaking changes.

These scripts use [authData classes](./src/authData.ts) to store the information needed to authenticate to github and identify the current pull request.

### [AuthData](./src/authData.ts): an abstract class
This class stores the informations about the pull request and contains methods to authenticate to github or complete the missing informations. Implemented in two different subclasses, depending on how they were initialized.

1. **webhookDatas**: initialized from a webhook, which contains a lot of information, including an already initialized [octokit](https://octokit.github.io/rest.js/v18)

2. **reportDatas**: initialized with little informations, to publish Maracas' report.
    - Self-authentication: Instead of connecting with Probot.auth (seen [here](https://probot.github.io/api/latest/classes/probot.html)) we use [octokit identification](https://octokit.github.io/rest.js/v18#authentication) as described [here](https://github.com/octokit/auth-app.js/) to connect again to the repositry whenever necessary.
    For general informations on authentication for github apps, click [here](https://docs.github.com/en/rest/overview/resources-in-the-rest-api#authentication).


### [Reception](./src/index.ts)

- **Webhooks**: Nothing fancy, using the regular expressions from [here](https://probot.github.io/docs/webhooks/) to receive notifications form github.
For details on events names, see [here](https://docs.github.com/en/developers/webhooks-and-events/webhooks/webhook-events-and-payloads)

- **Router**: Using express and the [default router in probot](https://probot.github.io/docs/http/) to receive request form Maracas Api once the job ends (**push** mode)

### [Interractions with MaracasApi](./src/maracas.ts)
This script is called by a handler after a new check is requested: It notifies maracas that a new report is needed, create a new check on the pull request and updates it with the maracas response: if everything is ok, it confirm that maracas is processing the request, else it displays the error message in the check summary.

## Hosting: Heroku
Tutorials:
- [heroku for nodejs](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
- [Preparing an app for heroku](https://devcenter.heroku.com/articles/preparing-a-codebase-for-heroku-deployment) 
- [probot doc for using heroku](https://probot.github.io/docs/deployment/#heroku)

Rq: Probot seems to choose its listenning port correctly for heroku

Also, heroku (in local) only works with the secret key read from file with [fs](https://nodejs.dev/learn/reading-files-with-nodejs) in synchronous mode.Since this method doesn't work with a normal deployement on heroku, we use the sercet key in .env instead.

## Tests
The tests are base on [jest](), and the http requests are mocked with [nock]().

```sh
# run the tests locally
npm test
```

### Testing structure

All variables used during tests are stored in the [globalVars](./test/globalVarsTests.ts) class. This includes:
- URLs
- environment variables
- git variables

The json files used to mock different messages from github and maracas are stored in the [fixture folder](./test/fixtures)

The examples of generated reports (in three parts since the reports are displayed as a Title, a summary and a text), are located in the [reports folder](./test/fixtures/reports).

/!\ Even though the summary and the text support markdown, the title is only saved as a markdown file for practicity and doesn't support markdown on github.