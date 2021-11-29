import { stripIndent } from 'common-tags';

export default function writeReport(
  myJson: any,
  maxBCs: number,
  maxClients: number,
  maxDetections: number,
) {
  const title = 'Break-bot report';

  if (myJson.report == null) { return ([title, `An error occured: ${myJson.message}`, '']); }

  const { report } = myJson;
  const bcs = report.delta.brokenDeclarations;
  const allClients = report.clientReports;
  const clients = allClients.filter((c: any) => c.error == null);
  const clientsError = allClients.filter((c: any) => c.error != null);
  const brokenClients = clients.filter((c: any) => c.detections.length > 0);
  const detections = brokenClients.flatMap((c: any) => c.detections);
  const percentBroken = clients.length > 0
    ? Math.floor((brokenClients.length / clients.length) * 100)
    : 0;

  const summary = stripIndent`
        This pull request introduces **${bcs.length} breaking changes**, causing **${detections.length} detections** in client code.
        **${brokenClients.length} of ${clients.length} clients are impacted** by the changes (${percentBroken}%).
        ${clientsError.length > 0 ? `Maracas encountered an error when attempting to process the following clients: ${clientsError.map((c: any) => `[${c.url}](https://github.com/${c.url}) (*${c.error}*)`).join(', ')}.` : ''}
    `;

  let message = stripIndent`
        ### Breaking changes
        Declaration | Kind | Status | Impacted clients | Detections
        ----------- | ---- | ------ | ---------------- | ----------
    `;

  bcs.slice(0, maxBCs).forEach((bc: any) => {
    const impactedClients = clients.filter((c: any) => c.detections.filter((d: any) => d.src === bc.declaration).length > 0);
    const impactedDetections = clients.flatMap((c: any) => c.detections.filter((d: any) => d.src === bc.declaration));
    const impactedClientsText = impactedClients.length > 0 ? `${impactedClients.length} (${impactedClients.map((c: any) => `[${c.url}](https://github.com/${c.url})`).join(', ')})` : 'None';
    const impactedDetectionsText = impactedDetections.length > 0 ? impactedDetections.length : 'None';

    message += '\n';
    message += `[\`${bc.declaration}\`](${bc.fileUrl}) ([diff](${bc.diffUrl})) | [\`${bc.change}\`]() | ${impactedClients.length > 0 ? ':x:' : ':heavy_check_mark:'} | ${impactedClientsText} | ${impactedDetectionsText}`;
  });

  if (bcs.length > maxBCs) {
    message += '\n';
    message += `*${bcs.length - maxBCs} additional breaking changes not shown.*`;
  }

  message += '\n\n';
  message += stripIndent`
        ### Impact on clients
        Client | Status | Detections
        ------ | ------ | ----------
    `;

  clients.slice(0, maxClients).forEach((c : any) => {
    message += '\n';
    message += `[${c.url}](https://github.com/${c.url}) | ${c.detections.length > 0 ? ':x:' : ':heavy_check_mark:'} | ${c.detections.length}`;
  });

  message += '\n';
  message += `— | ${detections.length > 0 ? ':x:' : ':heavy_check_mark:'} | ${detections.length}`;

  if (clients.length > maxClients) {
    message += '\n';
    message += `*${clients.length - maxClients} additional clients not shown.*`;
  }

  brokenClients.forEach((c: any) => {
    message += '\n\n';
    message += stripIndent`
            #### [${c.url}](https://github.com/${c.url})
            Location | Breaking declaration | Kind | Use Type
            -------- | -------------------- | ---- | --------
        `;

    c.detections.slice(0, maxDetections).forEach((d: any) => {
      const kind = bcs.find((bc: any) => bc.declaration === d.src).change;
      message += '\n';
      message += `[\`${d.elem}\`](${d.url}) | \`${d.src}\` | \`${kind}\` | \`${d.apiUse}\``;
    });

    if (c.detections.length > maxDetections) {
      message += '\n';
      message += `*${c.detections.length - maxDetections} additional detections not shown.*`;
    }
  });

  return ([title, summary, message]);
}
