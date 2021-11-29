import { Context, Probot } from 'probot';
import { Request, Response } from 'express';
import { handleCheckWebhook, handleMaracasPost, handlePullRequestWebhook } from './handlers';

const bodyParser = require('body-parser');

export default function breakBot(app: Probot, options: any) {
  app.log(options, 'Welcome to BreakBot!');

  const router = options.getRouter('/breakbot');
  router.use(bodyParser.json({ limit: '5mb' }));
  router.post('/pr/:owner/:repo/:prNb', async (req: Request, res: Response) => {
    app.log(req.body.message, 'Maracas sent his report back');

    await handleMaracasPost(req, app.log);

    res.status(200);
    res.send('Received');
  });

  app.on(['pull_request.opened', 'pull_request.synchronize'], async (context: Context) => {
    app.log.info('Pull request opened or updated: starting a new check');

    await handlePullRequestWebhook(context);
  });

  app.on(['check_run.requested_action'], async (context: Context) => {
    app.log.info('Requested action: starting a new check');

    await handleCheckWebhook(context);
  });
}
