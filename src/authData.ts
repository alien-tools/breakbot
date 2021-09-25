import { Octokit } from "@octokit/core"
import { config } from "@probot/octokit-plugin-config"
import { createAppAuth } from "@octokit/auth-app"

export abstract class authData {
    baseRepo: string;
    installationId: number;

    prNb?: number; // seems to be the number and not the id
    headSHA?: string;
    //commitSHA?: string; equivalent to headSHA
    
    myOctokit?: any;
    checkId?: number;

    config?: {
        verbose?: boolean;
        maxDisplayedBC?: number;
        maxDisplayedClients?: number;
        maxDisplayedDetections?: number
    }

    constructor(baseRepo: string, installationId: number) {
        this.baseRepo = baseRepo
        this.installationId = installationId
    };

    async getCheck() {
        console.log("[getCheck] Starting...")

        if (!this.myOctokit) {
            console.log('[getCheck] No octotkit found')
            return
        }
        
        if (this.headSHA == undefined) {
            console.log(`[getCheck] No SHA found`)
            var branchInfos = await this.myOctokit.request(`GET /repos/${this.baseRepo}/pulls/${this.prNb}`)
            console.log(`[getCHeck] Datas: ${branchInfos.datas}`)
            this.headSHA = branchInfos.data.head.sha
            console.log(`[getCheck] SHA received from git: ${this.headSHA}`)
        }

        var resTest = await this.myOctokit.request(`GET /repos/${this.baseRepo}/commits/${this.headSHA}/check-runs`)

        var n = resTest.data.total_count
        const checks = resTest.data.check_runs

        console.log(`[getCheck] Datas received from git about the checks :\ntotal_count: ${n}\nchecks: ${checks}`)

        const myCheck = checks.find((check: any) => check.app.id == process.env.APP_ID)

        if (myCheck) {
            this.checkId = myCheck.id
            
            console.log("[getCheck] Done.")
        }
        else {
            console.log("[getCheck] No check found.") //shall we create a check in this case ?
        }
    }

    async getConfig() {
        console.log("[getConfig] Starting...")

        if (!this.myOctokit) {
            console.log('[getConfig] No octotkit found')
            return
        }

        var addressSplit = this.baseRepo.split("/") 

        const configFile = await config(this.myOctokit).config.get({
            owner: addressSplit[0],
            repo: addressSplit[1],
            path: ".breakbot.yml"
        })

        console.log(`[getConfig] Here is my config file:`)
        console.log(configFile)

        this.config = {}

        if (configFile.config.verbose) {
            this.config.verbose = true
        }

        if ((configFile.config.maxDisplayedBC) && (typeof(configFile.config.maxDisplayedBC) == "number")) {
            this.config.maxDisplayedBC = configFile.config.maxDisplayedBC
        }

        if ((configFile.config.maxDisplayedClients) && (typeof (configFile.config.maxDisplayedClients) == "number")) {
            this.config.maxDisplayedClients = configFile.config.maxDisplayedClients
        }

        if ((configFile.config.maxDisplayedDetections) && (typeof (configFile.config.maxDisplayedDetections) == "number")) {
            this.config.maxDisplayedDetections = configFile.config.maxDisplayedDetections
        }
        // set config var(s)
        
        // ...to complete...
    }
}

export class webhookData extends authData {
    constructor(baseRepo: string, installationId: number, myOctokit: any) {
        super(baseRepo, installationId)
        this.myOctokit = myOctokit
    }

    static fromPr(context: any) {
        var newDatas = new webhookData(context.payload.pull_request.base.repo.full_name, context.payload.installation.id, context.octokit);

        newDatas.headSHA = context.payload.pull_request.head.sha

        newDatas.prNb = context.payload.number

        return newDatas
    }

    static fromCheck(context: any) {
        var newDatas = new webhookData(context.payload.repository.full_name, context.payload.installation.id, context.octokit);

        newDatas.headSHA = context.payload.check_run.head_sha

        // needs prNb

        return newDatas
    }

    async getPrNb() {
        const pullsList = await this.myOctokit.request(`GET /repos/${this.baseRepo}/pulls`)

        const myPull = pullsList.data.find((pull: any) => pull.head.sha == this.headSHA)

        this.prNb = myPull.number
    }
}

export class reportData extends authData {
    static fromPost(baseRepo: string, installationId: number, prNb: number) {
        var newDatas = new reportData(baseRepo, installationId)

        newDatas.prNb = prNb
        
        // needs an octokit

        return newDatas
    }

    async connectToGit() {
        console.log(`[connectToGit] Starting, with set id ${this.installationId}`)

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
}