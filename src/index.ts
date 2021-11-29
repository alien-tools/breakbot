import { Context, Probot } from 'probot';
import { Request, Response } from 'express';
import { handleCheckWebhook, handleMaracasPost, handlePullRequestWebhook } from './handlers';

const bodyParser = require('body-parser');

export default function breakBot(app: Probot, option: any) {
  app.log('[index] Options:');
  app.log(option);

  const router = option.getRouter('/breakbot');

  router.use(bodyParser.json({ limit: '5mb' }));

  router.post('/pr/:owner/:repo/:prNb', async (req: Request, res: Response) => {
    app.log('[router] Final report received from Maracas');

    await handleMaracasPost(req);

    res.status(200);
    res.send('Received');
  });

  app.on(['pull_request.opened', 'pull_request.synchronize'], async (context: Context) => {
    app.log.info('[index] Starting a new check');

    await handlePullRequestWebhook(context);
  });

  app.on(['check_run.requested_action'], async (context: Context) => {
    app.log.info('[index] Starting a new check');

    await handleCheckWebhook(context);
  });
}
