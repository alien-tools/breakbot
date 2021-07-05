import { Octokit } from "@octokit/core";
import { config } from "@probot/octokit-plugin-config"
import { createAppAuth } from "@octokit/auth-app"

export class authDatas {
    baseRepo: string;
    baseBranch: string; //isn't the prId enough ?
    headRepo?: string;
    headBranch: string;
    prNb?: number; // seems to be the number and not the id
    headSHA?: string;
    baseSHA?: string;
    commitSHA?: string;
    installationId?: number;
    myOctokit?: any;
    checkId?: number;

    comment?: boolean;

    constructor() {
        this.baseRepo = ""
        this.baseBranch = ""
        this.headBranch = ""
    };

    updatePr(context: any) { //why is it impossible to have multiple constructors ?
        //this.owner = context.payload.pull_request.base.repo.owner.login

        //fullname is better, to get rid of the owner aspect and be ok with forks
        this.baseRepo = context.payload.pull_request.base.repo.full_name
        this.baseBranch = context.payload.pull_request.base.ref
        this.headRepo = context.payload.pull_request.head.repo.full_name
        this.headBranch = context.payload.pull_request.head.ref

        this.prNb = context.payload.number
        this.headSHA = context.payload.pull_request.head.sha

        this.installationId = context.payload.installation.id

        this.myOctokit = context.octokit
    }

    updateCheck(context: any) {
        // to complete ?
        this.myOctokit = context.octokit

        this.baseRepo = context.payload.repository.full_name
        
        this.headSHA = context.payload.check_run.head_sha

        this.installationId = context.payload.installation.id
    }

    connectToGit(installationId?: number) {
        console.log("[connectToGit] Starting...")

        if (installationId) {
            this.installationId = installationId            
        }
        this.myOctokit = new Octokit({
            authStrategy: createAppAuth,
            auth: {
                appId: process.env.APP_ID,
                privateKey: process.env.PRIVATE_KEY,
                installationId: this.installationId
            },
        });

        console.log("[connectToGit] Done.")
    }

    async getCheck(installationId?: number) {
        console.log("[getCheck] Starting...")

        if (!this.myOctokit) {
            this.connectToGit(installationId)
        }
        else {
            console.log(`[getCheck] I have an octokit: ${this.myOctokit}`)
        }
        
        var branchInfos = await this.myOctokit.request(`GET /repos/${ this.baseRepo }/pulls/${ this.prNb }`)
        
        var branchSHA = branchInfos.data.head.sha

        var resTest = await this.myOctokit.request(`/repos/${this.baseRepo}/commits/${branchSHA}/check-runs`)

        var n = resTest.data.total_count
        const checks = resTest.data.check_runs

        console.log(`[getCheck] Datas received from git about the checks :\ntotal_count: ${n}\nchecks:`)
        console.log(checks)

        const myCheck = checks.find((check: any) => check.app.id == process.env.APP_ID)

        if (myCheck) {
            this.checkId = myCheck.id
            
            console.log("[getCheck] Done.")
        }
        else {
            console.log("[getCheck] No check found.")
        }
    }

    async getConfig(installationId?: number) {
        console.log("[getConfig] Starting...")

        if (!this.myOctokit) {
            this.connectToGit(installationId)
        }

        var addressSplit = this.baseRepo.split("/") 

        const configFile = await config(this.myOctokit).config.get({
            owner: addressSplit[0],
            repo: addressSplit[1],
            path: ".breakbot.yml"
        })

        console.log(`[getConfig] Here is my config file:`)
        console.log(configFile)

        // set config var(s)
        if (configFile.config.comment) { // because ts is not happy :(
            this.comment = true
        }
    }
}