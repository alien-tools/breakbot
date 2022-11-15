import { stripIndent } from 'common-tags';
import BreakBotConstants from './settings';

function bcDocumentationUrl(bc: string) {
  return BreakBotConstants.MARACAS_BCS_DOCUMENTATION + bc.replaceAll('_', '-').toLowerCase();
}

function getClientReport(report: any, clientUrl: string) {
  return {
    url: clientUrl,
    error:
        Array.from(new Set(
          report.reports.flatMap((pkg: any) => pkg.clientReports)
            .filter((c: any) => c.url === clientUrl)
            .flatMap((c: any) => c.error),
        )).join(', '),
    brokenUses: report.reports.flatMap((pkg: any) => pkg.clientReports)
      .filter((c: any) => c.url === clientUrl)
      .flatMap((c: any) => c.brokenUses),
  };
}

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

  const bcs = report.reports.flatMap((pkg : any) => (pkg.delta ? pkg.delta.breakingChanges : []));
  const allClientUrls = Array.from(new Set(
    report.reports.flatMap((pkg: any) => pkg.clientReports).flatMap((c: any) => c.url),
  ));
  const allClients = allClientUrls.map((url: any) => getClientReport(report, url));
  const clients = allClients.filter((c: any) => !c.error);
  // const clientsError = allClients.filter((c: any) => c.error);
  const brokenClients = clients.filter((c: any) => c.brokenUses.length > 0);
  const brokenUses = brokenClients.flatMap((c: any) => c.brokenUses);
  const percentBroken = clients.length > 0
    ? Math.floor((brokenClients.length / clients.length) * 100)
    : 0;

  const summary = stripIndent`
        This pull request introduces **${bcs.length} breaking changes**, causing **${brokenUses.length} broken uses** in client code.
        **${brokenClients.length} of ${clients.length} analyzed clients are impacted** by the changes (${percentBroken}%).
    `;

  // ${clientsError.length > 0 ? `Maracas encountered an error when attempting to process the following clients: ${allClients.map((c: any) => `[${c.url}](https://github.com/${c.url}) (*${c.error}*)`)
  // .join(', ')}.` : ''}

  let reportMessage = stripIndent`
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

      reportMessage += '\n';
      reportMessage += `[\`${bc.declaration}\`](${bc.fileUrl}) ([diff](${bc.diffUrl})) | [\`${bc.change}\`](${bcDocumentationUrl(bc.change)}) | ${impactedClients.length > 0 ? ':x:' : ':heavy_check_mark:'} | ${impactedClientsText} | ${bcBrokenUsesText}`;
    });

  if (bcs.length > maxBCs) {
    reportMessage += '\n';
    reportMessage += `*${bcs.length - maxBCs} additional breaking changes not shown.*`;
  }

  reportMessage += '\n\n';
  reportMessage += stripIndent`
        ### Impact on clients
        Client | Status | Broken Uses
        ------ | ------ | -----------
    `;

  clients
    .sort((c1, c2) => c2.brokenUses.length - c1.brokenUses.length)
    .slice(0, maxClients)
    .forEach((c: any) => {
      reportMessage += '\n';
      reportMessage += `[${c.url}](https://github.com/${c.url}) | ${c.brokenUses.length > 0 ? ':x:' : ':heavy_check_mark:'} | ${c.brokenUses.length}`;
    });

  reportMessage += '\n';
  reportMessage += `— | ${brokenUses.length > 0 ? ':x:' : ':heavy_check_mark:'} | ${brokenUses.length}`;

  if (clients.length > maxClients) {
    reportMessage += '\n';
    reportMessage += `*${clients.length - maxClients} additional clients not shown.*`;
  }

  brokenClients.forEach((c: any) => {
    reportMessage += '\n\n';
    reportMessage += stripIndent`
            #### [${c.url}](https://github.com/${c.url})
            File | Element | Breaking declaration | Kind | Use Type
            ---- | ------- | -------------------- | ---- | --------
        `;

    c.brokenUses.slice(0, maxBrokenUses)
      .forEach((d: any) => {
        const kind = bcs.find((bc: any) => bc.declaration === d.src).change;
        const filename = d.path.substring(d.path.lastIndexOf('/')+1);
        reportMessage += '\n';
        reportMessage += `[\`${filename}\`](${d.url}) | \`${d.elem}\` | \`${d.src}\` | [\`${kind}\`](${bcDocumentationUrl(kind)}) | \`${d.apiUse}\``;
      });

    if (c.brokenUses.length > maxBrokenUses) {
      reportMessage += '\n';
      reportMessage += `*${c.brokenUses.length - maxBrokenUses} additional broken uses not shown.*`;
    }
  });

  if (reportMessage.length > 65_000) {
    reportMessage = reportMessage.substring(0, 65_000);
    reportMessage += '\n\n';
    reportMessage += '*The report exceeds the maximum length of 65,000 characters and has been truncated.*';
  }

  return ([title, summary, reportMessage]);
}
