const fetch = require('node-fetch');
//const Octokit = require('@octokit/rest');

import { postComment } from './post_comment'

import payload from "../test/fixtures/maracas.v1.json";


async function testInteraction(contextPr:any, baseBranch: string) {
    //get the json from file
    const json = payload
    const temp = contextPr.payload.pull_request;

    //post comment
    await postComment(json, contextPr.octokit, baseBranch, temp.user.login, temp.head.repo.name, temp.number)

}

async function pollInteraction(baseBranch: string, user: string, repo: string, prId: number, contextPr: any) {
    var PostSent: boolean = false;
    const temp = contextPr.payload.pull_request;
    
    var intervalID: any;

    //shaping the request  /!\ not clean at all /!\
    const destUrl = process.env.MARACAS_URL + "/" + user + "/" + repo + "/" + prId

    // polling fct
    const poll = async () => {
        fetch(destUrl, { method: 'GET' })
            .then((res: any) => {
                //console.log("Status get" + res.status)
                if (res.status == 200) {
                    clearInterval(intervalID)
                }
                return res.json()
            })
            .then((json: any) => postComment(json, contextPr.octokit, baseBranch, temp.user.login, temp.head.repo.name, temp.number))
            .catch((err: any) => {
                console.error(err)
                clearInterval(intervalID)
            })
    }

    // first contact with Maracas
    await fetch(destUrl, { method: 'POST' })
        .then((res: any) => {
            //console.log("Status post: " + res.status)
            if (res.status == 202) {
                PostSent = true
            }
        })
        .catch((err: any) => {
            console.error(err)
        })
    
    if (PostSent)
        intervalID = setInterval(poll,2*1000)
}

async function pushInteraction(user: string, repo: string, prId: number, installationId: number, baseBranch: string) {
    //shaping the request  /!\ not clean at all /!\
    const destUrl = process.env.MARACAS_URL + "/" + user + "/" + repo + "/" + prId + "?callback=" + process.env.WEBHOOK_PROXY_URL + "/probot/publish"
    const datas = {
        //url: process.env.WEBHOOK_PROXY_URL
        installationId: installationId,
        baseBranch: baseBranch
    }

    await fetch(destUrl, {
        method: 'POST',
        body: JSON.stringify(datas)
    }).then((res: any) => {
        console.log("Status post (push mode): " + res.status)
    })
    .catch((err: any) => {
        console.error(err)
    })
 }

export { pollInteraction, testInteraction, pushInteraction };