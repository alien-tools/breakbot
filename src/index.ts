import { Probot } from "probot";
import { pollInteraction, pushInteractionCheck, testInteraction} from "./messagesApi";
import { State } from "./globalState";
//import { Octokit } from "@octokit/rest";
//import { createAppAuth } from "@octokit/auth-app"
import { createCheck } from "./postReport";
import { authDatas } from "./authClass";
import { updateCheck } from "./checksUpdates";

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

      var myDatas = new authDatas()

      // intialized, could be one function
      myDatas.baseRepo = req.params.owner + "/" + req.params.repo
      myDatas.installationId = req.headers.installationid

      myDatas.connectToGit(req.params.prId)
      myDatas.getCheck(req.headers.installationId)

      //getCheck(true, req.params.owner, req.params.repo, req.headers.installationid, "", req.body, req.params.prId)
      updateCheck(myDatas, req.body)
      
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
      var myDatas = new authDatas()
      myDatas.updateCheck(context)

      app.log.info("Auth datas initialized with pr context:\n" + myDatas)

      // create the test (add a condition here to have optional checks)
      myDatas = await createCheck(myDatas)

      app.log.info("Auth datas once the test is created: " + myDatas)

      await pushInteractionCheck(myDatas)
    }
  });
};
