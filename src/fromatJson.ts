
export function parseJsonMain(myJson: any, nMax: number){
    var messageReturned = ""

    // To complete with a summary

    // Detail on the BC
    myJson.delta.breakingChanges.slice(0, nMax).forEach((breakingChange: any) => {
        
        messageReturned += `\n### The declaration [${breakingChange.declaration}](${breakingChange.url}) is impacted by _${breakingChange.type}_`
        
        breakingChange.detections.slice(0, nMax).forEach((detection: any) => {
            messageReturned += `\n- Declaration [${detection.elem}](${detection.url}) in [this client](${detection.clientUrl})`
        });

    });

    return messageReturned
}
