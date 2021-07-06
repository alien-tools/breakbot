import { Octokit } from "@octokit/core";
import { config } from "@probot/octokit-plugin-config"
import { createAppAuth } from "@octokit/auth-app"

export abstract class authDatas {
    baseRepo: string;
    installationId: number;

    prNb?: number; // seems to be the number and not the id
    headSHA?: string;
    //commitSHA?: string; equivalent to headSHA
    
    myOctokit?: any;
    checkId?: number;

    //config
    configAcquired?: boolean;
    comment?: boolean;
    maxDisplayedBC?: number;
    maxDisplayedClients?: number;

    constructor(baseRepo: string, installationId: number) {
        this.baseRepo = baseRepo
        this.installationId = installationId
    };

    private connectToGit(installationId?: number) {
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

        this.configAcquired = true

        // set config var(s)
        if (configFile.config.comment) { // because ts is not happy :(
            this.comment = true
        }
        
        // to complete with the other values
    }
}

export class webhookDatas extends authDatas {
    constructor(baseRepo: string, installationId: number, myOctokit: any) {
        super(baseRepo, installationId)
        this.myOctokit = myOctokit
    }

    static fromPr(context: any) {
        var newDatas = new webhookDatas(context.payload.pull_request.base.repo.full_name, context.payload.installation.id, context.octokit);

        newDatas.headSHA = context.payload.pull_request.head.sha

        newDatas.prNb = context.payload.number

        return newDatas
    }

    static fromCheck(context: any) {
        var newDatas = new webhookDatas(context.payload.repository.full_name, context.payload.installation.id, context.octokit);

        newDatas.headSHA = context.payload.check_run.head_sha

        // needs prNb

        return newDatas
    }

    async getPrNb() {
        const pullsList = await this.myOctokit.request(`get /repos/${this.baseRepo}/pulls`)

        const myPull = pullsList.data.find((pull: any) => pull.head.sha == this.headSHA)

        this.prNb = myPull.number
    }
}

export class reportDatas extends authDatas {
    static fromPost(baseRepo: string, installationId: number, prNb: number) {
        var newDatas = new reportDatas(baseRepo, installationId)

        newDatas.prNb = prNb
        
        // needs an octokit

        return newDatas
    }
}