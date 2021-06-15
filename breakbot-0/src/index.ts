import { Probot } from "probot";
//var jwt = require('jsonwebtoken');
//const fs = require('fs');
//const OpenSSL = require("openssl-nodejs");

//import or declare a function to gather the information from the maracas api and format the 
import { pollInteraction, pushInteraction, testInteraction} from "./message_api";
import { State } from "./globalState";
import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app"

var global = require("../src/globalState")

const connectAndComment = async function () {
  const appOctokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: process.env.APP_ID,
      privateKey: process.env.PRIVATE_KEY,
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      installationId: 17384350
    },
  });

  console.log("Created an octokit: " + appOctokit.auth)

  // Send requests as GitHub App
  //const slug = await appOctokit.request("GET /users");
  //console.log("authenticated as %s", slug);

  const prComment = {
    owner: "Metamaus",
    repo: "breakbotLib",
    issue_number: 2,
    body: "Spontaneous comment"
  }

  await appOctokit.issues.createComment(prComment)
}

export = (app: Probot, option: any) => {//({ Probot, getRouter: any }) {
  app.log.info("The app is up !")

  //to access .env variables
  require('dotenv').config()

  //if push state, configure express
  if (global.current_state == State.push) {
    const router = option.getRouter("/probot/:id");

    //received an answer from maracas, id is an url ?
    router.get("/publish", (req: any, res:any) => {
      //how to connect again to the repo ?
      console.log("Get these infos: " + req)
      connectAndComment()
      //foo()//app)
      res.send("Received")
    })
  }

  app.on("pull_request.opened", async (context) => {
    //const config: AppConfig = await context.config<AppConfig>(ConfigFilename, DefaultConfig)
    const temp = context.payload.pull_request;
    console.log("Etat actuel: " + global.current_state)

    if (global.current_state == State.poll)
    {
      await pollInteraction(temp.base.ref, temp.user.login, temp.head.repo.name, context.payload.number, context);      
    }
    else if (global.current_state == State.test)
    {
      testInteraction(context, temp.base.ref)
    }
    else if (global.current_state == State.push)
    {
      await pushInteraction(temp.user.login, temp.head.repo.name, context.payload.number)
    }
  });
  
  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
};
