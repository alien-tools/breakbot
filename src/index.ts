import { Context, Probot } from 'probot';
import { Request, Response } from 'express';
import { handleCheckWebhook, handlePullRequestWebhook } from './handlers';
import maracasRoute from './routes';

const bodyParser = require('body-parser');

export default function breakBot(app: Probot, options: any) {
  app.log(options, 'Welcome to BreakBot!');

  const router = options.getRouter('/breakbot');
  router.use(bodyParser.json({ limit: '5mb' }));
  router.post('/pr/:owner/:repo/:prNb', async (req: Request, res: Response) => {
    await maracasRoute(req, res, app.log);
  });

  app.on(['pull_request.opened', 'pull_request.synchronize'], async (context: Context<'pull_request'>) => {
    app.log.info('Pull request opened or updated: starting a new check');

    await handlePullRequestWebhook(context);
  });

  app.on('check_run.requested_action', async (context: Context<'check_run.requested_action'>) => {
    app.log.info('Requested action: starting a new check');

    await handleCheckWebhook(context);
  });
}
