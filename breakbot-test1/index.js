/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */
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

  app.on("pull_request.opened", async (context) => { //just a skeleton waiting for tests, not sure it works
    app.log.info("A pull request was opened !");
    const prComment = context.pullRequest({
      body: "Thanks for opening this pull request!",
    });
    return context.octokit.pullRequest.createComment(prComment);
  });

  app.on("pull_request.assigned", async (context) => {
    app.log.info("Someone was assigned !");
  })

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
};
