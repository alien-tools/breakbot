
function countClients(detections: any) {

    // to modify: how to identify a client 

    let clients = new Map()
    
    detections.forEach((detection: any) => {
        if (!clients.has(detection.clientUrl)) {
            clients.set(detection.clientUrl, 1)
        }
        else {
            const newValue = clients.get(detection.clientUrl)
            if (newValue) {
                clients.set(detection.clientUrl, (newValue + 1))
            }
            else {
                console.log(`[countClients] A client was initialized with no counter`)
            }
        }
    })

    console.log(`[countDetections] Clients:`)
    console.log(clients)
    return clients
}

export function impactOnClients(detections: any, clients: Map<string, number>) {
    var returnString = ""

    clients.forEach((impact: number, name: string) => {
        if (impact == 1) {
            returnString += `\n- [This client](${name}) was impacted ${impact} time:`
        }
        else {
            returnString += `\n- [This client](${name}) was impacted ${impact} times:`
        }

        const myDetections = detections.filter((detection: any) => (detection.clientUrl == name)) //&& (detection.src == bcName))) already filtered
        myDetections.forEach((detection: any) => {
            returnString += `\n    - Declaration [${detection.elem}](${detection.url})`
        })
    })

    return returnString
}

export function parseJsonMain(myJson: any, maxClients: number, maxBC: number) {
    const n = myJson.delta.breakingChanges.length

    var titleReturned = `This PR introduces ${n} breaking changes in the base branch.`
    var summaryReturned = ""
    var messageReturned = ""

    // To complete with a summary

    // Detail on the BC
    myJson.delta.breakingChanges.slice(0, maxBC).forEach((breakingChange: any) => {
        
        messageReturned += `\n### The declaration [${breakingChange.declaration}](${breakingChange.url}) is impacted by _${breakingChange.type}_`
        
        breakingChange.detections.slice(0, maxClients).forEach((detection: any) => {
            messageReturned += `\n- Declaration [${detection.elem}](${detection.url}) in [this client](${detection.clientUrl})`
        });

    });

    return ([titleReturned, summaryReturned, messageReturned])
}

export function parseJson(myJson: any, maxClients: number, maxBC: number) {

    const n = myJson.report.delta.brokenDeclarations.length

    var titleReturned = `This PR introduces ${n} breaking changes in the base branch.`
    var summaryReturned = ""
    var messageReturned = ""

    // Summary
    const clients = countClients(myJson.report.detections)

    if (clients.size == 0) {
        summaryReturned += `**No clients** were affected by this PR.`
    } else if (clients.size == 1) {
        summaryReturned += `**1 client** was affected by this PR.`
    } else {
        summaryReturned += `**${clients.size} clients** were affected by this PR.`
    }


    // Detail on the BC
    myJson.report.delta.brokenDeclarations.slice(0, maxBC).forEach((brokenDeclaration: any) => {
        messageReturned += `\n### The declaration [${brokenDeclaration.declaration}](${brokenDeclaration.url}) is impacted by _${brokenDeclaration.change}_`

        const myDetections = myJson.report.detections.filter((detection: any) => detection.src == brokenDeclaration.declaration)
        
        if (myDetections.length == 0) {
            messageReturned += `\n- **No clients** are impacted by this breaking change`
        }
        else {
            messageReturned += impactOnClients(myDetections, clients)
        }
    })

    return ([titleReturned, summaryReturned, messageReturned])
}