import { stripIndent } from 'common-tags'

export function parseJson(myJson: any, maxBCs: number, maxClients: number, maxDetections: number) {
    if (myJson.report.error != null)
        return ([myJson.report.error, null, null])

    const report = myJson.report
    const bcs = report.delta.brokenDeclarations
    const clients = report.clientDetections
    const brokenClients = clients.filter((c: any) => c.detections.length > 0)
    const detections = brokenClients.flatMap((c: any) => c.detections)

    const title = "Break-bot report"

    var summary = stripIndent`
        This pull request introduces **${bcs.length} breaking changes**, causing **${detections.length} detections** in client code.
        **${brokenClients.length} of ${clients.length} clients are impacted** by the changes (${brokenClients.length / clients.length * 100}%).
    `

    var message = stripIndent`
        ### Breaking changes
        Declaration | Kind | Impacted clients
        ----------- | ---- | ----------------
    `
    
    bcs.slice(0, maxBCs).forEach((bc: any) => {
        message += "\n"
        message += `[\`${bc.declaration}\`](${bc.url}) | [\`${bc.change}\`]() | WIP`
    })

    message += "\n\n"
    message += stripIndent`
        ### Impact on clients
        Client | Status | Detections
        ------ | ------ | ----------
    `

    clients.slice(0, maxClients).forEach((c : any) => {
        message += "\n"
        message += `[${c.url}](${c.url}) | ${c.detections.length > 0 ? `:x:` : `:heavy_check_mark:`} | ${c.detections.length}`
    })

    message += "\n"
    message += `— | ${detections.length > 0 ? `:x:` : `:heavy_check_mark:`} | ${detections.length}`;

    brokenClients.forEach((c: any) => {
        message += "\n\n"
        message += stripIndent`
            #### [${c.url}](${c.url})
            Location | Breaking declaration | Kind | Use Type  
            -------- | -------------------- | ---- | --------
        `

        c.detections.slice(0, maxDetections).forEach((d: any) => {
            message += "\n"
            message += `[\`${d.elem}\`](${d.url}) | \`${d.src}\` | WIP | \`${d.apiUse}\``
        })
    })

    return ([title, summary, message])
}
