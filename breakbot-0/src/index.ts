import { Probot } from "probot";

//import or declare a function to gather the information from the maracas api and format the 
import { formattingMessage } from "./message_api";

//const ConfigFilename = '.breakbot.yml';

//interface AppConfig {
//  polite: boolean;
//}

//const DefaultConfig: AppConfig = { polite: false };

export = (app: Probot) => {
  app.log.info("The bot is up !")
  console.log("The app is up !")

  app.on("pull_request.opened", async (context) => {
    app.log.info("New pull request !")
    console.log("Pull request !")

    //recuperation de la config
    //const config: AppConfig = await context.config<AppConfig>(ConfigFilename, DefaultConfig)

    //appel de la fct au dessus
    const myBody = await formattingMessage(context.payload.pull_request.base.ref);

    const prComment = context.issue({
      body: myBody,
    });
    await context.octokit.issues.createComment(prComment);
  });
  
  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
};
