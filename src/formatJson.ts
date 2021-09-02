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

        #### Breaking changes
        Declaration | Kind | Impacted clients
        ----------- | ---- | ----------------
    `

    
    bcs.slice(0, maxBCs).forEach((bc: any) => {
        summary += "\n"
        summary += `[\`${bc.declaration}\`](${bc.url}) | [\`${bc.change}\`]() | WIP`
    })

    summary += "\n\n"
    summary += stripIndent`
        #### Impact on clients
        Client | Status | Detections
        ------ | ------ | ----------
    `

    clients.slice(0, maxClients).forEach((c : any) => {
        summary += "\n"
        summary += `[${c.url}](${c.url}) | ${c.detections.length > 0 ? `:x:` : `:heavy_check_mark`} | ${c.detections.length}`
    })

    var message = ""
    brokenClients.forEach((c: any) => {
        message += stripIndent`
            #### [${c.url}](${c.url})

            Location | Breaking declaration | Kind | Use Type  
            -------- | -------------------- | ---- | --------
        `

        c.detections.slice(0, maxDetections).forEach((d: any) => {
            message += "\n"
            message += `[\`${d.elem}\`](${d.url}) | \`${d.src}\` | WIP | \`${d.apiUse}\``
        })

        message += "\n"
    })

    return ([title, summary, message])
}
