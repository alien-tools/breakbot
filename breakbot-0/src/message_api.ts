const fetch = require('node-fetch');
//const Octokit = require('@octokit/rest');

import { postCheck, postComment } from './post_comment'

import payload from "../test/fixtures/maracas.v1.json";


async function testInteraction(contextPr:any, baseBranch: string) {
    //get the json from file
    const json = payload

    //post comment
    await postComment(json, contextPr, baseBranch)

}

async function pollInteraction(baseBranch: string, user: string, repo: string, prId: number, contextPr: any) {
    var PostSent: boolean = false;
1
    var intervalID: any;

    //shaping the request  /!\ not clean at all /!\
    const destUrl = 'http://anatman.ddns.net:8080/github/pr/' + user + "/" + repo + "/" + prId

    // polling fct
    const poll = async () => {
        fetch(destUrl, { method: 'GET' })
            .then((res: any) => {
                console.log("Status get from " + baseBranch +": " + res.status)
                if (res.status == 200) {
                    clearInterval(intervalID)
                }
                return res.json()
            })
            .then((json: any) => postCheck(json, contextPr))//postComment(json, contextPr, baseBranch))
            .catch((err: any) => {
                console.error(err)
                clearInterval(intervalID)
            })
    }

    // first contact with Maracas
    await fetch(destUrl, { method: 'POST' })
        .then((res: any) => {
            console.log("Status post: " + res.status)
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

async function pushInteraction(user: string, repo: string, prId: number) {
    //shaping the request  /!\ not clean at all /!\
    const destUrl = 'http://anatman.ddns.net:8080/github/pr/' + user + "/" + repo + "/" + prId
    const myUrl = { url: process.env.WEBHOOK_PROXY_URL }

    await fetch(destUrl, {
        method: 'POST',
        body: JSON.stringify(myUrl)
    }).then((res: any) => {
        console.log("Status post: " + res.status)
    })
    .catch((err: any) => {
        console.error(err)
    })
 }

export { pollInteraction, testInteraction, pushInteraction };