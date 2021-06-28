const progressCheck = async (myOctokit: any, owner: string, repo: string, check_id: number) => {
    const newCheck =
    {
        status: "in_progress",
        output: {
            title: "Maracas is processing...",
            summary: ""
        }
    }
    try {
        myOctokit.request("PATCH /repos/" + owner + "/" + repo + "/check-runs/" + check_id, newCheck);
    }
    catch (err) {
        console.error(err)
    }
}

const updateCheck = async (myOctokit: any, owner: string, repo: string, check_id: number, myJson: any) => {
    console.log("Message received from Maracas: " + myJson.message)

    var newOutput =
    {
        title: "",
        summary: ""
    }

    //---Format the Json---
    // Generic declaration
    const nMax = 10
    const n = myJson.delta.breakingChanges.length

    newOutput.title += "This PR introduces " + n + " breaking changes in the base branch." //+ "\nThe request was computed in " + time + " seconds";

    // Detail on the BC
    newOutput.summary += "Here is a list of the breaking changes caused."
    for (let i = 0; i < n; i++) {
        if (i < nMax) {
            newOutput.summary += "\n### The declaration [" + myJson.delta.breakingChanges[i].declaration + "]"
            newOutput.summary += "(" + myJson.delta.breakingChanges[i].url + ")"
            newOutput.summary += " is impacted by _" + myJson.delta.breakingChanges[i].type + "_"

            const nd = myJson.delta.breakingChanges[i].detections.length
            if (nd > 0) {
                newOutput.summary += "\nThis modification produces " + nd + " impacts on clients:"
                for (let j = 0; j < nd; j++)
                    if (j < nMax) {
                        newOutput.summary += "\n- Declaration [" + myJson.delta.breakingChanges[i].detections[j].elem
                        newOutput.summary += "](" + myJson.delta.breakingChanges[i].detections[j].url
                        newOutput.summary += ") in [this client](" + myJson.delta.breakingChanges[i].detections[j].clientUrl + ")"
                    }
            }
        }
    }

    const newCheck =
    {
        status: "completed",
        conclusion: "neutral",
        output: newOutput
    }

    try {
        myOctokit.request("PATCH /repos/" + owner + "/" + repo + "/check-runs/" + check_id, newCheck);
    }
    catch (err) {
        console.error(err)
    }
}

export { progressCheck, updateCheck }