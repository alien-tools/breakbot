export function parseJson(myJson: any, maxBCs: number, maxClients: number, maxDetections: number) {
    if (myJson.report.error != null)
        return ([myJson.report.error, null, null])

    const report = myJson.report
    const bcs = report.delta.brokenDeclarations
    const clients = report.clientDetections
    const brokenClients = clients.filter((c: any) => c.detections.length > 0)
    const detections = brokenClients.flatMap((c: any) => c.detections)

    const title = "Break-bot report"

    const summary =
        `This pull request introduces **${bcs.length} breaking changes**, causing **${detections.length} detections** in client code.
        **${brokenClients.length} of ${clients.length} clients are impacted** by the changes (${brokenClients.length / clients.length * 100}%).

        #### Breaking changes
        
        Declaration | Kind | Impacted clients
        ----------- | ---- | ----------------
        ${bcs.slice(0, maxBCs).map((bc: any) =>
            `[\`${bc.declaration}\`](${bc.url}) | [\`${bc.change}\`]() | <WIP>`
        ).join("\n")}

        #### Impact on clients
        Client | Status | Detections
        ------ | ------ | ----------
        ${clients.slice(0, maxClients).map((c : any) =>
            `[${c.url}](${c.url}) | ${c.detections.length > 0 ? `:x:` : `:heavy_check_mark`} | ${c.detections.length}`
        ).join("\n")}`

    const message =
        `${brokenClients.map((c: any) =>
            `#### [${c.url}](${c.url})

            Location | Breaking declaration | Kind | Use Type  
            -------- | -------------------- | ---- | --------
            ${c.detections.slice(0, maxDetections).map((d: any) =>
                `[\`${d.elem}\`](${d.url}) | \`${d.src}\` | <WIP> | \`${d.apiUse}\``
            ).join("\n")}`
        ).join("\n")}`

    return ([title, summary, message])
}
