import { Probot } from "probot";
const bodyParser = require("body-parser")

import { pollInteraction, pushInteraction, testInteraction} from "./message_api";
import { State } from "./globalState";
import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app"
import { postComment } from "./post_comment";

var global = require("../src/globalState")

const connectAndComment = async function (myJson: any) {
  const appOctokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: process.env.APP_ID,
      privateKey: process.env.PRIVATE_KEY,
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      installationId: myJson.installationId
    },
  });

  postComment(myJson, appOctokit, myJson.baseBranch, myJson.owner, myJson.repo, myJson.issueNumber)
}

export = (app: Probot, option: any) => {//({ Probot, getRouter: any }) {
  app.log.info("The app is up !")

  //to access .env variables
  require('dotenv').config()

  //if push state, configure express
  if (global.current_state == State.push) {
    const router = option.getRouter("/probot");

    router.use(bodyParser.json())

    router.get("/publish", (req: any, res:any ) => {
      //console.log("Get these infos: " + req.body.owner)
      connectAndComment(req.body)
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
