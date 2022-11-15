import { stripIndent } from 'common-tags';
import BreakBotConstants from './settings';
import { components } from './maracas-schema';

type PullRequestResponse = components['schemas']['PullRequestResponse'];
type MaracasReport = components['schemas']['MaracasReport'];
type ClientReport = components['schemas']['ClientReport'];

function bcDocumentationUrl(bc: string | undefined): string {
  if (bc != null) {
    return BreakBotConstants.MARACAS_BCS_DOCUMENTATION
      + bc.replaceAll('_', '-')
        .toLowerCase();
  }

  return '';
}

function getClientReport(report: MaracasReport, clientUrl: string): ClientReport {
  return {
    url: clientUrl,
    error:
      Array.from(new Set(
        report.reports.flatMap((pkg) => pkg.clientReports)
          .filter((c) => c.url === clientUrl)
          .flatMap((c) => c.error),
      ))
        .join(', '),
    brokenUses: report.reports.flatMap((pkg) => pkg.clientReports)
      .filter((c) => c.url === clientUrl)
      .flatMap((c) => c.brokenUses),
  };
}

export default function writeReport(
  pr: PullRequestResponse,
  maxBCs: number,
  maxClients: number,
  maxBrokenUses: number,
): string[] {
  const { report } = pr;
  const title = BreakBotConstants.REPORT_TITLE;

  if (report == null) {
    return ([title, `An error occurred: ${pr.message}\n`, '']);
  }

  const bcs = report.reports.flatMap((pkg) => (pkg.delta ? pkg.delta.breakingChanges : []));
  const allClientUrls = Array.from(new Set(
    report.reports
      .flatMap((pkg) => pkg.clientReports)
      .flatMap((c) => c.url),
  ));
  const allClients = allClientUrls.map((url) => getClientReport(report, url!));
  const clients = allClients.filter((c) => !c.error);
  // const clientsError = allClients.filter((c) => c.error);
  const brokenClients = clients.filter((c) => c.brokenUses.length > 0);
  const brokenUses = brokenClients.flatMap((c) => c.brokenUses);
  const percentBroken = clients.length > 0
    ? Math.floor((brokenClients.length / clients.length) * 100)
    : 0;

  const summary = stripIndent`
        This pull request introduces **${bcs.length} breaking changes**, causing **${brokenUses.length} broken uses** in client code.
        **${brokenClients.length} of ${clients.length} analyzed clients are impacted** by the changes (${percentBroken}%).
    `;

  // ${clientsError.length > 0 ? `Maracas encountered an error when attempting to process the following clients: ${allClients.map((c) => `[${c.url}](https://github.com/${c.url}) (*${c.error}*)`)
  // .join(', ')}.` : ''}

  let reportMessage = stripIndent`
        ### Breaking changes
        Declaration | Kind | Status | Impacted clients | Broken Uses
        ----------- | ---- | ------ | ---------------- | -----------
    `;

  bcs.slice(0, maxBCs)
    .forEach((bc) => {
      const impactedClients = clients.filter((c) => c.brokenUses.some((d) => d.src === bc.declaration));
      const bcBrokenUses = impactedClients.flatMap((c) => c.brokenUses.filter((d) => d.src === bc.declaration));
      const impactedClientsText = impactedClients.length > 0
        ? `${impactedClients.length} (${impactedClients.map((c) => `[${c.url}](https://github.com/${c.url})`)
          .join(', ')})`
        : 'None';
      const bcBrokenUsesText = bcBrokenUses.length > 0
        ? bcBrokenUses.length
        : 'None';

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
    .forEach((c) => {
      reportMessage += '\n';
      reportMessage += `[${c.url}](https://github.com/${c.url}) | ${c.brokenUses.length > 0 ? ':x:' : ':heavy_check_mark:'} | ${c.brokenUses.length}`;
    });

  reportMessage += '\n';
  reportMessage += `— | ${brokenUses.length > 0 ? ':x:' : ':heavy_check_mark:'} | ${brokenUses.length}`;

  if (clients.length > maxClients) {
    reportMessage += '\n';
    reportMessage += `*${clients.length - maxClients} additional clients not shown.*`;
  }

  brokenClients.forEach((c) => {
    reportMessage += '\n\n';
    reportMessage += stripIndent`
            #### [${c.url}](https://github.com/${c.url})
            File | Element | Breaking declaration | Kind | Use Type
            ---- | ------- | -------------------- | ---- | --------
        `;

    c.brokenUses.slice(0, maxBrokenUses)
      .filter((bu) => bu.path != null)
      .forEach((bu) => {
        const kind = bcs.find((bc) => bc.declaration === bu.src)?.change;
        const filename = bu.path!.substring(bu.path!.lastIndexOf('/') + 1);
        reportMessage += '\n';
        reportMessage += `[\`${filename}\`](${bu.url}) | \`${bu.elem}\` | \`${bu.src}\` | [\`${kind}\`](${bcDocumentationUrl(kind)}) | \`${bu.apiUse}\``;
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
