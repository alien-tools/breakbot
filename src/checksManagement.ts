import { webhookData, reportData } from "./authData";
import { parseJson } from "./formatJson";

export const failed = async (myDatas: webhookData, message: string) => {
    const check = {
        status: "completed",
        conclusion: "cancelled",
        output: {
            title: "Something went wrong",
            summary: message
        }
    }

    try {
        myDatas.myOctokit.request(`PATCH /repos/${myDatas.baseRepo}/check-runs/${myDatas.checkId}`, check);
    }
    catch (err) {
        console.error(err)
    }
}

export const inProgress = async (myDatas: webhookData) => {
    const check = {
        status: "in_progress",
        output: {
            title: "Maracas is processing...",
            summary: ""
        }
    }
    try {
        myDatas.myOctokit.request(`PATCH /repos/${myDatas.baseRepo}/check-runs/${myDatas.checkId}`, check);
    }
    catch (err) {
        console.error(err)
    }
}

export const finalUpdate = async (myDatas: reportData, myJson: any) => {

    console.log(`[updateCheck] Message received from Maracas: ${myJson.message}`)

    var myActions = [{
        label: "Rerun test",
        description: "",
        identifier: "rerun"
    }]

    //---Format the Json---
    // Generic declaration
    var maxBCs = 50
    var maxClients = 50
    var maxDetections = 50
    if (myDatas.config?.maxDisplayedBC) {
        maxBCs = myDatas.config?.maxDisplayedBC
        console.log(`[updateCheck] New max bc: ${maxBCs}`)
    }
    if (myDatas.config?.maxDisplayedClients) {
        maxClients = myDatas.config?.maxDisplayedClients
        console.log(`[updateCheck] New max clients: ${maxClients}`)
    }


    const parsedJson = parseJson(myJson, maxBCs, maxClients, maxDetections)

    var newOutput =
    {
        title: parsedJson[0],
        summary: parsedJson[1],
        text: parsedJson[2]
    }

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

export async function createCheck(myDatas: webhookData) {
    console.log(`[createCheck] Starting...`)

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

    console.log(`[createCheck] Checkid: ${myDatas.checkId}`)

    return myDatas
}