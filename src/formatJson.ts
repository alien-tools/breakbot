
export function parseJsonMain(myJson: any, nMax: number) {
    const n = myJson.delta.breakingChanges.length

    var titleReturned = `This PR introduces ${n} breaking changes in the base branch.`
    var summaryReturned = ""
    var messageReturned = ""

    // To complete with a summary

    // Detail on the BC
    myJson.delta.breakingChanges.slice(0, nMax).forEach((breakingChange: any) => {
        
        messageReturned += `\n### The declaration [${breakingChange.declaration}](${breakingChange.url}) is impacted by _${breakingChange.type}_`
        
        breakingChange.detections.slice(0, nMax).forEach((detection: any) => {
            messageReturned += `\n- Declaration [${detection.elem}](${detection.url}) in [this client](${detection.clientUrl})`
        });

    });

    return ([titleReturned, summaryReturned, messageReturned])
}
