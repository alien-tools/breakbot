/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */

const fetch = require('node-fetch');

async function getWeather() {
  const url = "https://www.prevision-meteo.ch/services/json/" + "Bordeaux";
  const test = fetch(url)
    .then(response => response.json())
    .then(json => {
      return (json.current_condition.tmp);
    })
  return test;
}

module.exports = (app) => {

  // Your code here
  app.log.info("Yay, the app was loaded!");

  app.on("issues.opened", async (context) => {
    app.log.info("An issue was opened !");
    const issueComment = context.issue({
      body: "Thanks for opening this issue!",
    });
    return context.octokit.issues.createComment(issueComment);
  });

  app.on("pull_request.opened", async (context) => {
    app.log.info("A pull request was opened !");
    const prComment = context.issue({
      body: "Thanks for opening this pull request!",
    });
    return context.octokit.issues.createComment(prComment);
  });

  app.on("pull_request.assigned", async (context) => {
    app.log.info("Someone was assigned !");
    temperature = await getWeather();
    const prComment = context.issue({
      body: "## Welcome " + context.payload.pull_request.assignee.login + " !\n" + "It is "+ temperature +"°C now",
    });
    return context.octokit.issues.createComment(prComment);
  })

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
};
