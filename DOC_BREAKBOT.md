# Break-Bot: code details

## How to start break-bot

### Locally
This doesn't work right now unless you change the adress both in the .env and on the app configuration page.
```sh
# Install dependencies
npm install

# Build the app
npm run build

# Run the bot
npm start
```

### Locally with heroku
Not recommended since there is an issue with config vars (see last part, Hosting, for more details).
Uses the Procfile to start, instead of the package.json
```sh
# Install dependencies
npm install

# Build the app
npm run build

# Run the bot
heroku local web
```

### Deploy on heroku
For more informations, see the last part **Hosting: Heroku**
```sh
# To push from main
git push heroku main

# To push from a different branch than main
git push heroku testbranch:main
```

## Config vars

Located in .env during local developpment, and directly managed by heroku.

### Used by probot
- APP\_ID: the id given by github to the app when registered
- GITHUB\_CLIENT\_ID: ?
- GITHUB\_CLIENT\_SECRET: ?
- PRIVATE\_KEY: the RSA access key used to connect as an app to github, read differently in heroku local development mode
- WEBHOOk\_PROXY\_URL: the adress of the app (is also declared diectly on github)
- WEBHOOK\_SECRET: ?

### Unique to breakbot
- MARACAS\_URL: The url of the api Maracs, which performs the tests)

## Code sructure

Initialised from the "basic-ts => Comment on new issues - written in TypeScript" probot
[general tuto](https://probot.github.io/docs/)

Composed of different levels: 
- Reception: from webhooks and http requests
- Handlers
- Interaction with Maracas
- Checks management
- Parsing

These scripts use authDatas structures to authenticate to github and store the information needed.

### AuthDatas
Store the informations and contains methods to authenticate to github or complete the missing informations.

#### Self-authentication
Instead of connecting with Probot.auth (seen [here](https://probot.github.io/api/latest/classes/probot.html))
We use [octokit identification](https://octokit.github.io/rest.js/v18#authentication)
As described [here](https://github.com/octokit/auth-app.js/)
To connect again to the repositry whenever necessary.
For general informations on authentification for github apps, click [here](https://docs.github.com/en/rest/overview/resources-in-the-rest-api#authentication)

### Reception
[Script](./src/index.ts)
The main script: creates the probot app and the endpoints. Create a check on the last commit added to the PR.

#### Webhooks
Nothing fancy, using the regular expressions from [here](https://probot.github.io/docs/webhooks/) to receive notifications form github.
For details on events names, see [here](https://docs.github.com/en/developers/webhooks-and-events/webhooks/webhook-events-and-payloads)

#### Router
Using express and the [default router in probot](https://probot.github.io/docs/http/) to receive request form Maracas Api once the job ends (**push** mode)

### Handlers
2 uses cases: they deal with a webhook or with a request from Maracas.

### Interractions with MaracasApi
[Script](./src/messagesApis.ts)
Deals with the Maracas Api: sends the request and wait for the answer, wether in push mode, or in poll mode.
Rq: For the moment, if there is an error with the initial request, break-bot just forfeit on this PR.

### Checks management
[Checks management](./src/checksManagement.ts)
Used to create the check, mark them as in progress, and upload the last report.

### Layout the final report: parsing the Json
[Script](./src/formatJson.ts)
Layout correctly the datas gathered. 

## Hosting: Heroku
Tutorials:
- [heroku for nodejs](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
- [Preparing an app for heroku](https://devcenter.heroku.com/articles/preparing-a-codebase-for-heroku-deployment) 
- [probot doc for using heroku](https://probot.github.io/docs/deployment/#heroku)

Rq: Probot seems to choose its listenning port correctly for heroku (to check during tests)

Also, heroku (in local) only works with the secret key read from file with [fs](https://nodejs.dev/learn/reading-files-with-nodejs) in synchronous mode.Since this method doesn't work with a normal deployement on heroku, we use the sercet key in .env instead.

## Tests: jest

### Testing structure

All variables used for tests are stored in the [globalVarsTests](./test/globalVarsTests.ts). This includes:
- URLs
- environment variables
- git variables

The json files used to mock different messages from github and maracas are store in the [fixture folder](./test/fixtures)

The examples of generated reports (in three parts since the comments are displayed as a Title, a summary and a text), are located in the [reports folder](./test/fixtures/reports).

/!\ Even though the summary and the text support markdown, the title is only saved as a markdown file for practicity and doesn't support markdown on github.