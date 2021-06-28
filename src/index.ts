import { Probot } from "probot";
import { pollInteraction, pushInteractionCheck, testInteraction} from "./messagesApi";
import { State } from "./globalState";
//import { Octokit } from "@octokit/rest";
//import { createAppAuth } from "@octokit/auth-app"
import { createCheck, getCheck } from "./postReport";

const global = require("../src/globalState")
const bodyParser = require("body-parser")

//---Declaration of the app---
export = (app: Probot, option: any) => {
  //If the bot is in push state, the endpoint for maracas is set up
  if (global.currentState == State.push) {
    const router = option.getRouter("/breakbot");

    router.use(bodyParser.json({ limit: '5mb' }))

    router.post("/pr/:owner/:repo/:prId", (req: any, res: any) => {
      //postComment(req.body, req.headers.installationid, req.params.owner, req.params.repo, req.params.prId)
      console.log("Final report received from Maracas")
      getCheck(true, req.params.owner, req.params.repo, req.headers.installationid, "", req.body, req.params.prId)
      res.status(200)
      res.send("Received")
    })
  }

  app.on(["pull_request.opened", "pull_request.synchronize"], async (context) => {
    const temp = context.payload.pull_request;

    if (global.currentState == State.poll)
    {
      await pollInteraction(temp.head.repo.owner.login, temp.head.repo.name, context.payload.number, context);
    }

    else if (global.currentState == State.test)
    {
      testInteraction(context)
    }
      
    else if (global.currentState == State.push)
    {
      // create the test (add a condition here to have optional checks)
      createCheck(context.octokit, temp.head.repo.owner.login, temp.head.repo.name, temp.head.sha)

      // avoid the case where installation is undefined
      const instal = context.payload.installation
      var installationId = 0
      if (instal != undefined)
      {
        installationId = instal.id
        //await pushInteractionComment(temp.head.repo.owner.login, temp.head.repo.name, context.payload.number, installationId)
        await pushInteractionCheck(temp.head.repo.owner.login, temp.head.repo.name, temp.number, installationId, temp.head.ref)
      }
      else
      {
        app.log.error("Installation id not defined")
      }
    }
  });
};
