import { Probot } from "probot";

//import or declare a function to gather the information from the maracas api and format the 
import { pollInteraction, testInteraction} from "./message_api";
import { State } from "./globalState";
var global = require("../src/globalState")

//const ConfigFilename = '.breakbot.yml';
//interface AppConfig {
//  polite: boolean;
//}
//const DefaultConfig: AppConfig = { polite: false };

export = (app: Probot) => {
  app.log.info("The app is up !")

  app.on("pull_request.opened", async (context) => {
    //recuperation de la config
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
  });
  
  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
};
