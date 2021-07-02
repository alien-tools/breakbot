import { Probot } from "probot";
import { pushCheck, testInteraction} from "./messagesApi";
import { State } from "./globalState";
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

    router.post("/pr/:owner/:repo/:prNb", (req: any, res: any) => {
      console.log("[router] Final report received from Maracas")

      var myDatas = new authDatas()

      // intialized, could be one function
      myDatas.baseRepo = `${req.params.owner}/${req.params.repo}`
      myDatas.prNb = req.params.prNb
      myDatas.installationId = req.headers.installationid

      updateCheck(myDatas, req.body)
      
      res.status(200)
      res.send("Received")
    })
  }

  app.on(["pull_request.opened", "pull_request.synchronize"], async (context) => {

    if (global.currentState == State.poll)
    {
      //await pollInteraction(temp.head.repo.owner.login, temp.head.repo.name, context.payload.number, context);
      app.log.info("Deprecated mode")
    }

    else if (global.currentState == State.test)
    {
      testInteraction(context)
    }
      
    else if (global.currentState == State.push)
    {
      var myDatas = new authDatas()
      myDatas.updatePr(context)

      // create the test (add a condition here to have optional checks)
      myDatas = await createCheck(myDatas) // can't createCheck act on our datas ?

      await pushCheck(myDatas)
    }
  });

  app.on("check_run.requested_action", async (context) => {
    
    if (context.payload.requested_action?.identifier == "rerun") {
      app.log.info("A new check run was requested")
      var myDatas = new authDatas()
      myDatas.updateCheck(context)

      // create the test (add a condition here to have optional checks)
      myDatas = await createCheck(myDatas) // can't createCheck act on our datas ?

      await pushCheck(myDatas)
    }

  })
};
