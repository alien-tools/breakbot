import { Probot } from 'probot';
import { handleCheckWebhook, handleMaracasPost, handlePullRequestWebhook } from './handlers';

const bodyParser = require('body-parser');

export = (app: Probot, option: any) => {
  console.log('[index] Options:');
  console.log(option);

  const router = option.getRouter('/breakbot');

  router.use(bodyParser.json({ limit: '5mb' }));

  router.post('/pr/:owner/:repo/:prNb', async (req: any, res: any) => {
    console.log('[router] Final report received from Maracas');

    await handleMaracasPost(req);

    res.status(200);
    res.send('Received');
  });

  app.on(['pull_request.opened', 'pull_request.synchronize'], async (context) => {
    console.log('[index] Starting a new check');

    await handlePullRequestWebhook(context);
  });

  app.on(['check_run.requested_action'], async (context) => {
    console.log('[index] Starting a new check');

    await handleCheckWebhook(context);
  });
};
