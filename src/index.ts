import { Probot } from "probot";
import { pollInteraction, pushInteraction, testInteraction} from "./messagesApi";
import { State } from "./globalState";
import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app"
import { postComment } from "./postReport";

const global = require("../src/globalState")
const bodyParser = require("body-parser")


const connectAndComment = async function (myJson: any, baseBranch: string, owner: string, repo: string, prId: number) {
  // "Traduction" function for postComment

  const appOctokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: process.env.APP_ID,
      privateKey: process.env.PRIVATE_KEY,
      installationId: myJson.installationId
    },
  });

  postComment(myJson, appOctokit, baseBranch, owner, repo, prId)
}

//---Declaration of the app---
export = (app: Probot, option: any) => {

  //If the bot is in push state, the endpoint for maracas is set up
  if (global.currentState == State.push) {
    const router = option.getRouter("/breakbot");

    router.use(bodyParser.json())

    router.post("/pr/:owner/:repo/:prId/:baseBranch", (req: any, res: any) => {
      connectAndComment(req.body, req.params.baseBranch, req.params.owner, req.params.repo, req.params.prId)
      res.status(200)
      res.send("Received")
    })
  }

  app.on("pull_request.opened", async (context) => {
    const temp = context.payload.pull_request;

    if (global.currentState == State.poll)
    {
      await pollInteraction(temp.base.ref, temp.head.repo.owner.login, temp.head.repo.name, context.payload.number, context);
    }

    else if (global.currentState == State.test)
    {
      testInteraction(context, temp.base.ref)
    }
      
    else if (global.currentState == State.push)
    {
      // avoid the case where installation is undefined
      const instal = context.payload.installation
      var installationId = 0
      if (instal != undefined)
      {
        installationId = instal.id
        await pushInteraction(temp.head.repo.owner.login, temp.head.repo.name, context.payload.number, installationId, temp.base.ref)
      }
      else
      {
        app.log.error("Installation id not defined")
      }
    }
  });
};
