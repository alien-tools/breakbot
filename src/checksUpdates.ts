import { authDatas } from "./authClass";
import { formatJsonMain } from "./postReport";

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
    newOutput.summary += formatJsonMain(myJson, nMax)

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

export { progressCheck, updateCheck }