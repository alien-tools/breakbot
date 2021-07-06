import { webhookDatas, reportDatas } from "./authDatas";
import { parseJsonMain } from "./formatJson";

const inProgress = async (myDatas: webhookDatas) => {
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

const finalUpdate = async (myDatas: reportDatas, myJson: any) => {

    console.log(`[updateCheck] Message received from Maracas: ${myJson.message}`)

    var myActions = [{
        label: "Rerun test",
        description: "",
        identifier: "rerun"
    }]

    var newOutput =
    {
        title: "",
        summary: ""
        //to complete with a text field
    }

    //---Format the Json---
    // Generic declaration
    const nMax = 10

    const parsedJson = parseJsonMain(myJson, nMax)
    newOutput.title += parsedJson[0]

    // Detail on the BC
    newOutput.summary += parsedJson[2]

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

async function createCheck(myDatas: webhookDatas) {
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

export { inProgress, finalUpdate, createCheck }