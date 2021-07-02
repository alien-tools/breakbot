import { authDatas } from "./authClass";
import { parseJsonMain } from "./fromatJson";

const progressCheck = async (myDatas: authDatas) => {
    const newCheck =
    {
        status: "in_progress",
        output: {
            title: "Maracas is processing...",
            summary: ""
        }
    }
    try {
        myDatas.myOctokit.request(`PATCH /repos/${myDatas.baseRepo}/check-runs/${myDatas.checkId}`, newCheck);
    }
    catch (err) {
        console.error(err)
    }
}

const updateCheck = async (myDatas: authDatas, myJson: any) => {

    console.log(`[updateCheck] Message received from Maracas: ${myJson.message}`)

    await myDatas.getCheck()
    await myDatas.getConfig()

    var myActions = [{
        label: "Rerun test",
        description: "",
        identifier: "rerun"
    }]

    var newOutput =
    {
        title: "",
        summary: ""
    }

    //---Format the Json---
    // Generic declaration
    const nMax = 10
    const n = myJson.delta.breakingChanges.length

    newOutput.title += `This PR introduces ${n} breaking changes in the base branch.`

    // Detail on the BC
    newOutput.summary += "Here is a list of the breaking changes caused."
    newOutput.summary += parseJsonMain(myJson, nMax)

    const newCheck =
    {
        status: "completed",
        conclusion: "neutral",
        output: newOutput,
        actions: myActions
    }

    try {
        myDatas.myOctokit.request(`PATCH /repos/${myDatas.baseRepo}/check-runs/${myDatas.checkId}`, newCheck);
    }
    catch (err) {
        console.error(err)
    }
}

async function createCheck(myDatas: authDatas) {
    const output =
    {
        title: "Sending request to the api...",
        summary: ""
    }

    const check =
    {
        name: "Breakbot report",
        head_sha: myDatas.headSHA,
        status: "queued",
        output: output
    }

    try {
        const resNewCheck = await myDatas.myOctokit.request(`POST /repos/${myDatas.baseRepo}/check-runs`, check);
        myDatas.checkId = resNewCheck.data.id
    }
    catch (err) {
        console.error(err)
    }

    return myDatas
}

export { progressCheck, updateCheck, createCheck }