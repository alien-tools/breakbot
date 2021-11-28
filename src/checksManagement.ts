import webhookData from './webhookData';
import reportData from './reportData';
import writeReport from './writeReport';

export async function failed(myDatas: webhookData, message: string) {
  const check = {
    status: 'completed',
    conclusion: 'cancelled',
    output: {
      title: 'Something went wrong',
      summary: message,
    },
  };

  try {
    myDatas.myOctokit.request(`PATCH /repos/${myDatas.baseRepo}/check-runs/${myDatas.checkId}`, check);
  } catch (err) {
    console.error(err);
  }
}

export async function inProgress(myDatas: webhookData) {
  const check = {
    status: 'in_progress',
    output: {
      title: 'Maracas is processing...',
      summary: '',
    },
  };
  try {
    myDatas.myOctokit.request(`PATCH /repos/${myDatas.baseRepo}/check-runs/${myDatas.checkId}`, check);
  } catch (err) {
    console.error(err);
  }
}

export async function finalUpdate(myDatas: reportData, myJson: any) {
  console.log(`[updateCheck] Message received from Maracas: ${myJson.message}`);

  const myActions = [{
    label: 'Rerun test',
    description: '',
    identifier: 'rerun',
  }];

  // ---Format the Json---
  // Generic declaration
  let maxBCs = 50;
  let maxClients = 50;
  const maxDetections = 50;
  if (myDatas.config?.maxDisplayedBC) {
    maxBCs = myDatas.config?.maxDisplayedBC;
    console.log(`[updateCheck] New max bc: ${maxBCs}`);
  }
  if (myDatas.config?.maxDisplayedClients) {
    maxClients = myDatas.config?.maxDisplayedClients;
    console.log(`[updateCheck] New max clients: ${maxClients}`);
  }

  const parsedJson = writeReport(myJson, maxBCs, maxClients, maxDetections);

  const newOutput = {
    title: parsedJson[0],
    summary: parsedJson[1],
    text: parsedJson[2],
  };

  const newCheck = {
    status: 'completed',
    conclusion: 'neutral',
    output: newOutput,
    actions: myActions,
  };

  try {
    myDatas.myOctokit.request(`PATCH /repos/${myDatas.baseRepo}/check-runs/${myDatas.checkId}`, newCheck);
  } catch (err) {
    console.error(err);
  }
}

export async function createCheck(myDatas: webhookData) {
  const newDatas = myDatas;
  console.log('[createCheck] Starting...');

  const output = {
    title: 'Sending request to the api...',
    summary: '',
  };

  const check = {
    name: 'Breakbot report',
    head_sha: newDatas.headSHA,
    status: 'queued',
    output,
  };

  try {
    const resNewCheck = await newDatas.myOctokit.request(`POST /repos/${newDatas.baseRepo}/check-runs`, check);
    newDatas.checkId = resNewCheck.data.id;
  } catch (err) {
    console.error(err);
  }

  console.log(`[createCheck] Checkid: ${newDatas.checkId}`);

  return newDatas;
}
