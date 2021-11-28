import * as checksManagement from './checksManagement';
import sendRequest from './maracas';
import webhookData from './webhookData';
import reportData from './reportData';

export async function maracasHandler(req: any) {
  const myDatas = reportData.fromPost(`${req.params.owner}/${req.params.repo}`, req.headers.installationid, req.params.prNb);

  await myDatas.connectToGit();
  await myDatas.getConfig();
  await myDatas.getCheck();

  await checksManagement.finalUpdate(myDatas, req.body);
}

export async function webhookHandler(context: any) {
  let myDatas;
  if (context.name === 'pull_request') {
    console.log('[webhookHandler] Started in pull_request context');
    myDatas = webhookData.fromPr(context);
  } else if (context.name === 'check_run' && context.payload.requested_action?.identifier === 'rerun') {
    console.log('[webhookHandler] Started in check_run context');
    myDatas = webhookData.fromCheck(context);
    await myDatas.getPrNb();
  } else { // in case sth went wrong
    console.log(`[webhookHandler] Something went wrong, the context came from: ${context.name}`);
    return;
  }

  await myDatas.getConfig();

  myDatas = await checksManagement.createCheck(myDatas); // can't createCheck act on our datas ?

  await sendRequest(myDatas);
}
