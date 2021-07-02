import { Probot } from "probot";
import { pushCheck, pushComment} from "./messagesApi";
import { authDatas } from "./authClass";
import { updateCheck, createCheck } from "./checksManagement";
import { postComment } from "./commentsManagement";

const bodyParser = require("body-parser")

//---Declaration of the app---
export = (app: Probot, option: any) => {
  const router = option.getRouter("/breakbot");

  router.use(bodyParser.json({ limit: '5mb' }))

  router.post("/pr/:owner/:repo/:prNb", (req: any, res: any) => {
    console.log("[router] Final report received from Maracas")

    var myDatas = new authDatas()

    // intialized, could be one function
    myDatas.baseRepo = `${req.params.owner}/${req.params.repo}`
    myDatas.prNb = req.params.prNb
    myDatas.installationId = req.headers.installationid
    
    if (myDatas.comment) {
      postComment(myDatas, req.body)
    }
    else {
      updateCheck(myDatas, req.body)
    }
      
    res.status(200)
    res.send("Received")
  })

  app.on(["pull_request.opened", "pull_request.synchronize"], async (context) => {

    var myDatas = new authDatas()
    myDatas.updatePr(context)

    if (myDatas.comment) {
      pushComment(myDatas)
    }
    else {
      myDatas = await createCheck(myDatas) // can't createCheck act on our datas ?
  
      await pushCheck(myDatas)      
    }
  
  });

  app.on("check_run.requested_action", async (context) => {
    // we consider it can only happen when the repo wants checks
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
