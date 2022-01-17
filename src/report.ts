import { stripIndent } from 'common-tags';
import BreakBotConstants from './settings';

export default function writeReport(
  myJson: any,
  maxBCs: number,
  maxClients: number,
  maxBrokenUses: number,
) {
  const title = BreakBotConstants.REPORT_TITLE;

  if (myJson.report == null) {
    return ([title, `An error occurred: ${myJson.message}\n`, '']);
  }

  const { report } = myJson;
  const bcs = report.delta.brokenDeclarations;
  const allClients = report.clientReports;
  const clients = allClients.filter((c: any) => c.error == null);
  const clientsError = allClients.filter((c: any) => c.error != null);
  const brokenClients = clients.filter((c: any) => c.brokenUses.length > 0);
  const brokenUses = brokenClients.flatMap((c: any) => c.brokenUses);
  const percentBroken = clients.length > 0
    ? Math.floor((brokenClients.length / clients.length) * 100)
    : 0;

  const summary = stripIndent`
        This pull request introduces **${bcs.length} breaking changes**, causing **${brokenUses.length} broken uses** in client code.
        **${brokenClients.length} of ${clients.length} clients are impacted** by the changes (${percentBroken}%).
        ${clientsError.length > 0 ? `Maracas encountered an error when attempting to process the following clients: ${clientsError.map((c: any) => `[${c.url}](https://github.com/${c.url}) (*${c.error}*)`)
    .join(', ')}.` : ''}
    `;

  let message = stripIndent`
        ### Breaking changes
        Declaration | Kind | Status | Impacted clients | Broken Uses
        ----------- | ---- | ------ | ---------------- | -----------
    `;

  bcs.slice(0, maxBCs)
    .forEach((bc: any) => {
      const impactedClients = clients.filter(
        (c: any) => c.brokenUses.some((d: any) => d.src === bc.declaration),
      );
      const bcBrokenUses = clients.flatMap(
        (c: any) => c.brokenUses.filter((d: any) => d.src === bc.declaration),
      );
      const impactedClientsText = impactedClients.length > 0 ? `${impactedClients.length} (${impactedClients.map((c: any) => `[${c.url}](https://github.com/${c.url})`)
        .join(', ')})` : 'None';
      const bcBrokenUsesText = bcBrokenUses.length > 0 ? bcBrokenUses.length : 'None';

      message += '\n';
      message += `[\`${bc.declaration}\`](${bc.fileUrl}) ([diff](${bc.diffUrl})) | [\`${bc.change}\`]() | ${impactedClients.length > 0 ? ':x:' : ':heavy_check_mark:'} | ${impactedClientsText} | ${bcBrokenUsesText}`;
    });

  if (bcs.length > maxBCs) {
    message += '\n';
    message += `*${bcs.length - maxBCs} additional breaking changes not shown.*`;
  }

  message += '\n\n';
  message += stripIndent`
        ### Impact on clients
        Client | Status | Broken Uses
        ------ | ------ | -----------
    `;

  clients.slice(0, maxClients)
    .forEach((c: any) => {
      message += '\n';
      message += `[${c.url}](https://github.com/${c.url}) | ${c.brokenUses.length > 0 ? ':x:' : ':heavy_check_mark:'} | ${c.brokenUses.length}`;
    });

  message += '\n';
  message += `— | ${brokenUses.length > 0 ? ':x:' : ':heavy_check_mark:'} | ${brokenUses.length}`;

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

    c.brokenUses.slice(0, maxBrokenUses)
      .forEach((d: any) => {
        const kind = bcs.find((bc: any) => bc.declaration === d.src).change;
        message += '\n';
        message += `[\`${d.elem}\`](${d.url}) | \`${d.src}\` | \`${kind}\` | \`${d.apiUse}\``;
      });

    if (c.brokenUses.length > maxBrokenUses) {
      message += '\n';
      message += `*${c.brokenUses.length - maxBrokenUses} additional broken uses not shown.*`;
    }
  });

  return ([title, summary, message]);
}
